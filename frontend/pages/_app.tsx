import { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A84FF', // Apple Blue
    },
    secondary: {
      main: '#FF9F0A', // A warm accent color
    },
    background: {
      default: '#1C1C1E', // Dark gray background, matching Holistic base
      paper: '#2C2C30', // Slightly lighter gray for cards/papers, from Apple System Fill Color (Quaternary)
    },
    text: {
      primary: '#FFFFFF', // White text (Label Color)
      secondary: '#98989F', // Secondary Label Color
    },
    success: {
      main: '#32D74B', // Apple Green
    },
    error: {
      main: '#FF453A', // Apple Red
    },
    info: {
      main: '#64D3EB', // Apple Teal for informational elements
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "SF Pro Text", sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1C1C1E', // Match background default
          boxShadow: 'none', // No shadow for sleek look
          borderBottom: '1px solid #3A3A3C', // Subtle bottom border
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Rounded corners
          backgroundColor: '#2C2C30', // Use paper background color
          boxShadow: 'none', // Remove box shadow
          border: '1px solid #3A3A3C', // Subtle border as seen in Holistic design
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#3A3A3C', // Slightly darker input field background
            '& fieldset': {
              borderColor: 'transparent !important', // Remove border from TextField
            },
            '&:hover fieldset': {
              borderColor: 'transparent !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'transparent !important',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#98989F', // Placeholder text color
          },
          '& .MuiInputBase-input': {
            color: '#FFFFFF', // Input text color
          },
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const navItems = [
    { label: 'Portfolio', path: '/' },
    { label: 'Insights', path: '/insights' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Portfolio Manager
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                href={item.path}
                sx={{
                  fontWeight: router.pathname === item.path ? 'bold' : 'normal',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Component {...pageProps} />
    </ThemeProvider>
  );
} 