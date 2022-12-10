import create from "zustand";
import { Map } from "../utils/interfaces";
interface MapStore {
  one: () => number;
  riable: number;
  incrementRiable: () => void;
  currentMap: Map;
  maps: MapArray;
  
}

interface MapArray {
  [key: string]: Map;
}

export const useMapStore = create<MapStore>((set) => ({
  one: () => 1,
  riable: 0,
  incrementRiable: () => set((state) => ({ riable: state.riable + 1 })),
  currentMap: {} as Map,
  maps: {
    map1: {
      name: "kato trasa",
      map_id: "1",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as Map,
    map2: {
      name: "kato trasa",
      map_id: "2",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as Map,
    map3: {
      name: "kato trasa",
      map_id: "3",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as Map,
    map4: {
      name: "kato trasa",
      map_id: "4",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as Map,
  } as MapArray,
  addMap: (map: Map) => set((state) => ({ maps: [...state.maps, map] })),
}));
