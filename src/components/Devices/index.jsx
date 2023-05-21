import { Grid, Card, CardContent, Typography, CardActions, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';

import Device from './Device';
import useGlobalStore from '../../hooks/useGlobalStore';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: '20px',
    width: '100%',
    height: '100%',
    overflowX: "hidden",
    overflowY: "auto",
  },
}));

export default function Devices() {
  const classes = useStyles();
  const devices = useGlobalStore(state => state.deviceList);

  return <div className={classes.wrapper}>
    <Grid container spacing={2}>
      {devices?.map(device => <Device key={device.id} device={device} />)}
    </Grid>
  </div>
};