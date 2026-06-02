/**
 * Given an array of Expense documents (populated paidBy + splitAmong),
 * returns an array of { from, to, amount } settlement objects.
 *
 * Supports per-member settlement via settledBy[].
 * A member's share is excluded from the calculation once they appear in settledBy.
 */
function calculateBalances(expenses) {
  const net = {}

  for (const exp of expenses) {
    const paidById = exp.paidBy._id ? exp.paidBy._id.toString() : exp.paidBy.toString()
    const share = exp.amount / exp.splitAmong.length
    const settledByIds = new Set(
      (exp.settledBy || []).map((id) => (id._id ? id._id.toString() : id.toString()))
    )

    for (const member of exp.splitAmong) {
      const memberId = member._id ? member._id.toString() : member.toString()
      if (memberId === paidById) continue       // payer's own share — nothing owed
      if (settledByIds.has(memberId)) continue  // already settled individually
      net[paidById] = (net[paidById] || 0) + share
      net[memberId] = (net[memberId] || 0) - share
    }
  }

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
