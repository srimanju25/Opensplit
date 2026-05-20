const express = require('express')
const Group = require('../models/Group')
const User = require('../models/User')
const protect = require('../middleware/auth')

const router = express.Router()

// POST /api/groups  — create group
router.post('/', protect, async (req, res) => {
  const { groupName } = req.body
  if (!groupName) return res.status(400).json({ message: 'Group name is required' })

  const group = await Group.create({
    groupName,
    members: [req.user._id],
    createdBy: req.user._id,
  })
  res.status(201).json(group)
})

// GET /api/groups  — list groups the user belongs to
router.get('/', protect, async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate('members', 'name email')
    .populate('createdBy', 'name email')
  res.json(groups)
})

// GET /api/groups/:id
router.get('/:id', protect, async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members', 'name email')
    .populate('createdBy', 'name email')
  if (!group) return res.status(404).json({ message: 'Group not found' })
  if (!group.members.some((m) => m._id.equals(req.user._id)))
    return res.status(403).json({ message: 'Not a member of this group' })
  res.json(group)
})

// POST /api/groups/:id/members  — add member by email
router.post('/:id/members', protect, async (req, res) => {
  const { email } = req.body
  const group = await Group.findById(req.params.id)
  if (!group) return res.status(404).json({ message: 'Group not found' })
  if (!group.createdBy.equals(req.user._id))
    return res.status(403).json({ message: 'Only the group creator can add members' })

  const newMember = await User.findOne({ email })
  if (!newMember) return res.status(404).json({ message: 'No user with that email' })
  if (group.members.includes(newMember._id))
    return res.status(409).json({ message: 'User already in group' })

  group.members.push(newMember._id)
  await group.save()
  await group.populate('members', 'name email')
  res.json(group)
})

module.exports = router
