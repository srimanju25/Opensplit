import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Settlement() {
  const { id } = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [settling, setSettling] = useState(null)
  const [message, setMessage] = useState('')

  const fetchAll = () => {
    api.get(`/groups/${id}`).then(({ data }) => setGroup(data))
    api.get(`/expenses/${id}`).then(({ data }) => setExpenses(data.filter((e) => !e.settled)))
    api.get(`/expenses/${id}/balances`).then(({ data }) => setBalances(data))
  }

  useEffect(() => { fetchAll() }, [id])

  const settleExpense = async (expenseId) => {
    setSettling(expenseId)
    try {
      await api.patch(`/expenses/${expenseId}/settle`)
      setMessage('Expense settled!')
      fetchAll()
    } finally {
      setSettling(null)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Settle Up — {group?.groupName}</h2>
        <Link to={`/groups/${id}`} className="btn-secondary">← Back</Link>
      </div>

      {message && <p className="success-msg">{message}</p>}

      <section className="card">
        <h3>Who Owes Whom</h3>
        {balances.length === 0 ? (
          <p className="muted">Everyone is settled up!</p>
        ) : (
          <ul className="settlement-list large">
            {balances.map((b, i) => (
              <li key={i}>
                <span className="owe-from">{b.from.name}</span>
                <span className="arrow"> owes </span>
                <span className="owe-to">{b.to.name}</span>
                <span className="amount">₹{b.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Mark Expenses as Settled</h3>
        {expenses.length === 0 ? (
          <p className="muted">No unsettled expenses.</p>
        ) : (
          <div className="expense-list">
            {expenses.map((exp) => (
              <div key={exp._id} className="expense-item">
                <div>
                  <strong>{exp.description}</strong>
                  <p className="muted small">
                    ₹{exp.amount.toFixed(2)} · Paid by {exp.paidBy.name}
                  </p>
                </div>
                <button
                  className="btn-settle"
                  onClick={() => settleExpense(exp._id)}
                  disabled={settling === exp._id}
                >
                  {settling === exp._id ? '…' : 'Mark Settled'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
