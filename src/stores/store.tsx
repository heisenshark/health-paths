import create from "zustand";
import { HealthPath } from "../utils/interfaces";
import uuid from "react-native-uuid";
import { Camera, LatLng } from "react-native-maps";
import { getURI } from "../utils/FileSystemManager";

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
      // state.testobject.test.push("test3");
      state.locations.coords.push(...location);
      // state.locations
      //   ? state.locations.push(location as LatLng)
      //   : (state.locations = [location as LatLng]);
      return { locations: { coords: state.locations.coords}, outputLocations: [...state.locations.coords]};
    });
  },
  clearLocations: () => {
    set(() => {
      return { locations: { coords: [] }};
    });
  },
  testobject: { test: ["test1", "test2"] },
  outputLocations: [],
}));
