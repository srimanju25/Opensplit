const express = require('express')
const Expense = require('../models/Expense')
const Group = require('../models/Group')
const calculateBalances = require('../utils/balanceCalc')
const protect = require('../middleware/auth')

const router = express.Router()

// POST /api/expenses  — add expense
router.post('/', protect, async (req, res) => {
  const { description, amount, groupId, splitAmong } = req.body
  if (!description || !amount || !groupId || !splitAmong?.length)
    return res.status(400).json({ message: 'description, amount, groupId, splitAmong are required' })

  const group = await Group.findById(groupId)
  if (!group) return res.status(404).json({ message: 'Group not found' })
  if (!group.members.some((m) => m.equals(req.user._id)))
    return res.status(403).json({ message: 'Not a member of this group' })

  const expense = await Expense.create({
    description,
    amount,
    paidBy: req.user._id,
    splitAmong,
    groupId,
  })
  await expense.populate('paidBy', 'name email')
  await expense.populate('splitAmong', 'name email')
  res.status(201).json(expense)
})

// GET /api/expenses/:groupId  — list expenses for a group
router.get('/:groupId', protect, async (req, res) => {
  const group = await Group.findById(req.params.groupId)
  if (!group) return res.status(404).json({ message: 'Group not found' })
  if (!group.members.some((m) => m.equals(req.user._id)))
    return res.status(403).json({ message: 'Not a member of this group' })

  const expenses = await Expense.find({ groupId: req.params.groupId })
    .populate('paidBy', 'name email')
    .populate('splitAmong', 'name email')
    .sort('-date')
  res.json(expenses)
})

// GET /api/expenses/:groupId/balances  — calculated settlements
router.get('/:groupId/balances', protect, async (req, res) => {
  const group = await Group.findById(req.params.groupId).populate('members', 'name email')
  if (!group) return res.status(404).json({ message: 'Group not found' })
  if (!group.members.some((m) => m._id.equals(req.user._id)))
    return res.status(403).json({ message: 'Not a member of this group' })

  const expenses = await Expense.find({ groupId: req.params.groupId })
    .populate('paidBy', 'name email')
    .populate('splitAmong', 'name email')

  const settlements = calculateBalances(expenses)

  // Enrich with user names
  const memberMap = {}
  for (const m of group.members) memberMap[m._id.toString()] = m

  const enriched = settlements.map((s) => ({
    from: memberMap[s.from] || { _id: s.from, name: 'Unknown' },
    to: memberMap[s.to] || { _id: s.to, name: 'Unknown' },
    amount: s.amount,
  }))

  res.json(enriched)
})

// PATCH /api/expenses/:id/settle  — mark entire expense as settled
router.patch('/:id/settle', protect, async (req, res) => {
  const expense = await Expense.findById(req.params.id)
  if (!expense) return res.status(404).json({ message: 'Expense not found' })

  expense.settled = true
  await expense.save()
  res.json({ message: 'Expense marked as settled', expense })
})

// PATCH /api/expenses/:id/settle-member  — mark one member's share as settled
router.patch('/:id/settle-member', protect, async (req, res) => {
  const { userId } = req.body
  if (!userId) return res.status(400).json({ message: 'userId is required' })

  const expense = await Expense.findById(req.params.id)
    .populate('paidBy', 'name email')
    .populate('splitAmong', 'name email')
    .populate('settledBy', 'name email')
  if (!expense) return res.status(404).json({ message: 'Expense not found' })

  const alreadySettled = expense.settledBy.some((u) => u._id.toString() === userId)
  if (!alreadySettled) {
    expense.settledBy.push(userId)
  }

  // Auto-mark whole expense settled when all non-payer members have settled
  const paidById = expense.paidBy._id.toString()
  const nonPayerMembers = expense.splitAmong.filter((m) => m._id.toString() !== paidById)
  const settledIds = expense.settledBy.map((u) => u._id ? u._id.toString() : u.toString())
  const allSettled = nonPayerMembers.every((m) => settledIds.includes(m._id.toString()))
  if (allSettled) expense.settled = true

  await expense.save()
  await expense.populate('settledBy', 'name email')
  res.json(expense)
})

module.exports = router
