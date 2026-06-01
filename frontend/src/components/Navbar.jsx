import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ darkMode, toggleDark }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="nav-brand">OpenSplit</Link>
      <div className="nav-actions">
        <button className="icon-btn" onClick={toggleDark} title="Toggle dark mode">
          {darkMode ? '☀️' : '🌙'}
        </button>
        {user && (
          <>
            <span className="nav-user">{user.name}</span>
            <button className="btn-secondary small" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}
