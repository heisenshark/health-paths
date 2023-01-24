import { View, Text, Touchable, TouchableOpacity } from "react-native";
import React from "react";
import { Style } from "twrnc/dist/esm/types";

type Props = {
  label: string;
  onPress: () => void;
  style?: Style;
};

const TileButton = ({ onPress }: Props) => {
  return (
    <View>
      <TouchableOpacity onPress={onPress}>
       <Text>
        
       </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TileButton;
