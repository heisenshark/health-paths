import { Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapboxGL from '@rnmapbox/maps'
import MapView, { Callout, Circle, LatLng, Marker, Polyline } from 'react-native-maps'
import { cloneDeep } from 'lodash'
import { mapStylenoLandmarks, mapStylesJSON, waypointsApp } from '../providedfiles/Export'
import { ColorMatrix, concatColorMatrices, saturate, invert, contrast, hueRotate, brightness } from 'react-native-color-matrix-image-filters'
import { Markers } from '../components/Markers'
import MapViewDirections from 'react-native-maps-directions'

const Map = ({
    params,
}) => {
    //TODO Dodać przyciski powiększania dodawania itp
    //TODO Dodać logikę komponentu na tryby edycji ścieżek i inne
    //TODO Rozdzielić na kilka pure komponentów
    //TODO Dodać możliwość tworzenia waypointów

    type zoom = {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
    }
    const [currentSubject, setCurrentSubject] = useState('defaultSuvject')
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [isEdit, setIsEdit] = useState<boolean>(false as boolean)
    const [selectedWaypoint, setSelectedWaypoint] = useState(-1)
    const [waypoints, setWaypoints] = useState(cloneDeep(waypointsApp))
    const [zoomVals, setZoomVals] = useState({} as zoom)


    const origin = { latitude: 50.29416, longitude: 18.66541 }
    const destination = { latitude: 50.29387, longitude: 18.66577 }

    const API_KEY = '***REMOVED***'

    const elo = useEffect(() => {
        MapboxGL.requestAndroidLocationPermissions().then(n => {
            setPermissionGranted(n)
        })

        setZoomVals(calcZoomValues())
    }, [])

    /**
     * no to ten, markery działają tak że jest edit mode i jak jest edit mode to ten, można je edytować i one istnieją, więc albo renderujemy je warunkowo albo umieszczamy warunkowe renderowanie w komponencie
     */


    //TODO uprościć funkcje zooma na początku mapy
    const calcZoomValues = (): zoom => {
        let minLat = 1000,
            minLon = 1000,
            maxLat = -1000,
            maxLon = -1000
        const retval: zoom = {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0,
            longitudeDelta: 0,
        }
        waypoints.forEach((n) => {
            minLat = Math.min(minLat, n.coordinates[0])
            maxLat = Math.max(maxLat, n.coordinates[0])
            minLon = Math.min(minLon, n.coordinates[1])
            maxLon = Math.max(maxLon, n.coordinates[1])
            console.log(n)
        })
        retval.latitude = (minLat + maxLat) / 2
        retval.longitude = (minLon + maxLon) / 2

        retval.latitudeDelta = maxLat - minLat + 0.001
        retval.longitudeDelta = maxLon - minLon + 0.001
        console.log(retval)
        return retval as zoom
    }
    //TODO zmienić to na komponent który generuje markery trasy

    const addWaypoint = (cords) => {
        setWaypoints([...waypoints,
        {
            "waypoint_id": "gliwice.rynek.ratusz",
            "coordinates": [
                cords.latitude,
                cords.longitude
            ],
            "type": "station",
            "displayed_name": "Rynek Rzeźba Madonny",
            "navigation_audio": "",
            "image": "image.station.gliwice.ratusz.icon",
            "introduction_audio": "audio.introduction.ratusz"
        }
        ])
    }
    const getCords = (waypoint) => {
        return { longitude: waypoint.coordinates[1], latitude: waypoint.coordinates[0] }
    }
    return (
        <View className="relative">
            <View className="w-full h-full bg-red-600">

                <MapView className="flex-1"
                    initialRegion={{
                        ...zoomVals
                    }}
                    onPress={(e) => {
                        isEdit && addWaypoint(e.nativeEvent.coordinate)
                        console.log(waypoints.slice(1, -1).map((value) => getCords(value)))
                    }}
                    customMapStyle={isEdit ? mapStylenoLandmarks : mapStylesJSON}
                >
                    <MapViewDirections
                        origin={getCords(waypoints[0])}
                        destination={getCords(waypoints[waypoints.length - 1])}
                        waypoints = {waypoints.slice(1, -1).map((value) => getCords(value))}
                        mode={"WALKING"}
                        apikey={API_KEY}
                        strokeWidth={3}
                        strokeColor="hotpink"
                        onReady={(n) => {
                            console.log(n)
                        }}
                    />


                    {/* <MapView.Callout></MapView.Callout> */}


                    <Markers waypoints={waypoints} isEdit={isEdit} updateWaypoints={() => {
                        setWaypoints([...waypoints])
                    }} />


                </MapView>

            </View>
            <View className="absolute  h-full w-full pointer-events-none">
                <TouchableOpacity
                    className="h-20 w-20 bg-yellow-300 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto"
                    onPress={() => {
                        setIsEdit(!isEdit); calcZoomValues()
                    }}>
                    <Text className="text-3xl" >
                        {isEdit ? "exit" : "+"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="h-20 w-20 bg-yellow-300 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto"
                    onPress={() => {
                        setIsEdit(!isEdit); calcZoomValues()
                    }}>
                </TouchableOpacity>
                <TouchableOpacity
                    className="h-20 w-20 bg-yellow-300 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto"
                    onPress={() => {
                        setIsEdit(!isEdit); calcZoomValues()
                    }}>
                </TouchableOpacity>
                <TouchableOpacity
                    className="h-20 w-20 bg-yellow-300 justify-center items-center rounded-full border-2 border-slate-400 self-end m-3 mt-auto"
                    onPress={() => {
                        setWaypoints([waypoints[0], waypoints[waypoints.length - 1]])
                    }}>
                    <Text>
                        delall
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Map



function undefined({ isEdit, markers }) {
    return (<View>
        {isEdit && markers}
    </View>)
}
