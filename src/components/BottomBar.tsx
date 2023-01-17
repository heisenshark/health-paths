import { NavigationContainer, NavigationContainerRefWithCurrent } from "@react-navigation/native";
import * as React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import SquareButton from "./SquareButton";
import { StackActions } from "@react-navigation/native";

export interface BottomBarProps {
  navigationRef: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>;
  currentRoute: string;
}

export function BottomBar({ navigationRef, currentRoute }: BottomBarProps) {
  // console.log();
  const [setProgress, progress, setNavAction] = useMapStore((state) => [
    state.setProgress,
    state.progress,
    state.setNavAction,
  ]);
  const tabs = ["EdycjaMap"];
  const sensitiveTabs = ["Nagraj", "Planuj"];
  
  const tryToNavigate = (route: string, options?: any) => {
    if (route === currentRoute) return;
    if (sensitiveTabs.includes(currentRoute))
      setNavAction(() => {
        if (sensitiveTabs.includes(route))
          navigationRef.dispatch(StackActions.replace(route, options));
        else navigationRef.navigate(route, options);
      });
    else navigationRef.navigate(route, options);
  };

  const tabGUI = () => {
    return (
      <>
        <SquareButton
          label={"Pulpit"}
          uberActive={currentRoute === "Trasy"||!currentRoute}
          onPress={() => tryToNavigate("Trasy")}>
          <Icon name="home" size={50} color={"black"} />
        </SquareButton>
        <SquareButton
          label={"Nagraj"}
          uberActive={currentRoute === "Nagraj"}
          onPress={() =>
            tryToNavigate("Nagraj", {
              isRecording: true,
            })
          }
          icon={"record-vinyl"}></SquareButton>
        <SquareButton
          label={"Planuj"}
          uberActive={currentRoute === "Planuj"}
          onPress={() =>
            tryToNavigate("Planuj", {
              isRecording: false,
            })
          }
          icon={"map"}></SquareButton>
        <SquareButton
          label={"Opcje"}
          uberActive={currentRoute === "Opcje"}
          onPress={() => tryToNavigate("Opcje")}>
          <Icon name="lock" size={50} color={"black"} />
        </SquareButton>
      </>
    );
  };

  if (navigationRef.isReady() && navigationRef?.getCurrentRoute()?.name === "LogIn") return <></>;
  return (
    <>
      <Text>{currentRoute}</Text>
      <View
        style={tw`h-[28] bg-white flex-row items-center justify-around border-b-4 border-t-4 border-secondary-8`}>
        {!tabs.includes(currentRoute) ? (
          tabGUI()
        ) : (
          <>
            <SquareButton
              size={22}
              style={tw``}
              label="wróć"
              icon={"arrow-left"}
              onPress={() => {
                navigationRef.goBack();
              }}></SquareButton>
          </>
        )}
      </View>
    </>
  );
}
