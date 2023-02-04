import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Button,
  Modal,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  ToastAndroid,
} from "react-native";
import SquareButton from "./../components/SquareButton";
import tw from "../lib/tailwind";
import { Waypoint, MediaFile } from "./../utils/interfaces";
import { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isInProgress,
  types,
} from "react-native-document-picker";
import { Audio } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import { ModalChoice } from "../components/ModalChoice";
import { TextInput } from "react-native-paper";
import uuid from "react-native-uuid";
import { useMapStore } from "../stores/store";
import TileButton from "../components/TileButton";
import { imagePlaceholder } from "../utils/HelperFunctions";
import HeaderBar from "../components/HeaderBar";
import { getURI } from "../utils/FileSystemManager";

/**
 * Ekran edycji punktu stopu
 * @category Ekrany
 * @param {*} navigation_props { navigation, route }
 * @component
 */
const StopPointEditScreen = ({ navigation, route }) => {
  const isEdit = route.params.isEdit;
  const map = route.params.map;
  const [currentMap, setNotSaved] = useMapStore((state) => [state.currentMap, state.setNotSaved]);
  let { editedWaypoint } = route.params as { editedWaypoint: Waypoint };
  const [introsoundUri, setIntroSoundUri] = useState<string>();
  const [navigationSoundUri, setNavigationSoundUri] = useState<string>();
  const [name, setName] = useState(editedWaypoint.displayed_name);
  const [description, setDescription] = useState(editedWaypoint.description);
  const [image, setImage] = useState(imagePlaceholder);
  const [result, setResult] = useState<
    Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null
  >(null);
  const [audioModalVisible, setAudioModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [soundType, setSoundType] = useState("");
  const sound = useRef(new Audio.Sound());

  /**
   * Funkcja odtwarzająca dźwięk z podanego uri
   * @param {string} uri uri dźwięku
   */
  async function playSound(uri: string) {
    if (uri === undefined) return;
    try {
      let result = await sound.current?.getStatusAsync();
      if (result.isLoaded) await sound.current.unloadAsync();
      result = await sound.current.loadAsync({ uri: uri });
      await sound.current.playAsync();
    } catch (error) {
      ToastAndroid.show("Nastąpił problem z odtwarzaniem dźwięku", ToastAndroid.SHORT);
    }
  }
  /**
   * Funkcja zwracająca uri z MediaFile
   * @param {MediaFile} mf
   * @return {*}
   */
  function getU(mf: MediaFile) {
    if (map === undefined) return getURI(currentMap, mf);
    return getURI(map, mf);
  }

  useFocusEffect(
    React.useCallback(() => {
      if (route.params.soundUri === undefined) return;

      let soundObject = {
        media_id: uuid.v4(),
        path: route.params.soundUri,
        type: "audio",
        storage_type: "cache",
      } as MediaFile;

      if (route.params.soundType === "intro") {
        setIntroSoundUri(route.params.soundUri);
        editedWaypoint.introduction_audio = soundObject;
      }
      if (route.params.soundType === "navigation") {
        setNavigationSoundUri(route.params.soundUri);
        editedWaypoint.navigation_audio = soundObject;
      }
      setNotSaved(true);
    }, [route.params])
  );

  useEffect(() => {
    if (!editedWaypoint) navigation.goBack();

    if (editedWaypoint.image) setImage(getU(editedWaypoint.image));
    if (editedWaypoint.introduction_audio)
      setIntroSoundUri(getU(editedWaypoint?.introduction_audio));
    if (editedWaypoint.navigation_audio)
      setNavigationSoundUri(getU(editedWaypoint?.navigation_audio));
    setNotSaved(true);
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("blur", () => {
      stopSound();
    });
  }, [navigation]);

  useEffect(() => {}, [result]);

  /**
   * Funkcja obsługująca błędy podczas wybierania pliku
   * @param {unknown} err błąd
   */
  const handleError = (err: unknown) => {
    setAudioModalVisible(false);
    if (DocumentPicker.isCancel(err)) {
      console.warn("cancelled");
    } else if (isInProgress(err)) {
      console.warn("multiple pickers were opened, only the last will be considered");
    } else {
      throw err;
    }
  };
  /**
   * Funkcja zatrzymująca odtwarzany dźwięk
   * @return {*}
   */
  async function stopSound() {
    if (sound.current === undefined) return;
    const status = await sound.current?.getStatusAsync();
    if (status === undefined || !status.isLoaded) return;
    await sound.current.pauseAsync();
    return;
  }
  /**
   * Funkcja wybierająca obrazek z galerii lub aparatu
   * @param {{ isCamera: boolean }} { isCamera } czy wybrać z aparatu
   */
  const pickImage = async ({ isCamera }: { isCamera: boolean }) => {
    setImageModalVisible(false);
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

    editedWaypoint.image = {
      media_id: uuid.v4(),
      path: result.assets[0].uri,
      type: "image",
      storage_type: "cache",
    } as MediaFile;
  };
  /**
   * Funkcja wyświetlająca modal do wyboru dźwięku
   * @param {("intro" | "navigation")} type typ dźwięku
   */
  function openAudioModal(type: "intro" | "navigation") {
    setAudioModalVisible(true);
    setSoundType(type);
  }
  /**
   * Funkcja wybierająca dźwięk z plików
   */
  function onAudioPick() {
    DocumentPicker.pickSingle({
      presentationStyle: "fullScreen",
      copyTo: "cachesDirectory",
      type: [types.audio],
    })
      .then((res) => {
        setResult(res);
        setAudioModalVisible(false);
        let soundObj = {
          media_id: uuid.v4(),
          path: res.uri,
          type: "audio",
          storage_type: "cache",
        } as MediaFile;
        if (soundType === "intro") {
          editedWaypoint.introduction_audio = soundObj;
          setIntroSoundUri(res.uri);
        }
        if (soundType === "navigation") {
          setNavigationSoundUri(res.uri);
          editedWaypoint.navigation_audio = soundObj;
        }
      })
      .catch(handleError);
  }

  return (
    <KeyboardAvoidingView style={tw`h-full`} behavior="padding">
      <HeaderBar label={"Punkt Stopu:"} removeMargin useBack />
      <ModalChoice
        visible={audioModalVisible}
        label="Jak dodać audio?"
        titles={["Wybierz z plików", "Nagraj"]}
        buttonIcons={["file", "microphone"]}
        actionLeft={onAudioPick}
        actionRight={function (): void {
          setAudioModalVisible(false);
          navigation.navigate("NagrywanieAudio", { ...route.params, soundType: soundType });
        }}
        onRequestClose={function (): void {
          setAudioModalVisible(false);
        }}
      />
      <ModalChoice
        visible={imageModalVisible}
        label="jak dodać zdjęcie?"
        titles={["Dodaj z kamery", "Wybierz z plików"]}
        buttonIcons={["camera", "file"]}
        actionLeft={() => pickImage({ isCamera: true })}
        actionRight={() => pickImage({ isCamera: false })}
        onRequestClose={() => setImageModalVisible(false)}
      />
      <ScrollView style={tw`bg-slate-200 flex-auto`}>
        <View style={tw`px-4 pb-4 flex-col`}>
          <View>
            <Image
              style={tw`aspect-square bg-slate-600 w-full h-auto justify-center
              self-center my-4 border-4 border-black rounded-2xl elevation-5`}
              source={{ uri: image }}
            />
            {isEdit && (
              <SquareButton
                size={tw.prefixMatch("md") ? 20 : 17}
                style={tw`absolute bottom-8 right-4 elevation-5`}
                label={"Edytuj"}
                icon="edit"
                onPress={() => setImageModalVisible(true)}></SquareButton>
            )}
          </View>

          <AudioPickPlay
            label="Audio przewodnicze"
            isPresent={navigationSoundUri !== undefined}
            isEdit={isEdit}
            onPlay={() => {
              playSound(navigationSoundUri);
            }}
            onPick={() => openAudioModal("navigation")}
          />

          <AudioPickPlay
            label="Audio wprowadzające"
            isPresent={introsoundUri !== undefined}
            isEdit={isEdit}
            onPlay={() => {
              playSound(introsoundUri);
            }}
            onPick={() => openAudioModal("intro")}
          />

          {isEdit && (
            <>
              <TextInput
                style={tw`bg-white rounded-xl text-2xl border-secondary-100 elevation-5 overflow-hidden`}
                placeholder="Nazwa"
                value={name}
                onChangeText={(text) => {
                  setName(text.substring(0, 50));
                  editedWaypoint.displayed_name = text.substring(0, 50);
                }}
                label="Nazwa Punktu"
                activeUnderlineColor={tw.color("slate-700")}
                error={name.length >= 50}
              />
              <TextInput
                mode="flat"
                style={tw`h-60 text-2xl rounded-xl my-4 bg-white border-secondary-100 elevation-5 overflow-hidden`}
                placeholder="Opis"
                value={description}
                onChangeText={(text) => {
                  setDescription(text.substring(0, 500));
                  editedWaypoint.description = text.substring(0, 500);
                }}
                label="Opis Punktu"
                multiline={true}
                activeUnderlineColor={tw.color("slate-700")}
                error={description.length > 500}
              />
            </>
          )}
          {!isEdit && (
            <>
              <Text style={tw`text-2xl font-bold`}>Nazwa:</Text>
              <Text style={tw`text-2xl`}>{name}</Text>
              <Text style={tw`text-2xl font-bold`}>Opis:</Text>
              <Text style={tw`text-2xl`}>{description}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StopPointEditScreen;
/**
 * Komponent wyświetlający przyciski do wyboru audio i odtwarzania
 * @param {{string,boolean,boolean,function,function}} { label, isEdit, isPresent, onPlay, onPick } - propsy komponentu
 * @component
 */
const AudioPickPlay = ({ label, isEdit, isPresent, onPlay, onPick }) => {
  return (
    <View
      style={tw`flex-row justify-between items-center mb-4 bg-main-100 p-4 rounded-xl elevation-5`}>
      <Text style={tw`flex-1 text-lg md:text-xl font-bold`} numberOfLines={2}>
        {label}
      </Text>
      <View style={tw`flex-initial flex-row`}>
        {isEdit && (
          <SquareButton
            size={tw.prefixMatch("md") ? 20 : 17}
            style={tw`ml-auto mr-2 elevation-5`}
            label={isPresent ? "Edytuj" : "Dodaj"}
            icon={isPresent ? "edit" : "plus"}
            onPress={onPick}
          />
        )}
        <SquareButton
          size={tw.prefixMatch("md") ? 20 : 17}
          disabled={!isPresent}
          style={tw`ml-auto elevation-5`}
          label={"Odtwórz"}
          icon="play"
          onPress={onPlay}
        />
      </View>
    </View>
  );
};
