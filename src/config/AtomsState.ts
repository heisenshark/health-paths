import { atom } from "jotai";
import { curmodalOpenType } from "../screens/MapEditScreen";

/**
 * This file contains all the atoms used in the app
 */

type MapEditState = "Idle" | "MovingWaypoint" | "MovingStopPoint";
export const showHandlesAtom = atom<boolean>(true);
export const mapEditorStateAtom = atom<MapEditState>("Idle");
export const zoomAtom = atom<number>(15);
export const initialRegionAtom = atom({
  latitude: 51,
  longitude: 19,
  latitudeDelta: 5,
  longitudeDelta: 10,
});
export const currentModalOpenAtom = atom<curmodalOpenType>("None");
