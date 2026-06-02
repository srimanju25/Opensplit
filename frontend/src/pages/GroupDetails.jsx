import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  Container, Typography, Box, Tabs, Tab, Avatar, Chip,
  List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  IconButton, Button, TextField, Alert, Collapse, Paper,
  CircularProgress, Divider, Stack
} from '@mui/material'
import {
  ArrowBack, Add, PersonAdd, CheckCircle, ReceiptLong, AccountBalance
} from '@mui/icons-material'
import FloatingChatbot from '../components/FloatingChatbot'

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null
}

export default function GroupDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [memberEmail, setMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [memberError, setMemberError] = useState('')
  const [tab, setTab] = useState(0)

  const fetchAll = () => {
    api.get(`/groups/${id}`).then(({ data }) => setGroup(data))
    api.get(`/expenses/${id}`).then(({ data }) => setExpenses(data))
    api.get(`/expenses/${id}/balances`).then(({ data }) => setBalances(data))
  }

  useEffect(() => { fetchAll() }, [id])

  const addMember = async (e) => {
    e.preventDefault()
    setMemberError('')
    setAddingMember(true)
    try {
      const { data } = await api.post(`/groups/${id}/members`, { email: memberEmail })
      setGroup(data)
      setMemberEmail('')
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Could not add member')
    } finally {
      setAddingMember(false)
    }
  }

  if (!group) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  const isAdmin = group.createdBy._id === user?._id

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate('/dashboard')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {group.groupName}
        </Typography>
        <Button
          component={Link}
          to={`/groups/${id}/add-expense`}
          startIcon={<Add />}
          size="small"
        >
          Add Expense
        </Button>
      </Stack>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<ReceiptLong fontSize="small" />} iconPosition="start" label="Overview" />
          <Tab icon={<PersonAdd fontSize="small" />} iconPosition="start" label={`Members (${group.members.length})`} />
          <Tab icon={<AccountBalance fontSize="small" />} iconPosition="start" label="Balances" />
        </Tabs>

        {/* Tab 0 — Overview */}
        <TabPanel value={tab} index={0}>
          <Box sx={{ px: 2, pb: 2 }}>
            {expenses.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No expenses yet. Add the first one!
              </Typography>
            ) : (
              <List disablePadding>
                {expenses.slice(0, 5).map((exp, i) => (
                  <Box key={exp._id}>
                    <ListItem
                      disablePadding
                      sx={{ py: 1, opacity: exp.settled ? 0.55 : 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.85rem' }}>
                          {exp.paidBy.name[0].toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={exp.description}
                        secondary={`Paid by ${exp.paidBy.name} · ${new Date(exp.date).toLocaleDateString()}`}
                      />
                      <Typography variant="subtitle1" color="primary" fontWeight={700}>
                        ₹{exp.amount.toFixed(2)}
                      </Typography>
                    </ListItem>
                    {i < Math.min(expenses.length, 5) - 1 && <Divider component="li" />}
                  </Box>
                ))}
              </List>
            )}
            <Button
              component={Link}
              to={`/groups/${id}/history`}
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              startIcon={<ReceiptLong />}
            >
              View All Expenses
            </Button>
          </Box>
        </TabPanel>

        {/* Tab 1 — Members */}
        <TabPanel value={tab} index={1}>
          <Box sx={{ px: 2, pb: 2 }}>
            <List disablePadding>
              {group.members.map((m, i) => (
                <Box key={m._id}>
                  <ListItem disablePadding sx={{ py: 0.75 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: '0.85rem' }}>
                        {m.name[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={m.name} />
                    {m._id === group.createdBy._id && (
                      <Chip label="admin" size="small" color="primary" variant="outlined" />
                    )}
                  </ListItem>
                  {i < group.members.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>

            {isAdmin && (
              <Box component="form" onSubmit={addMember} sx={{ mt: 2 }}>
                <Collapse in={!!memberError}>
                  <Alert severity="error" sx={{ mb: 1.5 }}>{memberError}</Alert>
                </Collapse>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Add member by email"
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    type="submit"
                    disabled={addingMember || !memberEmail.trim()}
                    startIcon={addingMember ? <CircularProgress size={16} color="inherit" /> : <PersonAdd />}
                  >
                    Add
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Tab 2 — Balances */}
        <TabPanel value={tab} index={2}>
          <Box sx={{ px: 2, pb: 2 }}>
            {balances.length === 0 ? (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
                Everyone is settled up!
              </Alert>
            ) : (
              <List disablePadding sx={{ mb: 2 }}>
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
                      <Chip label="Owes" color="error" size="small" variant="outlined" />
                    </ListItem>
                    {i < balances.length - 1 && <Divider component="li" />}
                  </Box>
                ))}
              </List>
            )}
            <Button
              component={Link}
              to={`/groups/${id}/settle`}
              startIcon={<AccountBalance />}
              color="success"
            >
              Settle Payments
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      <FloatingChatbot groupId={id} />
    </Container>
  )
}
