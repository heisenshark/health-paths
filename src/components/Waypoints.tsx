import * as React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Card, TextInput } from "react-native-paper";
import tw from "../lib/tailwind";
import Waypoint from "../utils/interfaces";

export interface WaypointsListProps {
  waypoints: Waypoint[];
  onDelete: (id: number) => void;
}

export function WaypointsList({ waypoints, onDelete }: WaypointsListProps) {
    return (
        <ScrollView style={tw`absolute flex-1 bg-white w-full h-64 pointer-events-none`}>
            {waypoints.map((waypoint: Waypoint, index) => {
                return (
                    <Card key={index} style={tw`px-3 py-1 m-1 elevation-5`}>
                        <View style={tw`flex flex-row`}>
                            <Text style={tw`text-3xl`}>{index}.</Text>
                            <Text style={tw`w-4/6`}>
                                {waypoint.coordinates.latitude} :: {waypoint.coordinates.longitude}
                            </Text>
                            <TouchableOpacity
                                style={tw`w-2/6 flex-1 flex items-center justify-center`}
                                onPress={() => onDelete(index)}>
                                <Text style={tw`h-max text-2xl text-center align-middle`}>X</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                );
            })}
            <View style={tw`h-1`}></View>
        </ScrollView>
    );
}
