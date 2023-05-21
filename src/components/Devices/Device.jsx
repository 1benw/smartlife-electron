import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  CircularProgress,
  Badge,
  Box,
  Fab,
  Slider,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';

import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import useGlobalStore from '../../hooks/useGlobalStore';

const useStyles = makeStyles((theme) => ({
  cardContent: {
    paddingTop: '0 !important',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}));

export default function Device({ device }) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);

  // Hook Methods
  const doDeviceAction = useGlobalStore(state => state.doDeviceAction);
  const refreshDeviceListForced = useGlobalStore(state => state.refreshDeviceListForced);
  const updateDeviceData = useGlobalStore(state => state.updateDeviceData);

  const [brightness, setBrightness] = useState(100);

  useEffect(() => {
    if (device.data.brightness) {
      setBrightness(parseInt(device.data.brightness) / 10)
    };
  }, [device.data.brightness]);

  const toggleLightState = async () => {
    setLoading(true);
    let newState = 0;
    if (device.data?.state === "false") {
      newState = 1;
    }

    const success = await doDeviceAction(device.id, "turnOnOff", "value", newState)
    if (success) {
      const refreshed = await refreshDeviceListForced();

      if (!refreshed) {
        updateDeviceData(device.id, {
          online: true,
          state: newState === 1 ? "true" : "false",
        });
      }
    } else {
      toast.error("Failed to Send Interaction");
    }

    setLoading(false);
  };

  const changeLightBrightness = async () => {
    setLoading(true);

    const success = await doDeviceAction(device.id, "brightnessSet", "value", brightness)
    if (success) {
      const refreshed = await refreshDeviceListForced();

      if (!refreshed) {
        updateDeviceData(device.id, {
          online: true,
          state: "true",
          brightness: (brightness * 10).toString(),
        });
      }
    } else {
      toast.error("Failed to Send Interaction");
    }

    setLoading(false);
  };

  const getDeviceActions = () => {
    switch (device.dev_type) {
      case 'light':
        let stateColor = "error";
        if (device.data?.state === "true") {
          stateColor = "success";
        };

        return (
          <CardActions className={classes.cardActions}>
            <Grid container>
              <Grid item xs={12} className={classes.cardActions}>
                <Box sx={{ m: 1, position: 'relative' }}>
                  <Fab
                    color={stateColor}
                    aria-label="power"
                    onClick={toggleLightState}
                    disabled={loading}
                  >
                    <PowerSettingsNewIcon />
                  </Fab>
                  {loading && <CircularProgress
                    size={68}
                    color={stateColor}
                    sx={{
                      position: 'absolute',
                      top: -6,
                      left: -6,
                      zIndex: 1,
                    }}
                  />}
                </Box>
              </Grid>
              <Grid item xs={12} className={classes.cardActions} sx={{ padding: '0 20px' }}>
                <Slider
                  aria-label="Brightness"
                  min={11}
                  max={100}
                  value={brightness}
                  color="primary"
                  onChange={e => setBrightness(e.target.value)}
                  onChangeCommitted={changeLightBrightness}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </CardActions>
        );
      default:
        return null;
    };
  };

  return <Grid item xs={12} sm={6} md={4}>
    <Card>
      <Badge sx={{ width: '95%' }} variant="dot" color={device.data?.online ? "success" : "error"} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} />
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" component="div" align="center">
          {device.name}
        </Typography>
      </CardContent>
      {getDeviceActions()}
    </Card>
  </Grid>
};