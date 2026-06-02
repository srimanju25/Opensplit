import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  Container, Typography, Box, Paper, Stack, IconButton,
  List, ListItem, ListItemAvatar, ListItemText, Avatar,
  Button, Alert, Snackbar, Divider, CircularProgress, Chip
} from '@mui/material'
import { ArrowBack, CheckCircleOutlined } from '@mui/icons-material'
import FloatingChatbot from '../components/FloatingChatbot'

export default function Settlement() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [settling, setSettling] = useState(null) // "expenseId-userId"
  const [snackbar, setSnackbar] = useState(false)

  const fetchAll = () => {
    api.get(`/groups/${id}`).then(({ data }) => setGroup(data))
    api.get(`/expenses/${id}`).then(({ data }) => setExpenses(data))
    api.get(`/expenses/${id}/balances`).then(({ data }) => setBalances(data))
  }

  useEffect(() => { fetchAll() }, [id])

  const settleMember = async (expenseId, userId) => {
    const key = `${expenseId}-${userId}`
    setSettling(key)
    try {
      await api.patch(`/expenses/${expenseId}/settle-member`, { userId })
      setSnackbar(true)
      fetchAll()
    } catch (err) {
      console.error('settle-member error:', err.response?.data || err.message)
      alert(err.response?.data?.message || 'Failed to mark as paid. Check console.')
    } finally {
      setSettling(null)
    }
  }

  // Only show expenses that are not fully settled
  const unsettledExpenses = expenses.filter((e) => !e.settled)

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(`/groups/${id}`)}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h5">Settle Up</Typography>
          <Typography variant="body2" color="text.secondary">{group?.groupName}</Typography>
        </Box>
      </Stack>

      {/* Who Owes Whom */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Who Owes Whom</Typography>
        {balances.length === 0 ? (
          <Alert severity="success" icon={<CheckCircleOutlined />}>
            Everyone is settled up!
          </Alert>
        ) : (
          <List disablePadding>
            {balances.map((b, i) => (
              <Box key={i}>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.light', color: 'error.dark', width: 36, height: 36, fontSize: '0.85rem' }}>
                      {b.from.name[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box component="span">
                        <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>{b.from.name}</Box>
                        {' owes '}
                        <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>{b.to.name}</Box>
                      </Box>
                    }
                    secondary={`₹${b.amount.toFixed(2)}`}
                  />
                </ListItem>
                {i < balances.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Per-expense individual settlement */}
      <Typography variant="h6" gutterBottom>Mark Individual Payments</Typography>
      {unsettledExpenses.length === 0 ? (
        <Alert severity="info">No unsettled expenses.</Alert>
      ) : (
        <Stack spacing={2}>
          {unsettledExpenses.map((exp) => {
            const paidById = exp.paidBy._id
            const share = (exp.amount / exp.splitAmong.length).toFixed(2)
            const settledByIds = new Set((exp.settledBy || []).map((u) => u._id?.toString() || u.toString()))

            // Only show members who still owe (exclude payer)
            const debtors = exp.splitAmong.filter((m) => m._id !== paidById)

            return (
              <Paper key={exp._id} variant="outlined" sx={{ p: 2 }}>
                {/* Expense header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{exp.description}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total ₹{exp.amount.toFixed(2)} · Paid by {exp.paidBy.name}
                    </Typography>
                  </Box>
                  <Chip label={`₹${share} / person`} size="small" variant="outlined" />
                </Stack>

                <Divider sx={{ mb: 1.5 }} />

                {/* Per-member rows */}
                <Stack spacing={1}>
                  {debtors.map((member) => {
                    const isSettled = settledByIds.has(member._id?.toString() || member._id)
                    const key = `${exp._id}-${member._id}`

                    return (
                      <Stack
                        key={member._id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{
                            width: 30, height: 30, fontSize: '0.75rem',
                            bgcolor: isSettled ? 'success.light' : 'warning.light',
                            color: isSettled ? 'success.dark' : 'warning.dark',
                          }}>
                            {member.name[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">{member.name}</Typography>
                          <Typography variant="body2" color="text.secondary">₹{share}</Typography>
                        </Stack>

                        {isSettled ? (
                          <Chip
                            label="Paid"
                            color="success"
                            size="small"
                            icon={<CheckCircleOutlined />}
                          />
                        ) : (
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => settleMember(exp._id, member._id)}
                            disabled={settling === key}
                            startIcon={
                              settling === key
                                ? <CircularProgress size={12} color="inherit" />
                                : null
                            }
                          >
                            {settling === key ? 'Saving…' : 'Mark Paid'}
                          </Button>
                        )}
                      </Stack>
                    )
                  })}
                </Stack>
              </Paper>
            )
          })}
        </Stack>
      )}

      <Snackbar
        open={snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar(false)}>
          Payment marked!
        </Alert>
      </Snackbar>
      <FloatingChatbot groupId={id} />
    </Container>
  )
}
