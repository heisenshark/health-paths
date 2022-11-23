import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const RoundedButton = ({
  style = {},
  textStyle = {},
  size = 24,
  ...props
}) => {

  return (
    <TouchableOpacity className={"rounded-full aspect-square m-3 items-center justify-center border-black border-2 " + `w-${size}`}  onPress={props.onPress}>
      <Text className={"text-4xl text-slate-600 "}>{props.title}</Text>
      <Text className = "shadow-fuchsia-50"></Text>
    </TouchableOpacity>
  );
};