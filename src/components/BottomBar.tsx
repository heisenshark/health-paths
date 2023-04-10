import { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";
/**
 * @property {NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>} navigationRef referencja do obiektu nawigacji
 * @property {string} currentRoute aktualna ścieżka w nawigacji
 * @interface BottomBarProps
 * @export
 */
export interface BottomBarProps {
  navigationRef: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>;
  currentRoute: string;
}

/**
 * Komponent paska nawigacyjnego na dole ekranu, wyświetlający przyciski nawigacyjne
 * @export
 * @param {BottomBarProps} { navigationRef, currentRoute }
 * @component
 */
export function BottomBar({ navigationRef, currentRoute }: BottomBarProps) {
  const tabs = ["Trasy", "Nagraj", "Planuj", "Opcje"];
  const sensitiveTabs = ["Nagraj", "Planuj"];

  /**
   * Funkcja próbująca nawigować do podanej ścieżki, jeśli
   * aktualnie użytkownik jest na ekranie planowania lub nagrywania trasy wyświetla na nim modal z pytaniem o zapisanie zmian
   * @param {string} route trasa do której ma być nawigacja
   * @param {*} [options] opcje nawigacji
   */
  const tryToNavigate = (route: string, options?: any) => {
    if (route === currentRoute) return;
    if (sensitiveTabs.includes(currentRoute)) {
      navigationRef.setParams({
        ...navigationRef.getCurrentRoute().params,
        navigateTo: { route, params: options },
      });
    } else navigationRef.navigate(route, options);
  };

  const tabGUI = () => {
    return (
      <>
        <SquareButton
          label={"Pulpit"}
          active={currentRoute === "Trasy" || !currentRoute}
          onPress={() => {
            tryToNavigate("Trasy");
          }}
          icon={"home"}
        />
        <SquareButton
          label={"Nagraj"}
          active={currentRoute === "Nagraj"}
          onPress={() =>
            tryToNavigate("Nagraj", {
              isRecording: true,
            })
          }
          icon={"record-vinyl"}
        />
        <SquareButton
          label={"Planuj"}
          active={currentRoute === "Planuj"}
          onPress={() =>
            tryToNavigate("Planuj", {
              isRecording: false,
            })
          }
          icon={"map"}
        />
        <SquareButton
          label={"Profil"}
          active={currentRoute === "Opcje"}
          onPress={() => tryToNavigate("Opcje")}
          icon={"lock"}
        />
      </>
    );
  };

  return (
    <>
      {tabs.includes(currentRoute) && (
        <View
          style={tw`h-[26] bg-slate-600 flex-row items-center justify-evenly border-t-4 border-t-slate-400`}>
          {tabGUI()}
        </View>
      )}
    </>
  );
}
