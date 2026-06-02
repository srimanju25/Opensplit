import { useState, useRef, useEffect } from 'react'
import api from '../api/axios'
import {
  Fab, Paper, Box, Typography, TextField, IconButton,
  CircularProgress, Divider
} from '@mui/material'
import { Chat, Close, Send, SmartToy } from '@mui/icons-material'

export default function FloatingChatbot({ groupId }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your split assistant. Ask me who owes what, what's pending, or anything about this group's expenses." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    try {
      const { data } = await api.post(`/chat/${groupId}`, { message: text })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Sorry, could not get a response. Please try again.'
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            width: 320,
            height: 420,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy sx={{ fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1 }}>
              Split Assistant
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white', p: 0.5 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Divider />

          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {messages.map((msg, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Box
                  sx={{
                    maxWidth: '82%',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'action.hover',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {msg.content}
                  </Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <CircularProgress size={14} />
                </Box>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          <Divider />

          <Box component="form" onSubmit={send} sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Ask about expenses…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              fullWidth
              autoComplete="off"
              disabled={loading}
            />
            <IconButton type="submit" color="primary" disabled={!input.trim() || loading} size="small">
              <Send fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      <Fab
        color="primary"
        onClick={() => setOpen((o) => !o)}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}
        title="Split Assistant"
      >
        {open ? <Close /> : <Chat />}
      </Fab>
    </>
  )
}
