import { create } from "zustand";
import { HealthPath } from "../utils/interfaces";
import uuid from "react-native-uuid";
import { LatLng } from "react-native-maps";
import { headingDistanceTo } from "geolocation-utils";
import { devtools } from "zustand/middleware";

/**
 * @category stores
 * @property {function} setCurrentMap funkcja ustawiająca aktualną mapę
 * @property {function} resetCurrentMap funkcja resetująca aktualną mapę
 * @property {function} setNotSaved funkcja ustawiająca flagę notSaved
 * @property {boolean} notSaved funkcja zwracająca flagę notSaved
 * @property {HealthPath} currentMap aktualna mapa
 * @interface MapStore
 */
interface MapStore {
  setCurrentMap: (map: HealthPath) => void;
  resetCurrentMap: () => void;
  setNotSaved: (saved: boolean) => void;
  notSaved: boolean;
  currentMap: HealthPath;
}
/**
 * @category stores
 * @property {LatLng} start początek linii
 * @property {LatLng} end koniec linii
 * @property {number} distance długość linii
 * @property {number} headingDelta różnica kątów
 * @property {number} headingLast ostatni kąt
 * @interface LineCurrent
 */
interface LineCurrent {
  start: LatLng;
  end: LatLng;
  distance: number;
  headingDelta: number;
  headingLast: number;
}
/**
 * @category stores
 * @property {Array<LatLng>} locations lokalizacje
 * @property {Array<LatLng>} outputLocations lokalizacje do wyświetlenia
 * @property {LineCurrent} currentLine aktualna linia
 * @property {number} highestTimestamp najwyższy timestamp
 * @property {function(Array<LatLng>,number)} addLocations funkcja dodająca tablicę lokalizacji do tablicy lokalizacji jeśli timestamp jest wystarczająco świeży
 * @property {function} clearLocations funkcja czyszcząca lokalizacje
 * @property {function} setHighestTimestamp funkcja ustawiająca najwyższy timestamp, przyjmuje numer
 * @property {function} getOutputLocations funkcja zwracająca lokalizacje do wyświetlenia
 *
 * @interface LocationTrackingStore
 */
interface LocationTrackingStore {
  locations: LatLng[];
  outputLocations: LatLng[];
  currentLine: LineCurrent;
  highestTimestamp: number;
  addLocations: (location: LatLng[], timestamp: number) => void;
  clearLocations: () => void;
  setHighestTimestamp: (timestamp: number) => void;
  getOutputLocations: () => LatLng[];
}

export const useMapStore = create<MapStore>()(
  devtools(
    (set) => ({
      currentMap: {
        name: "",
        map_id: "",
        description: "",
        location: "",
        waypoints: [],
        stops: [],
      } as HealthPath,
      notSaved: false,
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
      setNotSaved: (saved: boolean) => set(() => ({ notSaved: saved })),
    }),
    { name: "mapstore", store: "Store Containing map" }
  )
);

export const useLocationTrackingStore = create<LocationTrackingStore>()(
  devtools(
    (set, get) => ({
      locations: [],
      addLocations: (location: LatLng[], timestamp: number) => {
        set((state) => {
          const line = state.currentLine;
          if (location.length === 0) return {};
          if (line.start === undefined) {
            line.start = line.end = location[0];
            line.distance = line.headingDelta = 0;
            line.headingLast = undefined;
          }

          for (let i = 0; i < location.length; i++) {
            let hdt = headingDistanceTo(line.end, location[i]);
            if (hdt.distance <= 1) {
              continue;
            }
            if (line.headingLast === undefined) {
              line.headingLast = hdt.heading;
              line.headingDelta = 0;
              line.end = location[i];
              continue;
            }
            line.headingDelta += hdt.heading - line.headingLast;
            if (Math.abs(line.headingDelta) > 5 || Math.abs(line.headingLast - hdt.heading) > 2.5) {
              state.locations.push(line.start);
              line.start = line.end;
              line.end = location[i];
              line.distance = line.headingDelta = 0;
            }
            line.headingLast = hdt.heading;
            line.distance += hdt.distance;
            line.end = location[i];
          }

          return {
            locations: state.locations,
            outputLocations: [...state.locations, line.start, line.end],
            currentLine: {
              start: line.start,
              end: line.end,
              distance: line.distance,
              headingDelta: line.headingDelta,
              headingLast: line.headingLast,
            },
            highestTimestamp: timestamp,
          };
        });
      },
      clearLocations: () => {
        set(() => {
          return {
            locations: [],
            outputLocations: [],
            currentLine: {
              start: undefined,
              end: undefined,
              distance: 0,
              headingDelta: undefined,
              headingLast: undefined,
            },
          };
        });
      },
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
      highestTimestamp: 0,
      setHighestTimestamp: (timestamp: number) => {
        set(() => {
          return { highestTimestamp: timestamp };
        });
      },
    }),
    { name: "locationTrackingStore", store: "Store Containing location tracking info" }
  )
);
