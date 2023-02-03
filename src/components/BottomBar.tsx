import { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import * as React from "react";
import { View, Text } from "react-native";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import SquareButton from "./SquareButton";

export interface BottomBarProps {
  navigationRef: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>;
  currentRoute: string;
}
//TODO dodać jakikolwiek handling screenó innych niż 4 podstawow
export function BottomBar({ navigationRef, currentRoute }: BottomBarProps) {
  // console.log();
  const [setNavAction] = useMapStore((state) => [state.setNavAction]);
  const tabs = ["Trasy", "Nagraj", "Planuj", "Opcje"];
  const sensitiveTabs = ["Nagraj", "Planuj"];

  const tryToNavigate = (route: string, options?: any) => {
    console.log("routeto: ", route, "current: ", currentRoute);
    console.log("navigation");

    if (route === currentRoute) return;
    if (sensitiveTabs.includes(currentRoute)) {
      navigationRef.setParams({
        ...navigationRef.getCurrentRoute().params,
        navigateTo: { route, params: options },
      });
      // setNavAction(() => {
      //   if (sensitiveTabs.includes(route)) {
      //     navigationRef.dispatch(StackActions.replace(route, options));
      //   } else navigationRef.navigate(route, options);
      // });
    } else navigationRef.navigate(route, options);
  };

  const tabGUI = () => {
    return (
      <>
        <SquareButton
          label={"Pulpit"}
          uberActive={currentRoute === "Trasy" || !currentRoute}
          onPress={() => {
            tryToNavigate("Trasy");
            console.log("siema");
          }}
          icon={"home"}
        />
        <SquareButton
          label={"Nagraj"}
          uberActive={currentRoute === "Nagraj"}
          onPress={() =>
            tryToNavigate("Nagraj", {
              isRecording: true,
            })
          }
          icon={"record-vinyl"}
        />
        <SquareButton
          label={"Planuj"}
          uberActive={currentRoute === "Planuj"}
          onPress={() =>
            tryToNavigate("Planuj", {
              isRecording: false,
            })
          }
          icon={"map"}
        />
        <SquareButton
          label={"Profil"}
          uberActive={currentRoute === "Opcje"}
          onPress={() => tryToNavigate("Opcje")}
          icon={"lock"}
        />
      </>
    );
  };

  return (
    <>
      {/* <Text>{currentRoute}</Text> */}
      {tabs.includes(currentRoute) && (
        <View
          style={tw`h-[26] bg-slate-600 flex-row items-center justify-evenly border-t-4 border-t-slate-400`}>
          {tabs.includes(currentRoute) ? (
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
      )}
    </>
  );
}
