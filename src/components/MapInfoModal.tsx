import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, ScrollView, Image, ToastAndroid } from "react-native";
import { Checkbox } from "react-native-paper";
import { TextInput } from "react-native-paper";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import SquareButton from "./SquareButton";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import { MediaFile } from "../utils/interfaces";
import { getURI } from "./../utils/FileSystemManager";
import Modal from "react-native-modal/dist/modal";

/**
 * @property {boolean} visible Czy modal powinien być widoczny
 * @property {function} onRequestClose funkcja wywoływana w celu zamknięcia modala
 * @property {function(string, string, boolean, MediaFile): Promise<boolean>} onSave funkcja zapisu mapy
 * @interface MapInfoModalProps
 */
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

const nameLimit = 40;
const descLimit = 300;

/**
 * Komponent będący modalem do edycji informacji o mapie, oraz zapisu mapy.
 * @param {MapInfoModalProps} { visible, onRequestClose, onSave }
 * @component
 */
const MapInfoModal = ({ visible, onRequestClose, onSave }: MapInfoModalProps) => {
  const [currentMap] = useMapStore((state) => [state.currentMap]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const mapIcon = useRef<MediaFile>(undefined);

  useEffect(() => {
    setSaveAsNew(false);
    if (visible) {
      setName(currentMap.name);
      setError("");
      setDesc(currentMap.description);
      if (currentMap.imageIcon) {
        setImage(getURI(currentMap, currentMap.imageIcon));
        mapIcon.current = currentMap.imageIcon;
      }
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

  function saveAsNewToggle() {
    if (saveAsNew == false) {
      name === currentMap.name && setName("");
      desc === currentMap.description && setDesc("");
    } else {
      name === "" && setName(currentMap.name);
      desc === "" && setDesc(currentMap.description);
    }
    setSaveAsNew((n) => !n);
  }

  return (
    // <Text>ss</Text>
    <View>
      <Modal
        style={tw`w-full m-0 flex-1 justify-end flex-col`}
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
        isVisible={visible}
        swipeThreshold={100}
        onBackdropPress={onRequestClose}
        onSwipeComplete={onRequestClose}
        onBackButtonPress={onRequestClose}>
        <View style={tw`bg-slate-100 border-t-4 border-slate-300 w-full`}>
          <Text
            style={tw`text-xl md:text-2xl text-center font-bold p-2 md:p-5 px-1 border-slate-300 border-b-2 mx-4`}>
            Dodaj informacje o ścieżce
          </Text>
          <View style={tw`flex flex-row mx-6 mt-2 bg-slate-300 rounded-lg self-center`}>
            <View style={tw`flex flex-row self-center justify-between`}>
              <Image
                style={tw`aspect-square w-20 h-auto self-center my-2 ml-4 border-4 border-black rounded-2xl`}
                source={{ uri: image }}
              />
              <SquareButton
                style={tw`my-2 mx-4`}
                label={"ikona"}
                size={20}
                icon={"edit"}
                onPress={() => pickImage({ isCamera: false })}></SquareButton>
            </View>
          </View>

          <TextInput
            style={tw`text-lg mx-5 my-2`}
            label={"Nazwa"}
            value={name}
            onChangeText={(text) => {
              if (text !== "" && error !== "") {
                setError("");
              }
              if (text.length > nameLimit) setError("Nazwa nie może być dłuższa niż 40 znaków");
              setName(text);
            }}
            error={name.length <= 0 || name.length > nameLimit}
            activeUnderlineColor={tw.color("slate-700")}
          />
          <TextInput
            style={tw`text-lg mx-5 mb-2 h-16 md:h-32`}
            label={"Opis"}
            value={desc}
            multiline={true}
            onChangeText={(text) => {
              if (text.length > descLimit) setError("Opis nie może być dłuższy niż 300 znaków");
              setDesc(text);
            }}
            error={desc.length > descLimit}
            activeUnderlineColor={tw.color("slate-700")}
          />
          <View style={tw`mx-5 my-2 flex flex-row justify-center`}>
            <View style={tw`w-30 flex flex-row justify-center items-center`}>
              <Checkbox
                status={saveAsNew ? "checked" : "unchecked"}
                color={tw.color("slate-700")}
                onPress={saveAsNewToggle}
              />
              <Text
                style={tw`text-sm md:text-base font-bold flex-initial`}
                onPress={saveAsNewToggle}>
                Zapisz jako nowa?
              </Text>
            </View>

            <SquareButton
              style={tw`flex-initial mx-2`}
              label="Zapisz"
              icon="save"
              onPress={async () => {
                if (name.length > 40 || desc.length > 300) return;
                if (name === "") {
                  setError("Nazwa nie może być pusta");
                  return;
                }
                onRequestClose();
                await onSave(name, desc, saveAsNew, mapIcon.current);
              }}></SquareButton>
            <SquareButton
              style={tw`flex-initial mx-2`}
              label="Anuluj"
              icon="arrow-left"
              onPress={onRequestClose}></SquareButton>
          </View>

          {error !== "" && (
            <Text style={tw`text-xl text-red-500 ml-7 text-left font-bold`}>{error}</Text>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default MapInfoModal;
