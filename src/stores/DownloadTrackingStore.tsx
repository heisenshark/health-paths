import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import create from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { loadMapInfo } from "../utils/MapInfoLoader";

export interface DownloadTrackerRecord {
  mapId: string;
  webId: string;
  downloadDate: FirebaseFirestoreTypes.Timestamp;
}

export type DownloadTracker = {
  [id: string]: DownloadTrackerRecord;
};

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
              console.log("MapInfo is undefined");
              delete downloadTracker[key];
            }
          }
          console.log(downloadTracker);

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
