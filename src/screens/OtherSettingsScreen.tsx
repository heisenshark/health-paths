import { View, Text, ToastAndroid } from "react-native";
import React from "react";
import tw from "../lib/tailwind";
import TileButton from "../components/TileButton";
import { getLocationPermissions } from "../utils/HelperFunctions";

type Props = {};

const OtherSettingsScreen = ({ route, navigation }) => {
  return (
    <View style={tw`flex bg-slate-100 h-full`}>
      <View
        style={[
          tw`flex-0 flex flex-row bg-slate-200 mb-8 border-b-2 border-slate-500 justify-center elevation-5`,
          { alignItems: "center" },
        ]}>
        <Text style={tw`text-center text-slate-800 text-4xl mt-2 mb-2 ml-2 font-medium underline`}>
          Ustawienia
        </Text>
      </View>
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
