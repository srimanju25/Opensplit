const express = require('express')
const Expense = require('../models/Expense')
const Group = require('../models/Group')
const calculateBalances = require('../utils/balanceCalc')
const protect = require('../middleware/auth')

const router = express.Router()

// Keyword-based micro-chatbot — no external API needed
function microGPT(message, { group, expenses, settlements }) {
  const msg = message.toLowerCase().trim()
  const memberNames = group.members.map((m) => m.name)

  // Find if a member name is mentioned in the message
  const mentioned = memberNames.find((n) => msg.includes(n.toLowerCase()))

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const unsettled = expenses.filter((e) => !e.settled)
  const settled = expenses.filter((e) => e.settled)

  // --- Greeting ---
  if (/^(hi|hello|hey|howdy|sup|good morning|good evening|what'?s up)/.test(msg)) {
    return (
      `Hi! I can help you with "${group.groupName}" expenses.\n` +
      `Try asking:\n` +
      `• Who owes what?\n` +
      `• What's pending?\n` +
      `• How much has been spent?\n` +
      `• Tell me about [member name]`
    )
  }

  // --- Help ---
  if (msg.includes('help') || msg === '?' || msg.includes('what can you')) {
    return (
      `I can answer questions about "${group.groupName}":\n` +
      `• "Who owes what?" — show all balances\n` +
      `• "What does [name] owe?" — specific person\n` +
      `• "What's pending?" — unsettled expenses\n` +
      `• "What's settled?" — completed payments\n` +
      `• "Total spent?" — expense summary\n` +
      `• "Who are the members?" — list members\n` +
      `• "[expense name]" — details of an expense`
    )
  }

  // --- Who owes whom / Balances ---
  const isBalanceQuery =
    msg.includes('owe') ||
    msg.includes('balance') ||
    msg.includes('pay back') ||
    msg.includes('payback') ||
    msg.includes('pay whom') ||
    msg.includes('summary') ||
    msg.includes('settlement') ||
    (msg.includes('who') && msg.includes('pay'))

  if (isBalanceQuery) {
    if (settlements.length === 0) {
      return `Everyone in "${group.groupName}" is settled up! No pending payments. 🎉`
    }

    if (mentioned) {
      const owes = settlements.filter((s) => s.from.toLowerCase() === mentioned.toLowerCase())
      const owed = settlements.filter((s) => s.to.toLowerCase() === mentioned.toLowerCase())
      const parts = []
      if (owes.length > 0) {
        parts.push(
          `${mentioned} owes:\n` + owes.map((s) => `  • ₹${s.amount.toFixed(2)} to ${s.to}`).join('\n')
        )
      }
      if (owed.length > 0) {
        parts.push(
          `${mentioned} is owed:\n` + owed.map((s) => `  • ₹${s.amount.toFixed(2)} from ${s.from}`).join('\n')
        )
      }
      if (parts.length === 0) return `${mentioned} is fully settled up — no pending payments!`
      return parts.join('\n\n')
    }

    // All balances
    return (
      `Pending payments in "${group.groupName}":\n` +
      settlements.map((s) => `• ${s.from} → ${s.to}: ₹${s.amount.toFixed(2)}`).join('\n')
    )
  }

  // --- Pending / unsettled ---
  if (
    msg.includes('pending') ||
    msg.includes('unsettled') ||
    msg.includes('not paid') ||
    msg.includes('not settled') ||
    msg.includes('remaining') ||
    msg.includes('outstanding')
  ) {
    if (unsettled.length === 0) return 'Great news! All expenses in this group are settled.'
    return (
      `${unsettled.length} pending expense(s):\n` +
      unsettled
        .map((e) => `• "${e.description}" — ₹${e.amount.toFixed(2)} (paid by ${e.paidBy.name})`)
        .join('\n')
    )
  }

  // --- Settled ---
  if (
    (msg.includes('settled') || msg.includes('completed') || msg.includes('done') || msg.includes('paid')) &&
    !isBalanceQuery
  ) {
    if (settled.length === 0) return 'No expenses are fully settled yet.'
    return (
      `${settled.length} settled expense(s):\n` +
      settled.map((e) => `• "${e.description}" — ₹${e.amount.toFixed(2)}`).join('\n')
    )
  }

  // --- Total / how much spent ---
  if (
    msg.includes('total') ||
    msg.includes('how much') ||
    msg.includes('spent') ||
    msg.includes('amount') ||
    msg.includes('expense') ||
    msg.includes('cost')
  ) {
    const settledTotal = settled.reduce((sum, e) => sum + e.amount, 0)
    const pendingTotal = unsettled.reduce((sum, e) => sum + e.amount, 0)
    return (
      `Expense summary for "${group.groupName}":\n` +
      `• Total: ₹${totalSpent.toFixed(2)}\n` +
      `• Settled: ₹${settledTotal.toFixed(2)}\n` +
      `• Pending: ₹${pendingTotal.toFixed(2)}\n` +
      `• ${expenses.length} expense(s) total`
    )
  }

  // --- Members ---
  if (
    msg.includes('member') ||
    msg.includes('who is in') ||
    msg.includes('who are in') ||
    msg.includes('group member') ||
    msg.includes('people in')
  ) {
    return (
      `Members of "${group.groupName}" (${group.members.length}):\n` +
      memberNames.map((n) => `• ${n}`).join('\n')
    )
  }

  // --- Specific member summary ---
  if (mentioned) {
    const paid = expenses.filter((e) => e.paidBy.name.toLowerCase() === mentioned.toLowerCase())
    const paidTotal = paid.reduce((sum, e) => sum + e.amount, 0)
    const owes = settlements.filter((s) => s.from.toLowerCase() === mentioned.toLowerCase())
    const owesTotal = owes.reduce((sum, s) => sum + s.amount, 0)
    const isOwed = settlements.filter((s) => s.to.toLowerCase() === mentioned.toLowerCase())
    const isOwedTotal = isOwed.reduce((sum, s) => sum + s.amount, 0)

    const lines = [`About ${mentioned}:`]
    if (paid.length > 0) lines.push(`Paid for ${paid.length} expense(s) — ₹${paidTotal.toFixed(2)} total`)
    else lines.push('Has not paid for any expense')
    if (owesTotal > 0) lines.push(`Still owes ₹${owesTotal.toFixed(2)}`)
    else lines.push('Owes nothing (settled up)')
    if (isOwedTotal > 0) lines.push(`Is owed ₹${isOwedTotal.toFixed(2)} by others`)

    return lines.join('\n• ')
  }

  // --- Match expense by description keyword ---
  const matchedExpense = expenses.find((e) =>
    e.description.toLowerCase().split(' ').some((word) => word.length > 3 && msg.includes(word))
  )
  if (matchedExpense) {
    const share = (matchedExpense.amount / matchedExpense.splitAmong.length).toFixed(2)
    return (
      `"${matchedExpense.description}":\n` +
      `• Amount: ₹${matchedExpense.amount.toFixed(2)}\n` +
      `• Paid by: ${matchedExpense.paidBy.name}\n` +
      `• Split among: ${matchedExpense.splitAmong.map((m) => m.name).join(', ')} (₹${share} each)\n` +
      `• Status: ${matchedExpense.settled ? 'Settled' : 'Pending'}`
    )
  }

  // --- Fallback: general summary ---
  return (
    `Here's a quick summary of "${group.groupName}":\n` +
    `• ${expenses.length} expense(s) — ₹${totalSpent.toFixed(2)} total\n` +
    `• ${unsettled.length} pending, ${settled.length} settled\n` +
    `• ${settlements.length > 0 ? settlements.length + ' pending payment(s)' : 'All payments settled!'}\n\n` +
    `Ask me: "who owes what", "what's pending", "total spent", or a member's name.`
  )
}

// POST /api/chat/:groupId
router.post('/:groupId', protect, async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ message: 'message is required' })

  const group = await Group.findById(req.params.groupId).populate('members', 'name email')
  if (!group) return res.status(404).json({ message: 'Group not found' })
  if (!group.members.some((m) => m._id.equals(req.user._id)))
    return res.status(403).json({ message: 'Not a member of this group' })

  const expenses = await Expense.find({ groupId: req.params.groupId })
    .populate('paidBy', 'name email')
    .populate('splitAmong', 'name email')
    .populate('settledBy', 'name email')

  const rawSettlements = calculateBalances(expenses)
  const memberMap = {}
  for (const m of group.members) memberMap[m._id.toString()] = m

  const settlements = rawSettlements.map((s) => ({
    from: memberMap[s.from]?.name || 'Unknown',
    to: memberMap[s.to]?.name || 'Unknown',
    amount: s.amount,
  }))

  const reply = microGPT(message, { group, expenses, settlements })
  res.json({ reply })
})

module.exports = router
