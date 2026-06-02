const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    settled: { type: Boolean, default: false },
    settledBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Expense', expenseSchema)
