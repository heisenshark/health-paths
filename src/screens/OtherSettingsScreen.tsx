import { View, Text, ToastAndroid } from "react-native";
import React from "react";
import tw from "../lib/tailwind";
import TileButton from "../components/TileButton";
import { getLocationPermissions } from "../utils/HelperFunctions";
import HeaderBar from "../components/HeaderBar";

type Props = {};

const OtherSettingsScreen = ({ route, navigation }) => {
  return (
    <View style={tw`flex bg-slate-100 h-full`}>
      <HeaderBar label={"USTAWIENIA"} navigation={navigation} useBack />
      <View style={tw`h-40`}>
        <TileButton
          label="poproś o uprawnienia"
          icon="map"
          style={tw`mx-10 mb-4`}
          size={90}
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
    </View>
  );
};

export default OtherSettingsScreen;
