import * as React from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { Callout, Circle, MapMarker, Marker } from "react-native-maps";
import Waypoint from "./../utils/interfaces";
import SquareButton from "./SquareButton";
import Icon from "react-native-vector-icons/FontAwesome";
import { useEffect, useRef } from "react";
import tw from "../lib/tailwind";
import { useNavigation } from "@react-navigation/native";
import { useAtom } from "jotai";
import { mapEditorStateAtom, showHandlesAtom, zoomAtom } from "../config/AtomsState";

interface StopPointsProps {
  waypoints: Waypoint[];
  selectedStop?: Waypoint;
  stopPointPressed: (stopPoint: Waypoint) => void;
}

const StopPoints = ({ waypoints, selectedStop, stopPointPressed }: StopPointsProps) => {
  const navigationRef = useNavigation();

  const [showHandles, setShowHandles] = useAtom(showHandlesAtom);
  const [mapEditState] = useAtom(mapEditorStateAtom);
  const [zoom] = useAtom(zoomAtom);

  useEffect(() => {
    // console.log("stoppoints rerendered", mapEditState, showHandles);
    // console.log(waypoints);
  });

  const StopPoint = ({ waypoint }: { waypoint: Waypoint }) => {
    return (
      <View>
        {((showHandles && mapEditState === "Idle") ||
          (selectedStop === waypoint && mapEditState === "MovingStopPoint")) && (
          <Marker
            coordinate={waypoint.coordinates}
            title={waypoint.displayed_name}
            description={waypoint.type}
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
    );
  };

  const stops = waypoints.map((waypoint, index) => {
    return (
      <View key={index}>
        {((showHandles && mapEditState === "Idle") ||
          (selectedStop === waypoint && mapEditState === "MovingStopPoint")) && (
          <Marker
            coordinate={waypoint.coordinates}
            title={waypoint.displayed_name}
            description={waypoint.type}
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
    );

    // <StopPoint key={index} waypoint={n}></StopPoint>;
  });

  return <>{stops}</>;
};

export default StopPoints;
