import React from "react";
import { Text, View } from "react-native";

export function CircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
        </svg>
    );
}


const HomeIcon = ({
    params,
}) => (
    <View>
        <Text>HomeIcon</Text>
    </View>
);

export default HomeIcon;
