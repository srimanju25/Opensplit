import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function AddExpense() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [form, setForm] = useState({ description: '', amount: '', splitAmong: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/groups/${id}`).then(({ data }) => {
      setGroup(data)
      setForm((f) => ({ ...f, splitAmong: data.members.map((m) => m._id) }))
    })
  }, [id])

  const toggleMember = (memberId) => {
    setForm((f) => ({
      ...f,
      splitAmong: f.splitAmong.includes(memberId)
        ? f.splitAmong.filter((m) => m !== memberId)
        : [...f.splitAmong, memberId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.splitAmong.length === 0) {
      setError('Select at least one person to split with')
      return
    }
    setLoading(true)
    try {
      await api.post('/expenses', {
        description: form.description,
        amount: parseFloat(form.amount),
        groupId: id,
        splitAmong: form.splitAmong,
      })
      navigate(`/groups/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  if (!group) return <div className="page"><p className="muted">Loading…</p></div>

  const perPerson =
    form.splitAmong.length > 0 && form.amount
      ? (parseFloat(form.amount) / form.splitAmong.length).toFixed(2)
      : '0.00'

  return (
    <div className="page">
      <div className="page-header">
        <h2>Add Expense — {group.groupName}</h2>
      </div>
      <div className="card" style={{ maxWidth: '520px' }}>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Description</label>
          <input
            placeholder="e.g. Dinner at restaurant"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <label>Amount (₹)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <label>Paid by</label>
          <p className="muted">{group.members.find((m) => m._id === user?._id)?.name || user?.name} (you)</p>

          <label>Split among</label>
          <div className="member-checkboxes">
            {group.members.map((m) => (
              <label key={m._id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.splitAmong.includes(m._id)}
                  onChange={() => toggleMember(m._id)}
                />
                {m.name}
              </label>
            ))}
          </div>

          {form.amount && form.splitAmong.length > 0 && (
            <p className="split-preview">
              Each person pays <strong>₹{perPerson}</strong>
            </p>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: '1.5rem', width: '100%' }}>
            {loading ? 'Adding…' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
