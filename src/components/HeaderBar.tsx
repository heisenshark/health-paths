import { View, Text } from "react-native";
import React from "react";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

type Props = {
  label: string;
  navigation?: any;
  useBack?: boolean;
  removeMargin?: boolean;
};

const HeaderBar = ({ label, navigation, useBack, removeMargin }: Props) => {
  
 return (
    <View
      style={[
        tw`flex-0 flex flex-row bg-slate-200 ${
          removeMargin ? "" : "mb-8"
        } border-b-2 border-slate-500 ${!useBack ? "justify-center" : ""} elevation-5`,
        { alignItems: "center" },
      ]}>
      {useBack && navigation&& (
        <SquareButton
          style={tw`m-2`}
          size={18}
          label="wróć"
          icon={"arrow-left"}
          onPress={() => navigation.goBack()}
        />
      )}
      <Text style={tw`text-center text-slate-800 text-4xl mt-2 mb-2 ml-2 font-medium underline`}>
        {label}
      </Text>
    </View>
  );
};

export default HeaderBar;
