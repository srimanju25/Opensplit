import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  Container, Typography, Box, Grid, Card, CardActionArea,
  CardContent, Avatar, Fab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button,
  CircularProgress, Alert, Skeleton
} from '@mui/material'
import { Add, Group } from '@mui/icons-material'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    api.get('/groups').then(({ data }) => setGroups(data)).finally(() => setLoading(false))
  }, [])

  const createGroup = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setCreating(true)
    setError('')
    try {
      const { data } = await api.post('/groups', { groupName })
      setGroups([data, ...groups])
      setGroupName('')
      setDialogOpen(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  const groupColors = ['#4f46e5', '#0d9488', '#d97706', '#e53e3e', '#7c3aed', '#0284c7']

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5">Welcome back, {user?.name}!</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your shared expenses and groups below.
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      ) : groups.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Group sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No groups yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first group to start splitting expenses
          </Typography>
          <Button startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Create a Group
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {groups.map((g, i) => (
            <Grid item xs={12} sm={6} md={4} key={g._id}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea
                  onClick={() => navigate(`/groups/${g._id}`)}
                  sx={{ height: '100%', p: 0.5 }}
                >
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: groupColors[i % groupColors.length],
                        mb: 1.5,
                        width: 44,
                        height: 44,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                      }}
                    >
                      {g.groupName[0].toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" gutterBottom noWrap>
                      {g.groupName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {g.members.length} member{g.members.length !== 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created by {g.createdBy.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        variant="extended"
        color="primary"
        onClick={() => setDialogOpen(true)}
        sx={{ position: 'fixed', bottom: 32, right: 32, gap: 1 }}
      >
        <Add />
        New Group
      </Fab>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setError(''); setGroupName('') }}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={createGroup}>
          <DialogTitle>Create a New Group</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              label="Group name"
              placeholder="e.g. Goa Trip, Hostel Room 4"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              variant="text"
              onClick={() => { setDialogOpen(false); setError(''); setGroupName('') }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !groupName.trim()}
              startIcon={creating ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  )
}
