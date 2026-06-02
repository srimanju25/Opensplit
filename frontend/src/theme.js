import { createTheme, responsiveFontSizes } from '@mui/material/styles'

export function buildTheme(mode) {
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#4f46e5',
        light: '#818cf8',
        dark: '#3730a3',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0d9488',
        light: '#2dd4bf',
        dark: '#0f766e',
        contrastText: '#ffffff',
      },
      error: { main: '#e53e3e' },
      success: { main: '#38a169' },
      warning: { main: '#d97706' },
      background: {
        default: mode === 'light' ? '#f5f7fa' : '#0f172a',
        paper:   mode === 'light' ? '#ffffff'  : '#1e293b',
      },
      text: {
        primary:   mode === 'light' ? '#1a202c' : '#f1f5f9',
        secondary: mode === 'light' ? '#718096' : '#94a3b8',
      },
    },

    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
    },

    shape: { borderRadius: 10 },

    components: {
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          fullWidth: true,
          size: 'medium',
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
          variant: 'contained',
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
          sizeLarge: {
            padding: '12px 28px',
            fontSize: '1rem',
          },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 12,
          }),
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
        },
      },

      MuiFab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600 },
        },
      },

      MuiAlert: {
        defaultProps: { variant: 'standard' },
      },

      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 12 },
        },
      },
    },
  })

  theme = responsiveFontSizes(theme)
  return theme
}
