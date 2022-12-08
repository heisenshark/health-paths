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
} from "react-native";
import SquareButton from "./../components/SquareButton";
import { Icon } from "react-native-vector-icons/FontAwesome";
import tw from "../lib/tailwind";
import Waypoint from "./../utils/interfaces";
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

//TODO make this component use less hooks and improve functions
//TODO use expo document picker instead of react-native-document-picker
const StopPointEditScreen = ({ navigation, route }) => {
  const { editedWaypoint } = route.params as { editedWaypoint: Waypoint };
  const [soundUri, setSoundUri] = useState(route.params.soundUri);
  const [name, setName] = useState(editedWaypoint.displayed_name);
  const [description, setDescription] = useState(editedWaypoint.description);
  const [image, setImage] = useState(null);
  const [showSoundSelectOptions, setShowSoundSelectOptions] = useState(false);
  const [result, setResult] = useState<
    Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null
  >(null);

  const [audioModalVisible, setAudioModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // const [sound, setSound] = useState();
  const sound = useRef(new Audio.Sound());

  async function playSound() {
    if (soundUri === undefined) return;
    try {
      let result = await sound.current?.getStatusAsync();
      if (result.isLoaded) await sound.current.unloadAsync();
      result = await sound.current.loadAsync({ uri: soundUri });
      await sound.current.playAsync();
    } catch (error) {
      console.log(error);
    }
    console.log(sound);
  }

  useFocusEffect(
    React.useCallback(() => {
      console.log("StopPointEditScreen focused");
      if (route.params.soundUri !== undefined) {
        console.log("siema", route.params.soundUri);
        setSoundUri(route.params.soundUri);
      }
    }, [route.params])
  );

  useEffect(() => {
    setSoundUri(editedWaypoint.introduction_audio);
    setImage(editedWaypoint.image);
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
    let result = isCamera
      ? await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.2,
        aspect: [4, 3],
      })
      : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.2,
      });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      editedWaypoint.image = result.assets[0].uri;
    }
  };

  return (
    <View>
      <ScrollView style={tw`bg-main-2`}>
        <ModalChoice
          visible={audioModalVisible}
          titles={["wybrać z plików czy nagrać", "Wybierz Audio", "Nagraj Audio"]}
          actionLeft={function (): void {
            DocumentPicker.pickSingle({
              presentationStyle: "fullScreen",
              copyTo: "cachesDirectory",
              type: [types.audio],
            })
              .then((res) => {
                setResult(res);
                setAudioModalVisible(false);
                setSoundUri(res.uri);
              })
              .catch(handleError);
          }}
          actionRight={function (): void {
            setAudioModalVisible(false);
            navigation.navigate("NagrywanieAudio", { ...route.params });
          }}
          onRequestClose={function (): void {
            setAudioModalVisible(false);
          }}
        />
        <ModalChoice
          visible={imageModalVisible}
          titles={["wybrać z plików zrobić zdjęcie?", "Zrób Zdjęcie", "Wybierz Zdjęcie"]}
          actionLeft={() => pickImage({ isCamera: true })}
          actionRight={() => pickImage({ isCamera: false })}
          onRequestClose={() => setImageModalVisible(false)}
        />
        <View style={tw`px-4 py-4 flex-col`}>
          <Text style={tw`text-3xl font-bold`}>Edytuj Punkt Zdrowia:</Text>
          <View>
            <Image
              style={tw`aspect-square w-full h-auto justify-center self-center my-4 border-4 border-black rounded-2xl`}
              source={{ uri: image }}
            />
            <SquareButton
              style={tw`absolute bottom-8 right-4`}
              label={"Edytuj"}
              onPress={() => setImageModalVisible(true)}></SquareButton>
          </View>

          <View style={tw`flex-row justify-between items-center my-4 `}>
            <Text style={tw`text-3xl font-bold`}>Opis Audio</Text>
            <View style={tw`flex-row`}>
              <SquareButton
                style={tw`ml-auto mr-2`}
                label={"Edytuj"}
                onPress={() => {
                  setAudioModalVisible(true);
                  console.log("clicked modalshow");
                }}></SquareButton>
              <SquareButton
                style={tw`ml-auto`}
                label={"Odtwórz"}
                onPress={() => playSound()}></SquareButton>
            </View>
          </View>
          <TextInput
            style={tw`bg-white text-2xl border-4 border-secondary-1 `}
            placeholder="Nazwa"
            value={name}
            onChangeText={(text) => {
              setName(text);
            }}
            label="Nazwa Punktu"></TextInput>
          <TextInput
            style={tw`h-60 text-2xl rounded-xl my-4 bg-white border-secondary-1 border-4`}
            placeholder="Opis"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
            }}
            label="Opis Punktu"
            multiline={true}></TextInput>
          <View style={tw`flex-row justify-around`}>
            <SquareButton
              label="Wstecz"
              onPress={() => {
                navigation.goBack();
              }}></SquareButton>
          </View>
        </View>
      </ScrollView>
      {/* <SquareButton
        onPress={() => {
          navigation.goBack();
        }}
        size={20}
        // icon="left"
        label="ZAPISZ"
        style={tw`mt-3 absolute bottom-0 right-0 mr-4 mb-4`}
      /> */}
      <SquareButton
        label="Zapisz"
        onPress={() => {
          console.log("clicked save", name, description, soundUri, image);
          editedWaypoint.displayed_name = name;
          editedWaypoint.description = description;
          editedWaypoint.introduction_audio = soundUri;
          editedWaypoint.image = image;
          navigation.goBack();
        }}
        style={tw`mt-3 absolute bottom-0 right-0 mr-4 mb-4`}></SquareButton>
    </View>
  );
};

export default StopPointEditScreen;
