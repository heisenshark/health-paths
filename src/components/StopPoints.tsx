import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Callout, MapMarker, Marker } from "react-native-maps";
import Waypoint from "./../utils/interfaces";
import SquareButton from "./SquareButton";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRef } from "react";
import tw from "../lib/tailwind";
import { useNavigation } from "@react-navigation/native";

interface StopPointsProps {
  waypoints: Waypoint[];
  isStop: boolean;
  updateStopPoints: (stopPoints: Waypoint[]) => void;
}
//TODO fajnie byłoby zrobić jakąś galerię miejsc z tych punktów stopu

const StopPoints = ({ waypoints, isStop, updateStopPoints }: StopPointsProps) => {
  const navigationRef = useNavigation();
  const StopPoint = ({ waypoint }: { waypoint: Waypoint }) => {
    let markerRef = useRef<MapMarker>();

    const openEdit = () => {
      console.log("elooooo");
      console.log(waypoint);
      markerRef.current.hideCallout();

      navigationRef.navigate({
        name: "EdycjaMap",
        params: { editedWaypoint: waypoint, isEdit: isStop },
      });
    };
    return (
      <Marker
        ref={markerRef}
        coordinate={waypoint.coordinates}
        title={waypoint.displayed_name}
        description={waypoint.type}
        onPress={() => {
          isStop && console.log("stoppoint pressed in stoppoint mode");
        }}
        onDragEnd={(e) => {
          waypoint.coordinates = e.nativeEvent.coordinate;
          updateStopPoints(waypoints);
        }}
        draggable={isStop}
        tappable={false}
        pinColor={"green"}
        onCalloutPress={openEdit}>
        <Callout tooltip>
          <SquareButton
            addStyle={"ml-auto mr-2"}
            label={isStop ? "Edytuj" : "Pokaż"}></SquareButton>
        </Callout>
      </Marker>
    );
  };

  const stops = waypoints.map((n, index) => {
    return <StopPoint key={index} waypoint={n}></StopPoint>;
  });

  return <>{stops}</>;
};

export default StopPoints;
