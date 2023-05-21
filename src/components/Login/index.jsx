import { useState } from 'react';
import { Grid, Card, CardContent, TextField, FormControl, Select, MenuItem, InputLabel, Button, Typography, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useGlobalStore from '../../hooks/useGlobalStore';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    height: '100%',
    padding: '10% 10%',
  }
}));

const initialState = {
  username: "",
  password: "",
  region: "eu",
};

export default function Login() {
  const classes = useStyles();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const login = useGlobalStore(state => state.login);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onLogin = async () => {
    setLoading(true);

    const success = await login(formData.username, formData.password, formData.region);
    if (!success) {
      setLoading(false);

      setFormData({ ...formData, password: '' });
    }
  };

  return <div className={classes.wrapper}>
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" component="div" align="center">
              Login
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              id="username"
              name="username"
              label="Username/Email"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="password"
              fullWidth
              required
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel id="region">Region</InputLabel>
              <Select
                id="region"
                name="region"
                value={formData.region}
                label="Region"
                onChange={handleInputChange}
                disabled={loading}
              >
                <MenuItem value="eu">EU</MenuItem>
                <MenuItem value="us">US</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" disabled={loading} color="primary" fullWidth onClick={onLogin}>
              {!loading ? (
                <>Login</>
              ) : (
                <CircularProgress size={24} />
              )}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </div>
};