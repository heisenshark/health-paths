import * as React from "react";
import { View, Text, Modal } from "react-native";
import { Title } from "react-native-paper";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

export interface ModalChoiceProps {
  visible: boolean;
  titles: string[];
  actionLeft: () => void;
  actionRight: () => void;
  onRequestClose: () => void;
}

export function ModalChoice({
  visible,
  titles,
  actionLeft,
  actionRight,
  onRequestClose,
}: ModalChoiceProps) {
  return (
    <Modal
      animationType={"fade"}
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View
        style={tw`flex items-center justify-center h-full bg-opacity-60 bg-black border-8 border-secondary-1`}>
        <View style={tw`w-4/5 bg-main-1 p-4 border-4 border-secondary-9`}>
          <Text style={tw`text-2xl font-bold`}>{titles[0]}</Text>
          <View style={tw`flex flex-row justify-center px-4 py-4 text-3xl`}>
            <SquareButton
              style={tw`w-auto px-2 h-10 `}
              label={titles[1]}
              onPress={() => {
                actionLeft();
                onRequestClose();
              }}></SquareButton>
            <SquareButton
              style={tw`w-auto px-2 h-10 `}
              label={titles[2]}
              onPress={() => {
                actionRight();
                onRequestClose();
              }}></SquareButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}
