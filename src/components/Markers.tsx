import * as React from "react";
import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { Callout, LatLng, Marker } from "react-native-maps";
import Waypoint from "../utils/interfaces";

export interface MarkersProps {
  waypoints: Waypoint[];
  isEdit: boolean;
  updateWaypoints: () => {};
}

export function Markers<Props>({ waypoints, isEdit, updateWaypoints }) {
    const [edittedWaypoint, setEdittedWaypoint] = useState(1);
    const [selectedWaypoint, setSelectedWaypoint] = useState(1);

    useEffect(() => {
        console.log(
            "zmiana",
            waypoints,
            waypoints.slice(1, -1).map((value) => value.coordinates)
        );
    }, [isEdit]);

    const addWaypoint = (cords: LatLng) => {
        waypoints = [
            ...waypoints,
            {
                waypoint_id: "gliwice.rynek.ratusz",
                coordinates: cords,
                type: "station",
                displayed_name: "Rynek Rzeźba Madonny",
                navigation_audio: "",
                image: "image.station.gliwice.ratusz.icon",
                introduction_audio: "audio.introduction.ratusz",
            },
        ];
    };

    const markers = waypoints.map((n, index) => {
        if (isEdit || index === waypoints.length - 1 || index === 0)
            return (
                <Marker
                    key={index}
                    coordinate={n.coordinates}
                    title={n.displayed_name}
                    description={n.type}
                    onPress={() => {
                        index;
                    }}
                    onDragEnd={(e) => {
                        n.coordinates = e.nativeEvent.coordinate;
                        updateWaypoints();
                    }}
                    draggable={isEdit}
                    tappable={false}
                    pinColor={index == 0 ? "blue" : "yellow"}
                    className="flex ">
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

                    {index == waypoints.length - 1 && (
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
                        <Text></Text>
                    </Callout>
                </Marker>
            );
    });

    return (
        <>
            {markers}
            {/* <Polyline
                coordinates={
                    waypoints.map(n => { return { longitude: n.coordinates[1], latitude: n.coordinates[0] } })
                }
                strokeColor="#000"
                strokeWidth={6}
            /> */}
        </>
    );
}

const imageEnd = require("../../assets/map-end-marker.png");
const imageStart = require("../../assets/map-start-marker.png");
// const marker = require("../../assets/map-marker.png");
