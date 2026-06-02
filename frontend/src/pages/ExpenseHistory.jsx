import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  Container, Typography, Box, Stack, IconButton, Chip,
  List, ListItem, ListItemText, Divider, Alert, Button, Tooltip
} from '@mui/material'
import { ArrowBack, Download } from '@mui/icons-material'

export default function ExpenseHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState([])
  const [group, setGroup] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get(`/groups/${id}`).then(({ data }) => setGroup(data))
    api.get(`/expenses/${id}`).then(({ data }) => setExpenses(data))
  }, [id])

  const filtered = expenses.filter((e) => {
    if (filter === 'settled') return e.settled
    if (filter === 'unsettled') return !e.settled
    return true
  })

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'unsettled', label: 'Unsettled', color: 'warning' },
    { key: 'settled', label: 'Settled', color: 'success' },
  ]

  const downloadCSV = () => {
    const headers = ['Description', 'Amount (Rs)', 'Paid By', 'Split Among', 'Date', 'Status']
    const rows = filtered.map((e) => [
      e.description,
      e.amount.toFixed(2),
      e.paidBy.name,
      e.splitAmong.map((m) => m.name).join(' | '),
      new Date(e.date).toLocaleDateString(),
      e.settled ? 'Settled' : 'Unsettled',
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${group?.groupName || 'expenses'}-expenses.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(`/groups/${id}`)}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5">Expense History</Typography>
          <Typography variant="body2" color="text.secondary">{group?.groupName}</Typography>
        </Box>
        <Tooltip title="Download as CSV">
          <span>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={downloadCSV}
              disabled={filtered.length === 0}
            >
              CSV
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* Filter bar */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
        {filterOptions.map(({ key, label, color }) => (
          <Chip
            key={key}
            label={label}
            clickable
            color={filter === key ? (color || 'primary') : 'default'}
            variant={filter === key ? 'filled' : 'outlined'}
            onClick={() => setFilter(key)}
          />
        ))}
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            Total: <strong>₹{total.toFixed(2)}</strong>
          </Typography>
        </Box>
      </Stack>

      {filtered.length === 0 ? (
        <Alert severity="info">No expenses to show for this filter.</Alert>
      ) : (
        <List disablePadding sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {filtered.map((exp, i) => (
            <Box key={exp._id} sx={{ opacity: exp.settled ? 0.6 : 1 }}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <Box textAlign="right">
                    <Typography variant="subtitle1" color="primary" fontWeight={700}>
                      ₹{exp.amount.toFixed(2)}
                    </Typography>
                    {exp.settled && (
                      <Chip label="Settled" color="success" size="small" sx={{ mt: 0.5 }} />
                    )}
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={600}>{exp.description}</Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" component="span">
                        Paid by {exp.paidBy.name} · Split among {exp.splitAmong.map((m) => m.name).join(', ')}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary" component="span">
                        {new Date(exp.date).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {i < filtered.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      )}
    </Container>
  )
}
