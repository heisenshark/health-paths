import { atom } from "jotai";

type MapEditState = "Idle" | "MovingWaypoint" | "MovingStopPoint";

export const showHandlesAtom = atom<boolean>(true);
export const mapEditorStateAtom = atom<MapEditState>("Idle");
export const initialRegionAtom = atom({
  latitude: 51,
  longitude: 19,
  latitudeDelta: 5,
  longitudeDelta: 10,
});

initialRegionAtom.read((g) => console.log(g));
