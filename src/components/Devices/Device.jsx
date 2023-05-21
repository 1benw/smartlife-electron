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
import { makeStyles, useTheme } from '@mui/styles';
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
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Hook Methods
  const doDeviceAction = useGlobalStore(state => state.doDeviceAction);
  const refreshDeviceListForced = useGlobalStore(state => state.refreshDeviceListForced);
  const updateDeviceData = useGlobalStore(state => state.updateDeviceData);

  const [brightness, setBrightness] = useState(100);
  const [colorTemp, setColorTemp] = useState(5000);

  useEffect(() => {
    if (device.data.brightness) {
      setBrightness(parseInt(device.data.brightness) / 10);
    };
  }, [device.data.brightness]);

  useEffect(() => {
    if (device.data.color_temp) {
      setColorTemp(((device.data.color_temp - 1000) / 4.033) + 1000);
    };
  }, [device.data.color_temp]);

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

  const changeLightColorTemp = async () => {
    setLoading(true);

    const success = await doDeviceAction(device.id, "colorTemperatureSet", "value", colorTemp);
    if (success) {
      const refreshed = await refreshDeviceListForced();

      if (!refreshed) {
        updateDeviceData(device.id, {
          online: true,
          state: "true",
          color_temp: ((colorTemp - 1000) * 4.033) + 1000,
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
              {device.data.color_temp && <Grid item xs={12} className={classes.cardActions} sx={{ padding: '0 20px' }}>
                <Slider
                  aria-label="Color Temp."
                  min={1000}
                  max={10000}
                  value={colorTemp}
                  onChange={e => setColorTemp(e.target.value)}
                  onChangeCommitted={changeLightColorTemp}
                  disabled={loading}
                  marks={[
                    {
                      value: 1000,
                      label: '2700K',
                    },
                    {
                      value: 10000,
                      label: '6500K',
                    },
                  ]}
                  sx={{
                    color: '#00000000 !important',
                    height: '6px !important',
                    '& .MuiSlider-track': {
                      border: 'none',
                    },
                    '& .MuiSlider-thumb': {
                      backgroundColor: theme.palette.primary.light,
                      border: `2px solid ${theme.palette.primary.main}`,
                      '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                        boxShadow: 'inherit',
                      },
                      '&:before': {
                        display: 'none',
                      },
                    },
                    '& .MuiSlider-markLabel': {
                      color: theme.palette.text.secondary,
                    },
                    '& .MuiSlider-markLabelActive': {
                      color: theme.palette.text.secondary,
                    },
                    '& .MuiSlider-rail': {
                      background: 'linear-gradient(0.25turn, #f69d3c, #ebf8e1, #3f87a6)',
                    },
                  }}
                />
              </Grid>}
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