import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  Container, Typography, Box, Paper, TextField, Button,
  FormGroup, FormControlLabel, Checkbox, Alert, Collapse,
  Chip, Stack, IconButton, CircularProgress, InputAdornment
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

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

  if (!group) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  const perPerson =
    form.splitAmong.length > 0 && form.amount
      ? (parseFloat(form.amount) / form.splitAmong.length).toFixed(2)
      : null

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(`/groups/${id}`)}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h5">Add Expense</Typography>
          <Typography variant="body2" color="text.secondary">{group.groupName}</Typography>
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Description"
            placeholder="e.g. Dinner at restaurant"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />

          <TextField
            label="Amount"
            type="number"
            inputProps={{ min: '0.01', step: '0.01' }}
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>Paid by</Typography>
            <Chip
              label={`${group.members.find((m) => m._id === user?._id)?.name || user?.name} (you)`}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>Split among</Typography>
            <FormGroup>
              {group.members.map((m) => (
                <FormControlLabel
                  key={m._id}
                  control={
                    <Checkbox
                      checked={form.splitAmong.includes(m._id)}
                      onChange={() => toggleMember(m._id)}
                      color="primary"
                    />
                  }
                  label={m.name}
                />
              ))}
            </FormGroup>
          </Box>

          {perPerson && (
            <Alert severity="info" icon={false}>
              Each person pays <strong>₹{perPerson}</strong>
            </Alert>
          )}

          <Button
            type="submit"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Adding…' : 'Add Expense'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
