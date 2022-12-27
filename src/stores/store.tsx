import create from "zustand";
import { HealthPath } from "../utils/interfaces";
import uuid from "react-native-uuid";
import { Camera, LatLng } from "react-native-maps";
import { getURI } from "../utils/FileSystemManager";
import { headingDistanceTo } from "geolocation-utils";

interface MapStore {
  currentMap: HealthPath;
  maps: MapArray;
  addMap: (map: HealthPath) => void;
  setCurrentMap: (map: HealthPath) => void;
  getUUID: () => string;
  currentCamera: Camera;
  setCurrentCamera: (camera: Camera) => void;
  getCurrentMediaURI: (mediaId: string) => void;

  locations: { coords: LatLng[] };
  addLocations: (location: LatLng[]) => void;
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
}

interface MapArray {
  [key: string]: HealthPath;
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
  setCurrentMap: (map: HealthPath) => set(() => ({ currentMap: map })),
  getUUID: () => uuid.v4().toString(),
  currentCamera: {
    center: { latitude: 51.60859530883762, longitude: 14.77514784783125 },
    heading: 0,
    pitch: 0,
    zoom: 5.757617473602295,
  } as Camera,
  setCurrentCamera: (camera: Camera) => set(() => ({ currentCamera: camera })),
  getCurrentMediaURI: (mediaId: MediaFile) => {
    const state = get();
    console.log("mediauri:::" + getURI(state.currentMap, mediaId));
    return getURI(state.currentMap, mediaId);
  },
  locations: { coords: [] },
  addLocations: (location: LatLng[]) => {
    set((state) => {
      // console.log(state);

      const line = state.currentLine;
      let recDistance = 0;
      console.log("one pieceee");
      if (location.length === 0) return;
      if (line.start === undefined) {
        line.start = location[0];
        line.end = location[0];
        line.headingLast = undefined;
        line.distance = 0;
        line.headingDelta = 0;

        console.log(line);
      }
      let headingL = 0;
      let hdt = undefined;

      if (state.locations.coords.length > 0) {
        // const elo = state.locations.coords[state.locations.coords.length - 1];
      }

      // if (!hdt || hdt.distance > 0.0001) state.locations.coords.push(location[0]);

      for (let i = 0; i < location.length; i++) {
        hdt = headingDistanceTo(line.end, location[i]);
        headingL = hdt.heading;
        if (hdt.distance <= 1) {
          continue;
        }
        if (line.headingLast === undefined) {
          //when the line does have only one point
          line.headingLast = headingL;
          line.headingDelta = 0;
          line.end = location[i];
          continue;
        }
        line.headingDelta += headingL - line.headingLast;
        if (
          Math.abs(line.headingDelta) > 5 ||
          Math.abs(line.headingLast - headingL) > 2.5 ||
          // line.distance > 100
          false
        ) {
          //end line and start new one
          recDistance += line.distance;
          console.log(line, "new line");
          state.locations.coords.push(line.start);
          line.start = line.end;
          line.end = location[i];
          line.headingDelta = 0;
          line.distance = 0;
        }
        line.headingLast = headingL;

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
