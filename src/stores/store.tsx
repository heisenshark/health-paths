import create from "zustand";
import { Map } from "../utils/interfaces";
interface MapStore {
  one: () => number;
  riable: number;
  incrementRiable: () => void;
  currentMap: Map;
  maps: Map[];
}

export const useMapStore = create<MapStore>((set) => ({
  one: () => 1,
  riable: 0,
  incrementRiable: () => set((state) => ({ riable: state.riable + 1 })),
  currentMap: {} as Map,
  maps: [
    {
      name: "kato trasa",
      map_id: "kato trasa",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as Map,
    {
      name: "kato trasa",
      map_id: "kato trasa",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as Map,
    {
      name: "kato trasa",
      map_id: "kato trasa",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as Map,
    {
      name: "kato trasa",
      map_id: "kato trasa",
      description: "trasa krajoznawcza w katowicach",
      location: "katowice",
      waypoints: [],
      stops: [],
    } as Map,
  ] as Map[],
  addMap: (map: Map) => set((state) => ({ maps: [...state.maps, map] })),
}));
