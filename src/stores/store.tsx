import create from "zustand";
import { HealthPath } from "../utils/interfaces";
import uuid from "react-native-uuid";

interface MapStore {
  one: () => number;
  riable: number;
  incrementRiable: () => void;
  currentMap: HealthPath;
  maps: MapArray;
  addMap: (map: HealthPath) => void;
}

interface MapArray {
  [key: string]: HealthPath;
}

export const useMapStore = create<MapStore>((set) => ({
  one: () => 1,
  riable: 0,
  incrementRiable: () => set((state) => ({ riable: state.riable + 1 })),
  currentMap: {} as HealthPath,
  maps: {
    map1: {
      name: "kato trasa",
      map_id: "1",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as HealthPath,
    map2: {
      name: "kato trasa",
      map_id: "2",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as HealthPath,
    map3: {
      name: "kato trasa",
      map_id: "3",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as HealthPath,
    map4: {
      name: "kato trasa",
      map_id: "4",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as HealthPath,
  } as MapArray,
  addMap: (map: HealthPath) => {
    set((state) => {
      const map_id = uuid.v4().toString();
      map.map_id = map_id;
      state.maps[map_id] = map;
      return { maps: { ...state.maps } };
    });
  },
}));
