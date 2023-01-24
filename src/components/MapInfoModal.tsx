import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Modal, ScrollView, Image, ToastAndroid } from "react-native";
import { CheckBox } from "react-native-elements";
import { TextInput } from "react-native-paper";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import SquareButton from "./SquareButton";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import { MediaFile } from "../utils/interfaces";
import { getURI } from "./../utils/FileSystemManager";

interface MapInfoModalProps {
  visible: boolean;
  onRequestClose: () => void;
  onSave: (
    name: string,
    description: string,
    asNew: boolean,
    mapIcon: MediaFile
  ) => Promise<boolean>;
}

const MapInfoModal = ({ visible, onRequestClose, onSave }: MapInfoModalProps) => {
  const [currentMap] = useMapStore((state) => [state.currentMap]);
  const [name, setName] = useState({ text: currentMap.name, error: false });
  const [desc, setDesc] = useState("");
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const mapIcon = useRef<MediaFile>(undefined);

  useEffect(() => {
    setSaveAsNew(false);
    if (visible) {
      console.log(currentMap.imageIcon);

      setName({ error: false, text: currentMap.name });
      setError("");
      setDesc(currentMap.description);
      if (currentMap.imageIcon) {
        setImage(getURI(currentMap, currentMap.imageIcon));
        mapIcon.current = currentMap.imageIcon;
      }
      console.log(mapIcon.current);
    }
  }, [visible]);

  const pickImage = async ({ isCamera }: { isCamera: boolean }) => {
    // No permissions request is necessary for launching the image library
    let result = isCamera
      ? await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.3,
        aspect: [1, 1],
      })
      : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
      });
    console.log(result);

    if (result.canceled) return;

    setImage(result.assets[0].uri);

    const imageRes = {
      media_id: uuid.v4(),
      path: result.assets[0].uri,
      type: "image",
      storage_type: "cache",
    } as MediaFile;
    mapIcon.current = imageRes;
  };

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
                  name.text === currentMap.name && setName({ text: "", error: true });
                  desc === currentMap.description && setDesc("");
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
          <View style={tw`flex flex-row mx-6 justify-around`}>
            <Image
              style={tw`aspect-square w-20 h-auto justify-center self-center my-4 border-4 border-black rounded-2xl`}
              source={{ uri: image }}
            />
            <SquareButton
              style={tw`my-4 w-56`}
              labelStyle={tw`text-xl`}
              label={"Wybierz ikonę mapy"}
              onPress={() => pickImage({ isCamera: false })}></SquareButton>
          </View>

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
              onPress={async () => {
                if (name.text === "") {
                  setName({ ...name, error: true });
                  setError("Nazwa nie może być pusta");
                  return;
                }
                onRequestClose();
                await onSave(name.text, desc, saveAsNew, mapIcon.current);
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
