import { create } from "zustand";
import { toast } from "react-toastify";

function getAPIEndpoint(region, path) {
  return `https://px1.tuya${region}.com/homeassistant/${path}`;
}

async function handleLogin(region, username, password) {
  const url = getAPIEndpoint(region, "auth.do");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        userName: username,
        password: password,
        countryCode: region === "eu" ? "44" : "1",
        bizType: "smart_life",
        from: "tuya",
      }).toString(),
    });

    const data = await res.json();

    if (res.status === 200 && data?.access_token && data?.expires_in) {
      const expiresAt = Date.now() + data.expires_in * 1000;
      window.electron.store.set("access_token", data.access_token);
      window.electron.store.set("refresh_token", data.refresh_token);
      window.electron.store.set("token_type", data.token_type);
      window.electron.store.set(
        "expires_at",
        Date.now() + data.expires_in * 1000
      );
      window.electron.store.set("region", region);

      return {
        ...data,
        region,
        expires_at: expiresAt,
      };
    }
  } catch (e) {}

  return false;
}

async function handleRefreshToken(region, refreshToken) {
  const url = getAPIEndpoint(region, "access.do");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        rand: Math.random(), // Not sure Why?
      }).toString(),
    });

    const data = await res.json();

    if (res.status === 200 && data?.access_token && data?.expires_in) {
      const expiresAt = Date.now() + data.expires_in * 1000;
      window.electron.store.set("access_token", data.access_token);
      window.electron.store.set("refresh_token", data.refresh_token);
      window.electron.store.set("token_type", data.token_type);
      window.electron.store.set("expires_at", expiresAt);
      window.electron.store.set("region", region);

      return {
        ...data,
        region,
        expires_at: expiresAt,
      };
    }
  } catch (e) {}

  return false;
}

async function getDeviceList(region, accessToken) {
  const url = getAPIEndpoint(region, "skill");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        header: {
          name: "Discovery",
          namespace: "discovery",
          payloadVersion: 1,
        },
        payload: {
          accessToken: accessToken,
        },
      }),
    });

    const data = await res.json();

    if (
      res.status === 200 &&
      data?.header?.code === "SUCCESS" &&
      data?.payload?.devices
    ) {
      return data.payload.devices;
    }
  } catch (e) {}

  return false;
}

async function doDeviceAction(
  region,
  accessToken,
  deviceId,
  actionType,
  valueName,
  newState
) {
  const url = getAPIEndpoint(region, "skill");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        header: {
          name: actionType,
          namespace: "control",
          payloadVersion: 1,
        },
        payload: {
          accessToken: accessToken,
          devId: deviceId,
          [valueName]: newState,
        },
      }),
    });

    const data = await res.json();

    if (res.status === 200 && data?.header?.code === "SUCCESS") {
      return true;
    }
  } catch (e) {}

  return false;
}

function clearUserRelatedStorage() {
  window.electron.store.delete("access_token");
  window.electron.store.delete("refresh_token");
  window.electron.store.delete("token_type");
  window.electron.store.delete("expires_at");
  window.electron.store.delete("region");
  window.electron.store.delete("device_list");
  window.electron.store.delete("device_list_time");
}

const initialState = {
  initialized: false,
  auth: null,
};

const useGlobalStore = create((set, get) => ({
  ...initialState,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    const storedAccessToken = window.electron.store.get("access_token");
    const storedAccessExpiry = window.electron.store.get("expires_at");

    if (
      storedAccessToken &&
      storedAccessExpiry &&
      storedAccessExpiry > Date.now()
    ) {
      set({
        auth: {
          access_token: storedAccessToken,
          expires_at: storedAccessExpiry,
          refresh_token: window.electron.store.get("refresh_token"),
          token_type: window.electron.store.get("token_type"),
          region: window.electron.store.get("region"),
        },
        loggedIn: true,
      });

      const tokenRefresh = await get().refreshAccessToken();
      if (tokenRefresh) {
        const deviceRefresh = await get().refreshDeviceList();
        if (!deviceRefresh) {
          toast.error("Unable to Refresh Device List, Using Cache Instead");

          const cached = window.electron.store.get("device_list");
          if (cached) {
            set({ deviceList: cached });
          }
        }

        console.log("Device List", get().deviceList);
      } else {
        set({
          auth: null,
          loggedIn: false,
        });

        clearUserRelatedStorage();
      }
    }
  },
  login: async (username, password, region) => {
    if (!username || username.length < 3) {
      toast.error("Invalid Username");
      return false;
    }

    if (!password || password.length < 3) {
      toast.error("Invalid Password");
      return false;
    }

    if (!["eu", "us"].includes(region)) {
      toast.error("Invalid Region");
      return false;
    }

    const success = await handleLogin(region, username, password);
    if (success) {
      set({
        auth: {
          access_token: success.access_token,
          expires_at: success.expires_at,
          refresh_token: success.refresh_token,
          token_type: success.token_type,
          region: success.region,
        },
        loggedIn: true,
      });

      const deviceRefresh = await get().refreshDeviceList();
      if (!deviceRefresh) {
        toast.error("Unable to Refresh Device List");
      }
    }

    return success;
  },
  logout: () => {
    set({
      auth: null,
      loggedIn: false,
    });

    clearUserRelatedStorage();
  },
  refreshAccessToken: async () => {
    const auth = get().auth;
    if (!auth) return;

    const newData = await handleRefreshToken(
      get().auth.region,
      get().auth.refresh_token
    );

    if (newData) {
      set({
        auth: newData,
      });

      return true;
    }
    return false;
  },
  refreshDeviceList: async () => {
    // Get the latest device list
    const auth = get().auth;
    if (!auth) return;

    const data = await getDeviceList(auth.region, auth.access_token);
    if (data) {
      window.electron.store.set("device_list", data);
      window.electron.store.set("device_list_time", Date.now());

      set({ deviceList: data });
      return data;
    }
  },
  refreshDeviceListForced: async () => {
    // If you refresh the token, you can get the newest device list sooner than the default
    const tokenRefresh = await get().refreshAccessToken();
    if (tokenRefresh) {
      const deviceRefresh = await get().refreshDeviceList();
      return !!deviceRefresh;
    }
    return false;
  },
  updateDeviceData: async (deviceId, partial) => {
    // If getting the latest device list isn't possible (rate limits), update the device data with its new state
    const auth = get().auth;
    if (!auth) return;

    const deviceList = get().deviceList;
    if (!deviceList) return;

    const deviceIndex = deviceList.findIndex(
      (device) => device.id === deviceId
    );

    deviceList[deviceIndex] = {
      ...deviceList[deviceIndex],
      data: {
        ...deviceList[deviceIndex].data,
        ...partial,
      },
    };

    set({ deviceList: [...deviceList] });
  },
  doDeviceAction: async (deviceId, actionType, valueName, newState) => {
    const auth = get().auth;
    if (!auth) return;

    return await doDeviceAction(
      auth.region,
      auth.access_token,
      deviceId,
      actionType,
      valueName,
      newState
    );
  },
}));

export default useGlobalStore;
