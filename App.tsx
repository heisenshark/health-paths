// import { StatusBar as ExpoStatusBar } from "expo-status-bar";
// import { useEffect, useState } from "react";
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
} from "react-native";
// import { Button } from "react-native-paper";
// import MapboxGL from "@rnmapbox/maps";
// import MapView, { Circle, Marker, Polyline , enableLatestRenderer } from "react-native-maps";
// import { cloneDeep } from "lodash";

// import { RoundedButton } from "./src/components/RoundedButton";
// import { exampleGeojsonFeatureCollection, exampleGeojsonFeatureCollection_Shape } from "./src/utils/maps";
// import CircleIcon from "./src/utils/Icons";
// import { featuresRynek, waypointsApp } from "./src/providedfiles/Export";
import Map from "./src/screens/Map";
import { NavigationContainer } from "@react-navigation/native";
import {
    BottomTabBarButtonProps,
    BottomTabNavigationOptions,
    createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import HomeScreen from "./src/screens/HomeScreen";
// import { NativeWindStyleSheet, useColorScheme } from "nativewind";
import Icon from "react-native-vector-icons/FontAwesome";
import tw from "./src/lib/tailwind";
import SquareButton from "./src/components/SquareButton";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack"
// MapboxGL.setWellKnownTileServer('Mapbox')
// MapboxGL.setAccessToken('sk.eyJ1IjoidG9tYXN0ZTUzNyIsImEiOiJjbGFkNXJjcXUwOW5wM3FwY28xbjViazZyIn0.vUZLGkJ8fQcjFM_NDhaIQQ')

const Tab = createBottomTabNavigator();
const Nor = createNativeStackNavigator()
console.log(StatusBar.currentHeight);
export default function App() {
    const buttonStyle = tw`self-center items-center grow shrink`;
    return (
    //TODO finish settings screen
    //TODO finish mapselect screen
    //TODO finish info screen
    //TODO finish mymaps screen
    //TODO add tracking position and making tracks by gps
    //TODO dodać możliwość eksportu mapy
    //TODO dodać możliwość udostępnienia mapy przez watsapp

        <NavigationContainer>
            {/* <Stack.Navigator screenOptions={{
        headerShown: false
      }}
      >
    </Stack.Navigator> */}
            <Tab.Navigator
                screenOptions={{
                    // ...templateScreenOptions,
                    // tabBarItemStyle: tw`bg-slate-100 w-24 h-24 self-center mx-4 justify-center items-center border-2 my-auto rounded-2xl grow-0 shrink`,
                    tabBarStyle: tw`bg-main flex flex-row h-28 justify-end items-center border-4 border-secondary`,
                    tabBarLabelStyle: tw`text-lg text-secondary-1 underline font-bold`,
                    headerShown: false,
                    tabBarActiveTintColor: "white",
                    tabBarInactiveBackgroundColor: "white",
                }}>
                <Tab.Screen
                    name="Trasy"
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ focused, color, size }) => (
                            <Icon name="home" size={50} color={focused ? "black" : ""} />
                        ),
                        tabBarButton: (props: BottomTabBarButtonProps) => {
                            console.log(props);
                            return (
                                <View style={buttonStyle}>
                                    <SquareButton onPress={props.onPress} label="Home">
                                        <Icon
                                            name="home"
                                            size={50}
                                            color={props.accessibilityState.selected ? "white" : "black"}
                                        />
                                    </SquareButton>
                                </View>
                            );
                        },
                    }}
                />
                <Tab.Screen
                    name="Nagraj"
                    component={Map}
                    options={{
                        ...mainButtonNav,
                        tabBarIcon: ({ color, size }) => <Icon name="map" size={50} color="black" />,
                        tabBarButton: (props: BottomTabBarButtonProps) => {
                            console.log(props);
                            return (
                                <View style={buttonStyle}>
                                    <SquareButton onPress={props.onPress} label="Home">
                                        <Icon
                                            name="home"
                                            size={50}
                                            color={props.accessibilityState.selected ? "white" : "black"}
                                        />
                                    </SquareButton>
                                </View>
                            );
                        },
                    }}
                />
                <Tab.Screen
                    name="Opcje"
                    component={Map}
                    options={{
                        tabBarIcon: ({ color, size }) => <Icon name="lock" size={50} color="black" />,
                        tabBarButton: (props: BottomTabBarButtonProps) => {
                            console.log(
                                props,
                                tw`bg-main flex-row h-28 justify-center items-center border-4 border-secondary`
                            );
                            return (
                                <View style={buttonStyle}>
                                    <SquareButton onPress={props.onPress} label="Home">
                                        <Icon
                                            name="home"
                                            size={50}
                                            color={props.accessibilityState.selected ? "white" : "black"}
                                        />
                                    </SquareButton>
                                </View>
                            );
                        },
                    }}
                />
                {/* <Tab.Screen
                    name="Options"
                    component={Map}
                    options={{
                        tabBarIcon: ({ color, size }) => <Icon name="lock" size={50} color="black" />,
                    }}
                /> */}
            </Tab.Navigator>
        </NavigationContainer>
    );
}
//TODO dać jakikolwiek feedback na press i inne
const mainButtonNav = {
    tabBarItemStyle: tw`self-center w-24 h-24 bg-main border-2 border-secondary rounded-2xl grow-0 shrink`,
    tabBarLabelStyle: tw`font-bold text-lg text-secondary-1 underline`,
};

const templateScreenOptions: BottomTabNavigationOptions = {
    tabBarItemStyle: tw`bg-main w-24 h-24 self-center mx-4 justify-center items-center border-2 my-auto rounded-2xl grow-0 shrink bg-slate-900`,
    tabBarStyle: tw`bg-main flex flex-row h-28 justify-around items-center border-4 border-secondary`,
    tabBarLabelStyle: tw`text-lg text-secondary-1 underline font-bold`,
    headerShown: false,
};
