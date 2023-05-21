import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './styles/global.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.5)',
            transition: 'background ease-in 0.15s',
            borderRadius: '2.5px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#ffffff17',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
        },
        body: {
          backgroundColor: '#0b0a0a',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          margin: '0',
          height: '100vh',
          width: '100vw',
          borderRadius: 10,
          overflow: 'hidden',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

postMessage({ payload: 'removeLoading' }, '*');
