import * as React from "react";
import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Modal } from "react-native";
import tw from "../lib/tailwind";
import SquareButton from "./SquareButton";

interface SelectNameModalProps {
  visible: boolean;
  actionLeft: () => void;
  actionRight: (string: name) => void;
  onRequestClose: () => void;
}

const SelectNameModal = ({
  visible,
  actionLeft,
  actionRight,
  onRequestClose,
}: SelectNameModalProps) => {
  const [name, setName] = useState("");
  return (
    <Modal
      animationType={"fade"}
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View
        style={tw`flex items-center justify-center h-full bg-opacity-60 bg-black border-8 border-secondary-1`}>
        <View style={tw`w-4/5 bg-main-1 p-4 border-4 border-secondary-9`}>
          <Text style={tw`text-2xl font-bold`}>Wybierz Nazwę dla swojej mapy</Text>
          <TextInput
            style={tw`bg-main-1 border-2 border-secondary-9`}
            onChangeText={(text) => setName(text)}
            value={name}
          />
          <View style={tw`flex flex-row justify-center px-4 py-4 text-3xl`}>
            <SquareButton
              style={tw`w-auto px-2 h-10 `}
              label={"Anuluj"}
              onPress={() => {
                actionLeft();
                onRequestClose();
              }}></SquareButton>
            <SquareButton
              style={tw`w-auto px-2 h-10 `}
              label={"Zapiszs"}
              onPress={() => {
                if (name.trim() === "") return alert("Nazwa nie może być pusta");
                actionRight(name.trim());
                onRequestClose();
              }}></SquareButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SelectNameModal;
