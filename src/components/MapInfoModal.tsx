import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Modal, ScrollView, Image } from "react-native";
import { CheckBox } from "react-native-elements";
import { TextInput } from "react-native-paper";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import SquareButton from "./SquareButton";
interface MapInfoModalProps {
  visible: boolean;
  onRequestClose: () => void;
  onSave: (name: string, description: string, asNew: boolean) => void;
}

const MapInfoModal = ({ visible, onRequestClose, onSave }: MapInfoModalProps) => {
  const [currentMap] = useMapStore((state) => [state.currentMap]);
  const [name, setName] = useState({ text: currentMap.name, error: false });
  const [desc, setDesc] = useState("");
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSaveAsNew(false);
    if (visible) {
      setName({ error: false, text: currentMap.name });
      setError("");
      setDesc("");
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
          <View style={tw`mx-3`}>
            <CheckBox
              textStyle={tw`text-xl`}
              size={40}
              title={"Zapisz jako nowa mapa"}
              checked={saveAsNew}
              onPress={() => {
                if (saveAsNew == false) {
                  name.text === currentMap.name && setName({ text: currentMap.name, error: false });
                  desc === currentMap.description && setDesc(currentMap.description);
                } else {
                  name.text === "" && setName({ text: currentMap.name, error: false });
                  desc === "" && setDesc(currentMap.description);
                }
                setSaveAsNew((n) => !n);
              }}></CheckBox>
          </View>
          <TextInput
            style={tw`text-lg mx-5 mb-2`}
            label={"Nazwa"}
            value={name.text}
            onChangeText={(text) => {
              if (text !== "" && error !== "") {
                setError("");
              }
              setName({ error: text === "", text: text });
            }}
            error={name.error}
          />
          {<Text style={tw`text-red-500 ml-7 text-left pb-2`}>{error}</Text>}
          <TextInput
            style={tw`text-lg mx-5 mb-2`}
            label={"Opis"}
            value={desc}
            onChangeText={(text) => {
              setDesc(text);
            }}
            focusable={true}
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
                if (name.text === "") {
                  setName({ ...name, error: true });
                  setError("Nazwa nie może być pusta");
                  return;
                }
                onSave(name.text, desc, saveAsNew);
                onRequestClose();
              }}></SquareButton>
          </View>
        </View>
        <View
          style={tw`flex-1 bg-black bg-opacity-50`}
          onStartShouldSetResponder={() => {
            onRequestClose();
            return true;
          }}
        />
      </View>
    </Modal>
  );
};

export default MapInfoModal;
