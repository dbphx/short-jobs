import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6C63FF',
      light: '#9D97FF',
      dark: '#4A42CC',
    },
    secondary: {
      main: '#FF6B9D',
      light: '#FF9DC0',
      dark: '#CC4470',
    },
    background: {
      default: '#0F0E17',
      paper: '#1A1929',
    },
    success: {
      main: '#2CB67D',
    },
    warning: {
      main: '#FFB84D',
    },
    error: {
      main: '#E53170',
    },
    text: {
      primary: '#FFFFFE',
      secondary: '#94A1B2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.95rem',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6C63FF 0%, #9D97FF 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5A52E0 0%, #8B85F0 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(26, 25, 41, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(108, 99, 255, 0.1)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(108, 99, 255, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 14, 23, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(108, 99, 255, 0.1)',
        },
      },
    },
  },
});

export default theme;
