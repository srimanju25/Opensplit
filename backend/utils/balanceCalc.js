/**
 * Given an array of Expense documents (populated paidBy + splitAmong),
 * returns an array of { from, to, amount } settlement objects.
 *
 * Algorithm:
 *   1. Compute net balance per user (credits - debits).
 *   2. Greedily pair the largest creditor with the largest debtor.
 */
function calculateBalances(expenses) {
  const net = {}

  for (const exp of expenses) {
    if (exp.settled) continue
    const paidById = exp.paidBy._id ? exp.paidBy._id.toString() : exp.paidBy.toString()
    const share = exp.amount / exp.splitAmong.length

    net[paidById] = (net[paidById] || 0) + exp.amount

    for (const member of exp.splitAmong) {
      const memberId = member._id ? member._id.toString() : member.toString()
      net[memberId] = (net[memberId] || 0) - share
    }
  }

  // Build creditor / debtor heaps (sorted arrays)
  const creditors = []
  const debtors = []

  for (const [userId, balance] of Object.entries(net)) {
    if (balance > 0.001) creditors.push({ userId, amount: balance })
    else if (balance < -0.001) debtors.push({ userId, amount: -balance })
  }

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const settlements = []

  while (creditors.length && debtors.length) {
    const creditor = creditors[0]
    const debtor = debtors[0]
    const settle = Math.min(creditor.amount, debtor.amount)

    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: Math.round(settle * 100) / 100,
    })

    creditor.amount -= settle
    debtor.amount -= settle

    if (creditor.amount < 0.001) creditors.shift()
    if (debtor.amount < 0.001) debtors.shift()
  }

  return settlements
}

module.exports = calculateBalances
