import { View, Text, ToastAndroid } from "react-native";
import React from "react";
import tw from "../lib/tailwind";
import TileButton from "../components/TileButton";
import { getLocationPermissions } from "../utils/HelperFunctions";
import HeaderBar from "../components/HeaderBar";

/**
 * Ekran ustawień aplikacji, wyświetla przycisk do poproszenia o uprawnienia do lokalizacji oraz autora aplikacji
 * @category Ekrany
 * @param {*} navigation_props { route, navigation }
 * @component
 */
const OtherSettingsScreen = ({ route, navigation }) => {
  return (
    <View style={tw`flex bg-slate-100 h-full`}>
      <HeaderBar label={"USTAWIENIA"} useBack />
      <View style={tw`h-40`}>
        <TileButton
          label="poproś o uprawnienia"
          icon="map"
          style={tw`mx-10 mb-4`}
          onPress={async () => {
            const res = await getLocationPermissions();
            if (res) {
              ToastAndroid.showWithGravity(
                "Uprawnienia udzielone",
                ToastAndroid.SHORT,
                ToastAndroid.LONG
              );
            }
          }}
        />
      </View>

      <View>
        <Text style={tw`text-3xl text-center mx-10 font-bold  my-4`}>
          Aplikacja Ścieżki Zdrowia 1.0
        </Text>
        <Text style={tw`text-3xl text-center mx-10 font-bold  my-4`}>
          Aplikacjia stworzona w ramach projektu inżynierskiego
        </Text>
        <Text style={tw`text-3xl text-center mx-10 font-bold  my-4`}>Autor: Tomasz Stefaniak</Text>
      </View>
    </View>
  );
};

export default OtherSettingsScreen;
