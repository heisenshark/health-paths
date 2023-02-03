import { useAtom } from "jotai";
import * as React from "react";
import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { Callout, Circle, LatLng, Marker } from "react-native-maps";
import tw from "../lib/tailwind";
import { mapEditorStateAtom, showHandlesAtom, zoomAtom } from "../config/AtomsState";
import Waypoint from "../utils/interfaces";

export interface MarkersProps {
  waypoints: LatLng[];
  selectedWaypoint?: LatLng;
  isView?: boolean;
  onWaypointPressed?: (w: LatLng) => void;
}
const SNAPPING_ENABLED = false;

//TODO zmienić wygląd na kółka z numerami

export function Markers<Props>(
  { waypoints, selectedWaypoint, isView, onWaypointPressed }: MarkersProps = {
    waypoints: [],
    onWaypointPressed: () => {},
  } as MarkersProps
) {
  // const [edittedWaypoint, setEdittedWaypoint] = useState(1);
  const [showHandles] = useAtom(showHandlesAtom);
  const [mapEditState] = useAtom(mapEditorStateAtom);
  const [zoom] = useAtom(zoomAtom);

  const renderImage = (isEnd, isBegin) => {
    if (isEnd)
      return (
        <View style={tw`flex-1 items-center justify-end h-auto w-auto`}>
          <Image
            source={imageStart}
            resizeMode="center"
            resizeMethod="resize"
            style={tw`flex-1 w-10 h-10`}
          />
        </View>
      );
    if (isBegin)
      return (
        <View style={tw`flex-1 items-center justify-end h-auto w-auto`}>
          <Image
            source={imageEnd}
            resizeMode="center"
            resizeMethod="resize"
            style={tw`flex-1 w-10 h-10`}
          />
        </View>
      );

    return null;
  };

  const markers = waypoints.map((n: LatLng, index) => {
    const isEnd = index === waypoints.length - 1;
    const isBegin = index === 0;

    if (isView && !isEnd && !isBegin)
      return <Circle center={n} radius={Math.min(zoom * 7, 100)} fillColor={"gray"} zIndex={4} />;
    return (
      <View key={index}>
        {(isBegin ||
          isEnd ||
          (showHandles && mapEditState === "Idle") ||
          (selectedWaypoint === n && mapEditState === "MovingWaypoint")) && (
          <Marker
            coordinate={n}
            onPress={() => {
              console.log("marker pressed, initiating edit");
              mapEditState === "Idle" && onWaypointPressed(n);
            }}
            tappable={false}
            pinColor={index == 0 ? "blue" : "yellow"}
            style={tw`flex`}
            opacity={selectedWaypoint === n && mapEditState === "MovingWaypoint" ? 0.5 : 0.9}>
            {renderImage(index == 0, index == waypoints.length - 1)}
          </Marker>
        )}

        <Circle center={n} radius={Math.min(zoom * 7, 100)} fillColor={"gray"} zIndex={4} />
      </View>
    );
  });

  return <>{markers}</>;
}

const imageEnd = require("../../assets/map-end-marker.png");
const imageStart = require("../../assets/map-start-marker.png");
const imageCircle = require("../../assets/marker.png");
// const marker = require("../../assets/map-marker.png");
