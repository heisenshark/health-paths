import * as React from "react";
import { View, Text } from "react-native";
import Modal from "react-native-modal/dist/modal";
import { Title } from "react-native-paper";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

export interface ModalChoiceProps {
  visible: boolean;
  titles: string[];
  buttonIcons?: string[];
  actionLeft: () => void;
  actionRight: () => void;
  onRequestClose: () => void;
}

export function ModalChoice({
  visible,
  titles,
  buttonIcons,
  actionLeft,
  actionRight,
  onRequestClose,
}: ModalChoiceProps) {
  const useIcons = buttonIcons && buttonIcons.length >= 2;
  return (
    <Modal
      isVisible={visible}
      testID={"modal"}
      swipeThreshold={100}
      swipeDirection={["down"]}
      animationIn={"zoomIn"}
      animationOut={"zoomOut"}
      style={tw`flex flex-1 justify-center items-center m-0 `}
      backdropOpacity={0.1}
      onSwipeComplete={onRequestClose}
      onBackdropPress={onRequestClose}
      onBackButtonPress={onRequestClose}>
      {/* <View style={tw`bg-slate-300 border-t-4 border-t-slate-200`}> 
        <Text style={tw`text-2xl font-bold pl-4 py-2`}>{titles[0]}</Text>
        <View style={tw`flex flex-row justify-center px-4 py-8 text-3xl`}>
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
      </View> */}
      <View style={tw` bg-main-100 elevation-5 mx-10`}>
        <Text style={tw`text-center text-3xl py-3`}>{titles[0]}</Text>
        <View style={tw`flex flex-row w-full justify-evenly`}>
          <SquareButton
            style={tw`mx-4`}
            size={30}
            label={titles[1]}
            icon={useIcons && buttonIcons[0]}
            onPress={actionLeft}></SquareButton>
          <SquareButton
            style={tw`mr-4`}
            label={titles[2]}
            icon={useIcons && buttonIcons[1]}
            size={30}
            onPress={actionRight}></SquareButton>
        </View>
        <View style={tw`w-full p-4 flex flex-row justify-center items-center`}>
          <SquareButton
            label={"Wróć"}
            size={20}
            onPress={onRequestClose}
            icon="arrow-left"></SquareButton>
        </View>
      </View>
    </Modal>
  );
}
