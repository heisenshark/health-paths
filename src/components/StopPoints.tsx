import * as React from "react";
import { View } from "react-native";
import { Circle, Marker } from "react-native-maps";
import { Waypoint } from "./../utils/interfaces";
import { useAtom, useAtomValue } from "jotai";
import { mapEditorStateAtom, showHandlesAtom, zoomAtom } from "../config/AtomsState";

/**
 * @property {Array<Waypoint>} waypoints Punkty stopu.
 * @property {Waypoint} [selectedStop] Aktualnie wybrany punkt stopu.
 * @property {Function} stopPointPressed funkcja wywoływana kiedy jakiś punkt stopu jest naciśnięty.
 * @interface StopPointsProps
 */
interface StopPointsProps {
  waypoints: Waypoint[];
  selectedStop?: Waypoint;
  stopPointPressed: (stopPoint: Waypoint) => void;
}
/**
 * Komponent wyświetlający punkty stopu. wyświetla punkty stopu w trybie edycji lub przeglądania.
 * @param {StopPointsProps} { waypoints, selectedStop, stopPointPressed }
 * @component
 */
const StopPoints = ({ waypoints, selectedStop, stopPointPressed }: StopPointsProps) => {
  const showHandles = useAtomValue(showHandlesAtom);
  const [mapEditState] = useAtom(mapEditorStateAtom);
  const [zoom] = useAtom(zoomAtom);

  return (
    <>
      {waypoints.map((waypoint, index) => (
        <View key={index}>
          {((showHandles && mapEditState === "Idle") ||
            (selectedStop === waypoint && mapEditState === "MovingStopPoint")) && (
            <Marker
              coordinate={waypoint.coordinates}
              pinColor={"green"}
              opacity={selectedStop === waypoint && mapEditState === "MovingStopPoint" ? 0.5 : 0.9}
              onPress={() => {
                showHandles && stopPointPressed(waypoint);
              }}
            />
          )}
          <Circle
            center={waypoint.coordinates}
            radius={Math.min(zoom * 7, 100)}
            fillColor={"yellow"}
            zIndex={4}
          />
        </View>
      ))}
    </>
  );
};

export default StopPoints;
