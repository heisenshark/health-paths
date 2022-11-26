import * as React from 'react'
import { useEffect, useState } from 'react'
import { View, Text, Image } from 'react-native'
import { brightness, ColorMatrix, concatColorMatrices } from 'react-native-color-matrix-image-filters'
import { Callout, Marker, Polyline } from 'react-native-maps'

export interface MarkersProps {
    waypoints: any[],
    isEdit: boolean,
    updateWaypoints: () => {}
}

export function Markers<Props>({ waypoints, isEdit, updateWaypoints }) {


    const [edittedWaypoint, setEdittedWaypoint] = useState(1)
    const [selectedWaypoint, setSelectedWaypoint] = useState(1)

    useEffect(() => {
        console.log("zmiana")
    }, [isEdit])

    const addWaypoint = (cords) => {
        waypoints = ([...waypoints,
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


    const markers = waypoints.map((n, index) => {



        if (isEdit || index === waypoints.length - 1 || index == 0)
            return <Marker
                key={index}
                coordinate={{ longitude: n.coordinates[1], latitude: n.coordinates[0] }}
                title={n.displayed_name}
                description={n.type}
                onPress={() => {
                    (index)
                }}
                onDrag={(e) => {
                    /**  waypoints[index].coordinates = [c.latitude, c.longitude]; */
                }}
                onDragEnd={(e) => {
                    n.coordinates = [e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude]
                    updateWaypoints()
                }}
                draggable={isEdit}
                tappable={false}
                pinColor={index == 0 ? 'blue' : 'yellow'}
                className="flex "
            >
                {index == 0 &&


                    <View className="flex-1 items-center justify-end h-auto w-auto">
                        <Text>Start</Text>
                        <Image
                            source={imageStart}
                            resizeMode="center"
                            resizeMethod='resize'
                            className={`flex-1 w-12 h-12 ${selectedWaypoint == index ? '' : ''}`}
                        />
                    </View>}

                {index == waypoints.length - 1 && <View className="flex-1 items-center justify-end h-auto w-auto">
                    <Text>Koniec</Text>
                    <Image
                        source={imageEnd}
                        resizeMode="center"
                        resizeMethod='resize'
                        className={`flex-1 w-12 h-12 ${selectedWaypoint == index ? '' : ''}`}
                    />
                </View>}






                <Callout tooltip={true}>
                    <Text></Text>
                </Callout>
            </Marker>
    })

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
    )
}

const imageEnd = require('../../assets/map-end-marker.png')
const imageStart = require('../../assets/map-start-marker.png')
const marker = require('../../assets/map-marker.png')
