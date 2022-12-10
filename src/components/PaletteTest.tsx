import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import tw from "../lib/tailwind";

interface PaletteTestProps {
  paletteName: string;
  values?: string[];
}

const PaletteTest = ({ paletteName, values }: PaletteTestProps) => {
  if (values === undefined || values.length === 0)
    values = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <View style={tw`flex flex-row`}>
      {values.map((value, index) => {
        return <View key={index} style={tw`bg-${paletteName}-${value} w-10 h-10`} />;
      })}
    </View>
  );
};

export default PaletteTest;
