import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function ExpenseHistory() {
  const { id } = useParams()
  const [expenses, setExpenses] = useState([])
  const [group, setGroup] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get(`/groups/${id}`).then(({ data }) => setGroup(data))
    api.get(`/expenses/${id}`).then(({ data }) => setExpenses(data))
  }, [id])

  const filtered = expenses.filter((e) => {
    if (filter === 'settled') return e.settled
    if (filter === 'unsettled') return !e.settled
    return true
  })

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="page">
      <div className="page-header">
        <h2>Expense History — {group?.groupName}</h2>
        <Link to={`/groups/${id}`} className="btn-secondary">← Back</Link>
      </div>

      <div className="filter-bar">
        {['all', 'unsettled', 'settled'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="muted" style={{ marginLeft: 'auto' }}>
          Total: <strong>₹{total.toFixed(2)}</strong>
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="muted">No expenses to show.</p>
      ) : (
        <div className="expense-list">
          {filtered.map((exp) => (
            <div key={exp._id} className={`expense-item ${exp.settled ? 'settled' : ''}`}>
              <div>
                <strong>{exp.description}</strong>
                <p className="muted small">
                  Paid by {exp.paidBy.name} · Split among {exp.splitAmong.map((m) => m.name).join(', ')}
                </p>
                <p className="muted small">{new Date(exp.date).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="expense-amount">₹{exp.amount.toFixed(2)}</div>
                {exp.settled && <span className="badge green">Settled</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
