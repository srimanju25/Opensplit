import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/groups').then(({ data }) => setGroups(data)).finally(() => setLoading(false))
  }, [])

  const createGroup = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post('/groups', { groupName })
      setGroups([data, ...groups])
      setGroupName('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Welcome, {user?.name}</h2>
      </div>

      <section className="card">
        <h3>Create a New Group</h3>
        {error && <p className="error-msg">{error}</p>}
        <form className="inline-form" onSubmit={createGroup}>
          <input
            placeholder="e.g. Goa Trip, Hostel Room 4"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Creating…' : '+ Create'}
          </button>
        </form>
      </section>

      <section>
        <h3>Your Groups</h3>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : groups.length === 0 ? (
          <p className="muted">No groups yet. Create one above!</p>
        ) : (
          <div className="group-grid">
            {groups.map((g) => (
              <div
                key={g._id}
                className="group-card"
                onClick={() => navigate(`/groups/${g._id}`)}
              >
                <h4>{g.groupName}</h4>
                <p className="muted">{g.members.length} member{g.members.length !== 1 ? 's' : ''}</p>
                <p className="muted small">Created by {g.createdBy.name}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
