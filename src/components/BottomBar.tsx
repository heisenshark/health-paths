import * as React from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

export interface BottomBarProps {
  navigationRef: any;
  currentRoute: string;
}

export function BottomBar({ navigationRef, currentRoute }: BottomBarProps) {
  return (
    <View
      style={tw`h-[32] bg-secondary-5 flex-row items-center justify-around border-b-4 border-t-4 border-secondary-8`}>
      <SquareButton
        label={"Trasy"}
        uberActive={currentRoute === "Trasy"}
        onPress={() => {
          navigationRef.navigate("Trasy");
        }}>
        <Icon name="home" size={50} color={"black"} />
      </SquareButton>
      <SquareButton
        label={"Nagraj"}
        uberActive={currentRoute === "Nagraj"}
        onPress={() => {
          navigationRef.navigate("Nagraj");
        }}
        size={28}>
        <Icon name="map" size={75} color={"black"} />
      </SquareButton>
      <SquareButton
        label={"Opcje"}
        uberActive={currentRoute === "Opcje"}
        onPress={() => {
          navigationRef.navigate("Opcje");
        }}>
        <Icon name="lock" size={50} color={"black"} />
      </SquareButton>
    </View>
  );
}
