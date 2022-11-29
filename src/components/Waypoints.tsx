import * as React from "react";
import { View, Text } from "react-native";
import Waypoint from "../utils/interfaces";

export interface WaypointsListProps {
  waypoints: Waypoint[];
}

export function WaypointsList({ waypoints }: WaypointsListProps) {
    return (
        <View>
            {waypoints.map((waypoint, index) => {
                return <Text>waypoint.coordinates</Text>;
            })}
        </View>
    );
}
