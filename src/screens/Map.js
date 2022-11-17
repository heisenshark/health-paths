import { Text, View, TouchableOpacity, Image } from 'react-native'
import { React, useEffect, useState } from 'react'
import MapboxGL from '@rnmapbox/maps'
import MapView, { Callout, Circle, Marker, Polyline } from 'react-native-maps'
import { cloneDeep } from 'lodash'
import { mapStylenoLandmarks, mapStylesJSON, waypointsApp } from '../providedfiles/Export'
import { ColorMatrix, concatColorMatrices, saturate, invert, contrast, hueRotate, brightness } from 'react-native-color-matrix-image-filters'

const Map = ({
    params,
}) => {

    const [currentSubject, setCurrentSubject] = useState('defaultSuvject')
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [selectedWaypoint, setSelectedWaypoint] = useState(-1)
    const [waypoints, setWaypoints] = useState(cloneDeep(waypointsApp))
    const [zoomVals, setZoomVals] = useState({})
    const elo = useEffect(() => {
        MapboxGL.requestAndroidLocationPermissions().then(n => {
            setPermissionGranted(n)
        })

        setZoomVals(calcZoomValues())
    }, [])


    const calcZoomValues = () => {
        const retval = {
            minLat: 1000,
            minLon: 1000,
            maxLat: -1000,
            maxLon: -1000,
            centerLat: 0,
            centerLon: 0,
            deltaLat: 0,
            deltaLon: 0,
        }
        waypoints.forEach((n) => {
            retval.minLat = Math.min(retval.minLat, n.coordinates[0])
            retval.maxLat = Math.max(retval.maxLat, n.coordinates[0])
            retval.minLon = Math.min(retval.minLon, n.coordinates[1])
            retval.maxLon = Math.max(retval.maxLon, n.coordinates[1])
            console.log(n)
        })
        retval.centerLat = (retval.minLat + retval.maxLat) / 2
        retval.centerLon = (retval.minLon + retval.maxLon) / 2

        retval.deltaLat = retval.maxLat - retval.minLat + 0.001
        retval.deltaLon = retval.maxLon - retval.minLon + 0.001
        console.log(retval)
        return retval
    }
    const markers = waypoints.map((n, index) => {
        return <Marker
            key={index}
            coordinate={{ longitude: n.coordinates[1], latitude: n.coordinates[0] }}
            title={n.displayed_name}
            description={n.type}
            onPress={() => {
                setSelectedWaypoint(index)
            }}
            onDrag={(e) => {
                /**  waypoints[index].coordinates = [c.latitude, c.longitude]; */
            }}
            onDragEnd={(e) => {
                n.coordinates = [e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude]
                setWaypoints([...waypoints])
            }}
            draggable={isEdit}
            tappable={false}
            pinColor={index == 0 ? 'blue' : 'yellow'}
            className="flex "
        >
            <View className="flex-1 items-center justify-end h-auto w-auto">

                <ColorMatrix className="flex items-center" matrix={concatColorMatrices(brightness(1))}>
                    {index == 0 && <Text>Start</Text>}
                    {index == waypoints.length - 1 && <Text>Koniec</Text>}
                    <Image source={
                        index == 0 ? imageStart : index == waypoints.length - 1 ? imageEnd : marker
                    }
                    resizeMode="center"
                    resizeMethod='resize'
                    className={`flex-1 w-12 h-12 ${selectedWaypoint == index ? '' : ''}`}
                    >


                    </Image>
                </ColorMatrix>
            </View>
            <Callout tooltip={true}>
                <Text></Text>
            </Callout>
        </Marker>
    })

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
                        latitude: zoomVals.centerLat,
                        longitude: zoomVals.centerLon,
                        latitudeDelta: (zoomVals.deltaLat),
                        longitudeDelta: (zoomVals.deltaLon),
                    }}
                    onPress={(e) => {
                        isEdit && addWaypoint(e.nativeEvent.coordinate)
                    }}
                    customMapStyle={isEdit ? mapStylenoLandmarks : mapStylesJSON}
                >


                    {/* <MapView.Callout></MapView.Callout> */}
                    {isEdit && markers}

                    <Polyline
                        coordinates={
                            waypoints.map(n => { return { longitude: n.coordinates[1], latitude: n.coordinates[0] } })
                        }
                        strokeColor="#000"
                        strokeWidth={6}
                    />

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
            </View>
        </View>
    )
}

export default Map

const imageEnd = require('../../assets/map-end-marker.png')
const imageStart = require('../../assets/map-start-marker.png')

const marker = require('../../assets/map-marker.png')