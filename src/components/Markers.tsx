import * as React from "react";
import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { Callout, LatLng, Marker } from "react-native-maps";
import Waypoint from "../utils/interfaces";

export interface MarkersProps {
  waypoints: LatLng[];
  isEdit: boolean;
  updateWaypoints: () => {};
  onWaypointSelect: (w: LatLng) => void;
}
const SNAPPING_ENABLED = false;

//TODO zmienić wygląd na kółka z numerami

export function Markers<Props>({
  waypoints,
  isEdit,
  updateWaypoints,
  onWaypointSelect,
}: MarkersProps) {
  // const [edittedWaypoint, setEdittedWaypoint] = useState(1);
  const [selectedWaypoint, setSelectedWaypoint] = useState(1);
  const API_KEY = "***REMOVED***";

  useEffect(() => {
    // console.log(
    //     "zmiana",
    //     waypoints,
    //     waypoints.slice(1, -1).map((value) => value.coordinates)
    // );
  }, [isEdit]);

  //HACK snnapping new points to the nearest road
  function snapPoint(waypoint: Waypoint, point: LatLng) {
    SNAPPING_ENABLED &&
      fetch(
        `https://roads.googleapis.com/v1/snapToRoads?path=${point.latitude},${point.longitude}&key=${API_KEY}`
      )
        .then((res) => res.json())
        .then((data) => {
          let newpoint = data.snappedPoints[0].location as LatLng;
          waypoint.coordinates = newpoint;
          console.log(newpoint);
          updateWaypoints();
        });

    // console.log(path);
    // console.log(waypoints);
    //fetch(`https://roads.googleapis.com/v1/snapToRoads?path=-35.27801%2C149.12958%7C&key=***REMOVED***`)
  }

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

  const markers = waypoints.map((n: LatLng, index) => {
    if (isEdit || index === waypoints.length - 1 || index === 0)
      return (
        <Marker
          key={index}
          coordinate={n}
          onDragEnd={(e) => {
            // snapPoint(n, e.nativeEvent.coordinate);
            waypoints[index] = e.nativeEvent.coordinate;
            updateWaypoints();
          }}
          onPress={() => {
            console.log("marker pressed, initiating edit");
            onWaypointSelect(n);
          }}
          draggable={isEdit}
          tappable={false}
          pinColor={index == 0 ? "blue" : "yellow"}
          className="flex "
          anchor={{ x: 0.5, y: 1 }}>
          {index == 0 && (
            <View className="flex-1 items-center justify-end h-auto w-auto">
              <Text>Start</Text>
              <Image
                source={imageStart}
                resizeMode="center"
                resizeMethod="resize"
                className={`flex-1 w-12 h-12 ${selectedWaypoint == index ? "" : ""}`}
              />
            </View>
          )}

          {index == waypoints.length - 1 && index !== 0 && (
            <View className="flex-1 items-center justify-end h-auto w-auto">
              <Text>Koniec</Text>
              <Image
                source={imageEnd}
                resizeMode="center"
                resizeMethod="resize"
                className={`flex-1 w-12 h-12 ${selectedWaypoint == index ? "" : ""}`}
              />
            </View>
          )}
          <Callout tooltip>
            <Text>{index + 1}</Text>
          </Callout>
        </Marker>
      );
  });

  return <>{markers}</>;
}

const imageEnd = require("../../assets/map-end-marker.png");
const imageStart = require("../../assets/map-start-marker.png");
// const marker = require("../../assets/map-marker.png");
