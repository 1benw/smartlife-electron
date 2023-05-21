import { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import MenuIcon from '@mui/icons-material/Menu';
import useGlobalStore from './hooks/useGlobalStore';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Devices from './components/Devices';
import Login from './components/Login';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    height: 'calc(100% - 64px)',
  }
}));

function App() {
  const classes = useStyles();
  // Actions
  const init = useGlobalStore(state => state.init);
  const logout = useGlobalStore(state => state.logout);

  // Data
  const loggedIn = useGlobalStore(state => state.loggedIn);

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="App">
      <ToastContainer
        theme="dark"
        position="bottom-center"
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        transition={Slide}
        pauseOnHover={false}
        autoClose={3500}
      />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart Home
          </Typography>
          {loggedIn && <Button color="error" onClick={logout}>Logout</Button>}
        </Toolbar>
      </AppBar>
      <div className={classes.wrapper}>
        {loggedIn ? (
          <Devices />
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
};

export default App;
