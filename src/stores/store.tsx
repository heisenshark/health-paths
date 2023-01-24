import create from "zustand";
import { HealthPath, MediaFile } from "../utils/interfaces";
import uuid from "react-native-uuid";
import { Camera, LatLng } from "react-native-maps";
import { getURI } from "../utils/FileSystemManager";
import { headingDistanceTo } from "geolocation-utils";
import { GoogleSignin, User } from "@react-native-google-signin/google-signin";
import auth, { firebase } from "@react-native-firebase/auth";
import { DbUser } from "../config/firebase";

interface MapStore {
  currentMap: HealthPath;
  maps: MapArray;
  addMap: (map: HealthPath) => void;
  setCurrentMap: (map: HealthPath) => void;
  resetCurrentMap: () => void;
  clearMap: () => void;
  getUUID: () => string;
  currentCamera: Camera;
  setCurrentCamera: (camera: Camera) => void;
  getCurrentMediaURI: (media: MediaFile) => string;
  navAction: () => void | null;
  setNavAction: (action: () => void | null) => void;
  executeNavAction: () => void;
  notSaved: boolean;
  setNotSaved: (saved: boolean) => void;
}

interface MapArray {
  [key: string]: HealthPath;
}

interface LocationTrackingStore {
  locations: { coords: LatLng[] };
  addLocations: (location: LatLng[], timestamp: number) => void;
  clearLocations: () => void;
  outputLocations: LatLng[];
  testobject: { test: string[] };
  currentLine: {
    start: LatLng;
    end: LatLng;
    distance: number;
    headingDelta: number;
    headingLast: number;
  };
  currentRecording: {
    distance: number;
  };
  highestTimestamp: number;
  setHighestTimestamp: (timestamp: number) => void;
  getOutputLocations: () => LatLng[];
}

interface UserStore {
  user: User | undefined;
  logIn: () => Promise<void>;
  logOut: () => Promise<void>;
  checkLogged: () => Promise<boolean>;
}
export const useMapStore = create<MapStore>((set, get) => ({
  currentMap: {
    name: "",
    map_id: "",
    description: "",
    location: "",
    waypoints: [],
    stops: [],
  } as HealthPath,
  maps: {
    map1: {
      name: "kato trasa",
      map_id: "1",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as HealthPath,
  } as MapArray,
  addMap: (map: HealthPath) => {
    set((state) => {
      const map_id = uuid.v4().toString();
      if (map.map_id === undefined || map.map_id === "") map.map_id = map_id;
      state.maps[map.map_id] = map;
      console.log(state.maps);

      return { maps: { ...state.maps } };
    });
  },
  setCurrentMap: (map: HealthPath) =>
    set(() => {
      if (map === undefined)
        return {
          currentMap: {
            name: "",
            map_id: "",
            description: "",
            location: "",
            waypoints: [],
            stops: [],
          },
        };
      if (map.map_id === undefined || map.map_id === "") map.map_id = uuid.v4().toString();
      return { currentMap: map };
    }),
  resetCurrentMap: () => {
    set(() => ({
      currentMap: {
        name: "nienazwana mapa",
        map_id: uuid.v4().toString(),
        description: "opis",
        location: "",
        waypoints: [],
        stops: [],
      },
    }));
  },
  getUUID: () => uuid.v4().toString(),
  currentCamera: {
    center: { latitude: 51.60859530883762, longitude: 14.77514784783125 },
    heading: 0,
    pitch: 0,
    zoom: 5.757617473602295,
  } as Camera,
  setCurrentCamera: (camera: Camera) => set(() => ({ currentCamera: camera })),
  getCurrentMediaURI: (media: MediaFile) => {
    const state = get();
    console.log("mediauri:::" + getURI(state.currentMap, media));
    return getURI(state.currentMap, media);
  },
  clearMap: () =>
    set(() => ({
      currentMap: { name: "", map_id: "", description: "", location: "", waypoints: [], stops: [] },
    })),
  notSaved: false,
  setNotSaved: (saved: boolean) => set(() => ({ notSaved: saved })),

  navAction: null,
  setNavAction: (action: () => void | null) => set(() => ({ navAction: action })),
  executeNavAction: () => {
    const state = get();
    const action = state.navAction;
    set(() => ({
      navAction: null,
      currentMap: {
        name: "",
        map_id: "",
        description: "",
        location: "",
        waypoints: [],
        stops: [],
      },
      notSaved: false,
    }));
    if (action) action();
  },
}));

export const useLocationTrackingStore = create<LocationTrackingStore>((set, get) => ({
  locations: { coords: [] },
  addLocations: (location: LatLng[], timestamp: number) => {
    //function is optimizing the path generation by removing points that are in a straight line
    //or are close to each other
    set((state) => {
      const line = state.currentLine;
      let recDistance = 0;
      if (location.length === 0) return {};
      if (line.start === undefined) {
        line.start = line.end = location[0];
        line.distance = line.headingDelta = 0;
        line.headingLast = undefined;
        console.log(line);
      }

      for (let i = 0; i < location.length; i++) {
        let hdt = headingDistanceTo(line.end, location[i]);
        if (hdt.distance <= 1) {
          continue;
        }
        if (line.headingLast === undefined) {
          //when the line does have only one point
          line.headingLast = hdt.heading;
          line.headingDelta = 0;
          line.end = location[i];
          continue;
        }
        line.headingDelta += hdt.heading - line.headingLast;
        if (
          Math.abs(line.headingDelta) > 5 ||
          Math.abs(line.headingLast - hdt.heading) > 2.5 ||
          // line.distance > 100
          false
        ) {
          //end line and start new one
          recDistance += line.distance;
          console.log(line, "new line");
          state.locations.coords.push(line.start);
          line.start = line.end;
          line.end = location[i];
          line.distance = line.headingDelta = 0;
        }
        line.headingLast = hdt.heading;

        console.log("hdt    ", hdt, line.distance);
        line.distance += hdt.distance;
        recDistance += hdt.distance;
        line.end = location[i];
      }

      // state.locations.coords.push(...location);
      // state.locations
      //   ? state.locations.push(location as LatLng)
      //   : (state.locations = [location as LatLng]);
      return {
        locations: { coords: state.locations.coords },
        outputLocations: [...state.locations.coords, line.start, line.end],
        currentLine: {
          start: line.start,
          end: line.end,
          distance: line.distance,
          headingDelta: line.headingDelta,
          headingLast: line.headingLast,
        },
        currentRecording: {
          distance: state.currentRecording.distance + recDistance,
        },
        highestTimestamp: timestamp,
      };
    });
  },
  clearLocations: () => {
    set(() => {
      return {
        locations: { coords: [] },
        outputLocations: [],
        currentLine: {
          start: undefined,
          end: undefined,
          distance: 0,
          headingDelta: undefined,
          headingLast: undefined,
        },
        currentRecording: {
          distance: 0,
        },
      };
    });
  },
  testobject: { test: ["test1", "test2"] },
  outputLocations: [],
  getOutputLocations: () => {
    const state = get();
    return state.outputLocations;
  },
  currentLine: {
    start: undefined,
    end: undefined,
    distance: 0,
    headingDelta: undefined,
    headingLast: undefined,
  },
  currentRecording: {
    distance: 0,
  },
  highestTimestamp: 0,
  setHighestTimestamp: (timestamp: number) => {
    set((state) => {
      return { highestTimestamp: timestamp };
    });
  },
}));

export const useUserStore = create<UserStore>((set, get) => ({
  user: undefined,
  logIn: async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await GoogleSignin.clearCachedAccessToken(idToken);
      await GoogleSignin.getTokens();
      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);
      const usr = await GoogleSignin.getCurrentUser();
      set(() => ({ user: usr }));
    } catch (e) {
      console.log(e);
      return;
    }
  },
  logOut: async () => {
    set(() => {
      GoogleSignin.signOut();
      firebase.auth().signOut();
      return { user: undefined };
    });
  },
  checkLogged: async () => {
    const usr = DbUser();
    if (!usr) set(() => ({ user: undefined }));
    return usr == undefined;
  },
}));
