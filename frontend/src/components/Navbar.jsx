import { AppBar, Toolbar, Typography, Box, IconButton, Button, Tooltip } from '@mui/material'
import { DarkMode, LightMode, Logout } from '@mui/icons-material'
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
    <AppBar position="sticky" color="inherit">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/dashboard"
          sx={{ fontWeight: 800, color: 'primary.main', textDecoration: 'none' }}
        >
          OpenSplit
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={toggleDark} sx={{ mr: 1 }}>
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        {user && (
          <>
            <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
              {user.name}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}
