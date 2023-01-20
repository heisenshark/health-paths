import * as React from "react";
import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { Callout, Circle, LatLng, Marker } from "react-native-maps";
import tw from "../lib/tailwind";
import Waypoint from "../utils/interfaces";

export interface MarkersProps {
  waypoints: LatLng[];
  showHandles: boolean;
  selectedWaypoint: LatLng;
  zoom: number;
  onWaypointSelect: (w: LatLng) => void;
}
const SNAPPING_ENABLED = false;

//TODO zmienić wygląd na kółka z numerami

export function Markers<Props>({
  waypoints,
  showHandles,
  selectedWaypoint,
  zoom,
  onWaypointSelect,
}: MarkersProps) {
  // const [edittedWaypoint, setEdittedWaypoint] = useState(1);
  const API_KEY = "***REMOVED***";

  useEffect(() => {
    // console.log(
    //     "zmiana",
    //     waypoints,
    //     waypoints.slice(1, -1).map((value) => value.coordinates)
    // );
  }, [showHandles]);

  //HACK snnapping new points to the nearest road

  // const addWaypoint = (cords: LatLng) => {
  //   let w: Waypoint = {
  //     waypoint_id: "gliwice.rynek.ratusz",
  //     coordinates: cords,
  //     type: "station",
  //     displayed_name: "Rynek Rzeźba Madonny",
  //     navigation_audio: "",
  //     image: "image.station.gliwice.ratusz.icon",
  //     introduction_audio: "audio.introduction.ratusz",
  //     description: "description",
  //   };
  //   waypoints = [...waypoints, w];
  //   snapPoint(w, cords);
  // };

  const renderImage = (isEnd, isBegin) => {
    if (isEnd)
      return (
        <View style={tw`flex-1 items-center justify-end h-auto w-auto`}>
          <Text>Start</Text>
          <Image
            source={imageStart}
            resizeMode="center"
            resizeMethod="resize"
            style={tw`flex-1 w-8 h-8`}
          />
        </View>
      );
    if (isBegin)
      return (
        <View style={tw`flex-1 items-center justify-end h-auto w-auto`}>
          <Text>Koniec</Text>
          <Image
            source={imageEnd}
            resizeMode="center"
            resizeMethod="resize"
            style={tw`flex-1 w-8 h-8`}
          />
        </View>
      );

    return null;
  };

  const markers = waypoints.map((n: LatLng, index) => {
    const isEnd = index === waypoints.length - 1;
    const isBegin = index === 0;
    return (
      <View key={index}>
        {(isBegin || isEnd || showHandles || selectedWaypoint === n) && (
          <Marker
            coordinate={n}
            onPress={() => {
              console.log("marker pressed, initiating edit");
              showHandles && onWaypointSelect(n);
            }}
            tappable={false}
            pinColor={index == 0 ? "blue" : "yellow"}
            style={tw`flex`}
            opacity={selectedWaypoint === n ? 0.5 : 0.9}
            // anchor={isEnd || isBegin ? { x: 0.5, y: 1 } : { x: 0.5, y: 0.5 }}
          >
            {renderImage(index == 0, index == waypoints.length - 1)}

            {/* <Callout tooltip>
          <Text>{index + 1}</Text>
        </Callout> */}
          </Marker>
        )}

        <Circle center={n} radius={Math.min(zoom * 7, 30)} fillColor={"gray"} zIndex={1} />
      </View>
    );
  });

  return <>{markers}</>;
}

const imageEnd = require("../../assets/map-end-marker.png");
const imageStart = require("../../assets/map-start-marker.png");
const imageCircle = require("../../assets/marker.png");
// const marker = require("../../assets/map-marker.png");
