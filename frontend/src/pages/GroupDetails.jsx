import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function GroupDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [memberEmail, setMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = () => {
    api.get(`/groups/${id}`).then(({ data }) => setGroup(data))
    api.get(`/expenses/${id}`).then(({ data }) => setExpenses(data))
    api.get(`/expenses/${id}/balances`).then(({ data }) => setBalances(data))
  }

  useEffect(() => { fetchAll() }, [id])

  const addMember = async (e) => {
    e.preventDefault()
    setError('')
    setAddingMember(true)
    try {
      const { data } = await api.post(`/groups/${id}/members`, { email: memberEmail })
      setGroup(data)
      setMemberEmail('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add member')
    } finally {
      setAddingMember(false)
    }
  }

  if (!group) return <div className="page"><p className="muted">Loading…</p></div>

  return (
    <div className="page">
      <div className="page-header">
        <h2>{group.groupName}</h2>
        <Link to={`/groups/${id}/add-expense`} className="btn-primary">+ Add Expense</Link>
      </div>

      <div className="two-col">
        <section className="card">
          <h3>Members ({group.members.length})</h3>
          <ul className="member-list">
            {group.members.map((m) => (
              <li key={m._id}>
                <span className="avatar">{m.name[0].toUpperCase()}</span>
                <span>{m.name}</span>
                {m._id === group.createdBy._id && <span className="badge">admin</span>}
              </li>
            ))}
          </ul>
          {group.createdBy._id === user?._id && (
            <form className="inline-form" onSubmit={addMember} style={{ marginTop: '1rem' }}>
              {error && <p className="error-msg">{error}</p>}
              <input
                type="email"
                placeholder="Add member by email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <button type="submit" disabled={addingMember}>
                {addingMember ? '…' : 'Add'}
              </button>
            </form>
          )}
        </section>

        <section className="card">
          <h3>Settlements Needed</h3>
          {balances.length === 0 ? (
            <p className="muted">All settled up!</p>
          ) : (
            <ul className="settlement-list">
              {balances.map((b, i) => (
                <li key={i}>
                  <span className="owe-from">{b.from.name}</span>
                  <span className="arrow"> → </span>
                  <span className="owe-to">{b.to.name}</span>
                  <span className="amount">₹{b.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to={`/groups/${id}/settle`} className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Settle Payments
          </Link>
        </section>
      </div>

      <section>
        <h3>Recent Expenses</h3>
        {expenses.length === 0 ? (
          <p className="muted">No expenses yet.</p>
        ) : (
          <div className="expense-list">
            {expenses.slice(0, 5).map((exp) => (
              <div key={exp._id} className={`expense-item ${exp.settled ? 'settled' : ''}`}>
                <div>
                  <strong>{exp.description}</strong>
                  <p className="muted small">Paid by {exp.paidBy.name} · {new Date(exp.date).toLocaleDateString()}</p>
                </div>
                <div className="expense-amount">₹{exp.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
        <Link to={`/groups/${id}/history`} className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          View All Expenses
        </Link>
      </section>
    </div>
  )
}
