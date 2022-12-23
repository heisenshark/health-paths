import * as React from "react";
import tw from "../lib/tailwind";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Card } from "react-native-paper";
import { LatLng } from "react-native-maps";

export interface WaypointsListProps {
  waypoints: LatLng[];
  onDelete: (id: number) => void;
}

export function WaypointsList({ waypoints, onDelete }: WaypointsListProps) {
  return (
    <ScrollView style={tw`absolute flex-1 bg-white w-full h-64`}>
      {waypoints.map((waypoint: LatLng, index) => {
        return (
          <Card key={index} style={tw`px-3 py-1 m-1 elevation-5`}>
            <View style={tw`flex flex-row`}>
              <Text style={tw`text-3xl`}>{index + 1}.</Text>
              <Text style={tw`w-4/6`}>
                {waypoint.latitude} :: {waypoint.longitude}
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
