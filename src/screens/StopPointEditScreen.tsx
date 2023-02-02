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
} from "react-native";
import SquareButton from "./../components/SquareButton";
import tw from "../lib/tailwind";
import Waypoint, { MediaFile } from "./../utils/interfaces";
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

//TODO make this component use less hooks and improve functions
//TODO use expo document picker instead of react-native-document-picker
const StopPointEditScreen = ({ navigation, route }) => {
  const isEdit = route.params.isEdit;
  const [currentMap, getCurrentMediaURI, setNotSaved] = useMapStore((state) => [
    state.currentMap,
    state.getCurrentMediaURI,
    state.setNotSaved,
  ]);
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
  const [waypointDiff, setWaypointDiff] = useState({} as Waypoint);
  const sound = useRef(new Audio.Sound());

  async function playSound(uri: string) {
    if (uri === undefined) return;
    try {
      let result = await sound.current?.getStatusAsync();
      if (result.isLoaded) await sound.current.unloadAsync();
      result = await sound.current.loadAsync({ uri: uri });
      await sound.current.playAsync();
    } catch (error) {
      console.log(error);
    }
    console.log(sound);
  }

  useFocusEffect(
    React.useCallback(() => {
      console.log("StopPointEditScreen focused");
      console.log(route.params);
      //tutaj ustawqiamy sound uri, trzeba wybrać czy intro czy navigation
      if (route.params.soundUri === undefined) return;
      console.log("siema", route.params.soundUri);
      let soundObject = {
        media_id: uuid.v4(),
        path: route.params.soundUri,
        type: "audio",
        storage_type: "cache",
      } as MediaFile;

      if (route.params.soundType === "intro") {
        setIntroSoundUri(route.params.soundUri);
        waypointDiff.introduction_audio = soundObject;
      }
      if (route.params.soundType === "navigation") {
        setNavigationSoundUri(route.params.soundUri);
        waypointDiff.navigation_audio = soundObject;
      }
    }, [route.params])
  );

  useEffect(() => {
    if (!editedWaypoint) navigation.goBack();
    console.log("waypoint: ", editedWaypoint);

    if (editedWaypoint.image) setImage(getCurrentMediaURI(editedWaypoint.image));
    if (editedWaypoint.introduction_audio)
      setIntroSoundUri(getCurrentMediaURI(editedWaypoint?.introduction_audio));
    if (editedWaypoint.navigation_audio)
      setNavigationSoundUri(getCurrentMediaURI(editedWaypoint?.navigation_audio));
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("blur", () => {
      console.log("beforeRemove");
      stopSound();
    });
  }, [navigation]);

  useEffect(() => {
    console.log(JSON.stringify(result, null, 2));
  }, [result]);

  const handleError = (err: unknown) => {
    setAudioModalVisible(false);

    if (DocumentPicker.isCancel(err)) {
      console.warn("cancelled");
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn("multiple pickers were opened, only the last will be considered");
    } else {
      throw err;
    }
  };

  async function stopSound() {
    if (sound.current === undefined) return;
    const status = await sound.current?.getStatusAsync();
    if (status === undefined || !status.isLoaded) return;
    await sound.current.getStatusAsync().then((status) => {
      console.log(status);
    });
    await sound.current.pauseAsync();
    return;
  }

  const pickImage = async ({ isCamera }: { isCamera: boolean }) => {
    // No permissions request is necessary for launching the image library

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
    console.log(result);
    if (result.canceled) return;

    setImage(result.assets[0].uri);

    editedWaypoint.image = {
      media_id: uuid.v4(),
      path: result.assets[0].uri,
      type: "image",
      storage_type: "cache",
    } as MediaFile;
  };

  function openAudioModal(type: "intro" | "navigation") {
    setAudioModalVisible(true);
    setSoundType(type);
  }
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
      <HeaderBar label={"Punkt Stopu:"} navigation={navigation} removeMargin useBack />
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
              console.log(navigationSoundUri);
              console.log(soundType);
              playSound(navigationSoundUri);
            }}
            onPick={() => openAudioModal("navigation")}
          />

          <AudioPickPlay
            label="Audio wprowadzające"
            isPresent={introsoundUri !== undefined}
            isEdit={isEdit}
            onPlay={() => {
              console.log(introsoundUri);
              console.log(soundType);
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

const AudioPickPlay = ({ label, isEdit, isPresent, onPlay, onPick }) => {
  return (
    <View
      style={tw`flex-row justify-between items-center mb-4 bg-main-100 p-4 rounded-xl elevation-5`}>
      <Text style={tw`flex-1 text-xl font-bold`} numberOfLines={2}>
        {label}
      </Text>
      <View style={tw`flex-initial flex-row`}>
        {isEdit && (
          <SquareButton
            style={tw`ml-auto mr-2 elevation-5`}
            label={isPresent ? "Edytuj" : "Dodaj"}
            icon={isPresent ? "edit" : "plus"}
            onPress={onPick}
          />
        )}
        <SquareButton
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
