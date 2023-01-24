import { View, Text } from "react-native";
import React from "react";
import { Style } from "twrnc/dist/esm/types";
import tw from "../lib/tailwind"

type Props = {
  children: React.ReactNode;
  style?: Style;
};

const AppText = ({ children, style }: Props) => {
  return <Text style={[style,tw`sans`]}>{children}</Text>;
};

export default AppText;
