import { Text, View, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import MapboxGL from "@rnmapbox/maps";
import MapView, { LatLng, Region } from "react-native-maps";
import { cloneDeep } from "lodash";
import { mapStylenoLandmarks, mapStylesJSON, waypointsApp } from "../providedfiles/Export";
import { Markers } from "../components/Markers";
import MapViewDirections from "react-native-maps-directions";
import Waypoint from "../utils/interfaces";
import { NativeWindStyleSheet } from "nativewind"
const Map = ({ params }) => {
    //TODO Dodać przyciski powiększania dodawania itp
    //TODO Dodać logikę komponentu na tryby edycji ścieżek i inne
    //TODO Rozdzielić na kilka pure komponentów
    //TODO Dodać możliwość tworzenia waypointów

    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isEdit, setIsEdit] = useState<boolean>(false as boolean);
    const [waypoints, setWaypoints] = useState<Waypoint[]>(cloneDeep(waypointsApp));
    const [zoomVals, setZoomVals] = useState<Region>({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
    } as Region);

    const origin = { latitude: 50.29416, longitude: 18.66541 };
    const destination = { latitude: 50.29387, longitude: 18.66577 };

    const API_KEY = "***REMOVED***";

    const elo = useEffect(() => {
        setZoomVals(calcZoomValues());
        MapboxGL.requestAndroidLocationPermissions().then((n) => {
            setPermissionGranted(n);
        });
    }, []);

    /**
   * no to ten, markery działają tak że jest edit mode i jak jest edit mode to ten, można je edytować i one istnieją, więc albo renderujemy je warunkowo albo umieszczamy warunkowe renderowanie w komponencie
   */

    async function snapPoints() {
        const path: string = waypoints
            .map((value) => `${value.coordinates.latitude}%2${value.coordinates.longitude}%7`)
            .reduce((n, m) => n + m);
        console.log(path);
        console.log(waypoints);
    //fetch(`https://roads.googleapis.com/v1/snapToRoads?path=-35.27801%2C149.12958%7C&key=***REMOVED***`)
    }
    //TODO uprościć funkcje zooma na początku mapy
    const calcZoomValues = (): Region => {
        let minLat = 1000,
            minLon = 1000,
            maxLat = -1000,
            maxLon = -1000;
        const retval: Region = {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0,
            longitudeDelta: 0,
        };
        waypoints.forEach((n) => {
            minLat = Math.min(minLat, n.coordinates.latitude);
            maxLat = Math.max(maxLat, n.coordinates.latitude);
            minLon = Math.min(minLon, n.coordinates.longitude);
            maxLon = Math.max(maxLon, n.coordinates.longitude);
            console.log(n);
        });
        retval.latitude = (minLat + maxLat) / 2;
        retval.longitude = (minLon + maxLon) / 2;

        retval.latitudeDelta = maxLat - minLat + 0.001;
        retval.longitudeDelta = maxLon - minLon + 0.001;
        console.log("siema", retval, waypoints);
        return retval as Region;
    };
    //TODO zmienić to na komponent który generuje markery trasy

    const addWaypoint = (waypoint: Waypoint) => {
        setWaypoints([...waypoints, waypoint]);
    };

    return (
        <View className="relative">
            <View className="w-full h-full bg-red-600">
                <MapView
                    className="flex-1"
                    initialRegion={calcZoomValues()}
                    onPress={(e) => {
                        console.log("objectssss");
                        isEdit &&
                        addWaypoint({
                            waypoint_id: "asd",
                            displayed_name: "name",
                            coordinates: e.nativeEvent.coordinate,
                            description: "asdsad",
                        } as Waypoint);
                        // console.log(waypoints.slice(1, -1).map((value) => value.coordinates));
                    }}
                    customMapStyle={isEdit ? mapStylenoLandmarks : mapStylesJSON}>
                    <MapViewDirections
                        origin={waypoints[0].coordinates}
                        destination={waypoints[waypoints.length - 1].coordinates}
                        waypoints={waypoints.slice(1, -1).map((value) => value.coordinates)}
                        mode={"WALKING"}
                        apikey={API_KEY}
                        strokeWidth={3}
                        strokeColor="red"
                        onReady={(n) => {
                            console.log(n);
                        }}
                    />

                    <Markers waypoints={waypoints} isEdit={isEdit} updateWaypoints={() => {
                        setWaypoints([...waypoints]);
                    }} />
                </MapView>
            </View>
            <View className="absolute  h-full w-full pointer-events-none">
                <TouchableOpacity
                    className="h-20 w-20 bg-yellow-300 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto"
                    onPress={() => {
                        setIsEdit(!isEdit);
                    }}>
                    <Text className="text-3xl">{isEdit ? "exit" : "+"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="h-20 w-20 bg-yellow-300 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto"
                    onPress={() => {
                        setIsEdit(!isEdit);
                        calcZoomValues();
                    }}></TouchableOpacity>
                <TouchableOpacity
                    className="h-20 w-20 bg-yellow-300 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto"
                    onPress={() => {
                        snapPoints();
                    }}>
                    <Text>snap</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="h-20 w-20 bg-yellow-300 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto"
                    onPress={() => {
                        setWaypoints([waypoints[0], waypoints[waypoints.length - 1]]);
                    }}>
                    <Text>delall</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Map;
// function undefined({ isEdit, markers }) {
//     return <View>{isEdit && markers}</View>;
// }
