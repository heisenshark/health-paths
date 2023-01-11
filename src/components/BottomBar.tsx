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
  // console.log();
  if (navigationRef.isReady()&&navigationRef?.getCurrentRoute()?.name === "LogIn")
    return <></>;
  return (
    <View
      style={tw`h-[28] bg-white flex-row items-center justify-around border-b-4 border-t-4 border-secondary-8`}>
      <SquareButton
        label={"Pulpit"}
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
          navigationRef.navigate("Nagraj", {
            isRecording: true,
          });
        }}
        icon={"record-vinyl"}></SquareButton>
      <SquareButton
        label={"Planuj"}
        uberActive={currentRoute === "Nagraj"}
        onPress={() => {
          navigationRef.navigate("Nagraj", {
            isRecording: false,
          });
        }}
        icon={"map"}></SquareButton>
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
