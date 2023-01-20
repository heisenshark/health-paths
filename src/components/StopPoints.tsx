import * as React from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { Callout, Circle, MapMarker, Marker } from "react-native-maps";
import Waypoint from "./../utils/interfaces";
import SquareButton from "./SquareButton";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRef } from "react";
import tw from "../lib/tailwind";
import { useNavigation } from "@react-navigation/native";

interface StopPointsProps {
  waypoints: Waypoint[];
  isStop: boolean;
  showHandles: boolean;
  selectedStop?: Waypoint;
  zoom: number;
  stopPointPressed?: (stopPoint: Waypoint) => void;
}
//TODO fajnie byłoby zrobić jakąś galerię miejsc z tych punktów stopu

const StopPoints = ({
  waypoints,
  isStop,
  showHandles,
  selectedStop,
  zoom,
  stopPointPressed,
}: StopPointsProps) => {
  const navigationRef = useNavigation();

  React.useEffect(() => {
    console.log("stoppoints rerendered");
    console.log(waypoints);
  });

  const StopPoint = ({ waypoint }: { waypoint: Waypoint }) => {
    let markerRef = useRef<MapMarker>();
    return (
      <>
        {(showHandles || selectedStop === waypoint) && (
          <Marker
            ref={markerRef}
            coordinate={waypoint.coordinates}
            title={waypoint.displayed_name}
            description={waypoint.type}
            onPress={() => {
              isStop && console.log("stoppoint pressed in stoppoint mode");
              stopPointPressed?.(waypoint);
            }}
            opacity={selectedStop === waypoint ? 0.5 : 0.9}
            // pinColor={"green"}
            // anchor={{ x: 0.5, y: 0.5 }}
          >
            {/* <View className="flex-1 items-center justify-end h-auto w-auto">
          <Image
            source={stopPointImage}
            resizeMode="center"
            resizeMethod="resize"
            className={"flex-1 w-6 h-6"}
          />
        </View> */}
          </Marker>
        )}
        <Circle
          center={waypoint.coordinates}
          radius={Math.min(zoom * 7, 30)}
          fillColor={"yellow"}
          zIndex={2}
        />
      </>
    );
  };

  const stops = waypoints.map((n, index) => {
    return <StopPoint key={index} waypoint={n}></StopPoint>;
  });

  return <>{stops}</>;
};

export default StopPoints;
const stopPointImage = require("../../assets/STOP2.png");
