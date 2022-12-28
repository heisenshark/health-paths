import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Modal, ScrollView, Image } from "react-native";
import { TextInput } from "react-native-paper";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import SquareButton from "./SquareButton";

interface MapInfoModalProps {
  visible: boolean;
  onRequestClose: () => void;
  onSave: (name: string, description: string) => void;
}

const MapInfoModal = ({ visible, onRequestClose, onSave }: MapInfoModalProps) => {
  const [currentMap] = useMapStore((state) => [state.currentMap]);
  const [name, setName] = useState(currentMap.name);
  const [desc, setDesc] = useState(currentMap.description);
  useEffect(() => {
    if (visible) {
      setName(currentMap.name);
      setDesc(currentMap.description);
    }
  }, [visible]);
  return (
    // <Text>ss</Text>
    <Modal
      animationType={"slide"}
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={tw`bg-transparent w-full h-full flex flex-col-reverse`}>
        <View style={tw`bg-white w-full`}>
          <Text style={tw`text-lg p-5`}>Dodaj informacje o ścieżce</Text>
          <TextInput
            style={tw`text-lg mx-5 mb-2`}
            label={"Nazwa"}
            value={name}
            onChangeText={(text) => {
              setName(text);
            }}
          />
          <TextInput
            style={tw`text-lg mx-5 mb-2`}
            label={"Opis"}
            value={desc}
            onChangeText={(text) => {
              setDesc(text);
            }}
          />
          <View style={tw`mx-5 my-2 flex flex-row justify-between`}>
            <SquareButton
              style={tw`flex-1 mx-2`}
              size={10}
              label="Anuluj"
              onPress={onRequestClose}></SquareButton>
            <SquareButton
              style={tw`flex-1 mx-2`}
              size={10}
              label="Zapisz"
              onPress={() => {
                onSave(name, desc);
                onRequestClose();
              }}></SquareButton>
          </View>
        </View>
        <View
          style={tw`flex-1 bg-black bg-opacity-50`}
          onStartShouldSetResponder={onRequestClose}
        />
      </View>
    </Modal>
  );
};

export default MapInfoModal;
