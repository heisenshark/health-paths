import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { loadMapInfo } from "../utils/MapInfoLoader";

/**
 * @property {string} mapId lokalne id mapy
 * @property {string} webId id mapy w bazie danych
 * @property {FirebaseFirestoreTypes.Timestamp} downloadDate data pobrania mapy
 * @export
 * @interface DownloadTrackerRecord
 */
export interface DownloadTrackerRecord {
  mapId: string;
  webId: string;
  downloadDate: FirebaseFirestoreTypes.Timestamp;
}
/**
 * @property {string} id globalne id mapy
 */
export type DownloadTracker = {
  [id: string]: DownloadTrackerRecord;
};

/**
 * @property {DownloadTracker} downloadTracker obiekt przechowujący informacje o pobranych mapach
 * @property {function} addRecord dodaje nowy rekord do obiektu downloadTracker
 * @property {function} deleteRecord usuwa rekord z obiektu downloadTracker
 * @property {function} validateDownloadTracker sprawdza czy wszystkie mapy z obiektu downloadTracker istnieją w pamięci urządzenia
 * @interface DownloadTrackingStore
 */
interface DownloadTrackingStore {
  downloadTracker: DownloadTracker;
  addRecord: (key: string, value: DownloadTrackerRecord) => void;
  deleteRecord: (key: string) => void;
  validateDownloadTracker: () => void;
}

export const useDownloadTrackingStore = create<DownloadTrackingStore>()(
  devtools(
    persist(
      (set, get) => ({
        downloadTracker: {},
        addRecord: (key: string, value: DownloadTrackerRecord) =>
          set(() => ({ downloadTracker: { ...get().downloadTracker, [key]: value } })),
        deleteRecord: (key: string) => {
          const { [key]: _, ...rest } = get().downloadTracker;
          set(() => ({ downloadTracker: rest }));
        },
        validateDownloadTracker: async () => {
          const downloadTracker = get().downloadTracker;

          const entries = Object.entries(downloadTracker);
          for (const [key, value] of entries) {
            const path = value.mapId;
            const mapInfo = await loadMapInfo(path);
            if (mapInfo === undefined) {
              delete downloadTracker[key];
            }
          }

          set(() => ({ downloadTracker: downloadTracker }));
        },
      }),
      {
        name: "Downloads Object",
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    {
      name: "Download Tracking Store",
    }
  )
);
