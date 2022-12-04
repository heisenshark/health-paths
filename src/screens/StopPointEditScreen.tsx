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
import { TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isInProgress,
  types,
} from "react-native-document-picker";
import { Audio } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
//TODO make this component use less hooks and improve functions
//TODO use expo document picker instead of react-native-document-picker
const StopPointEditScreen = ({ navigation, route }) => {
  const { editedWaypoint } = route.params as { editedWaypoint: Waypoint };
  const [sooundUri, setSooundUri] = useState(route.params.soundUri);
  const [name, setName] = useState(editedWaypoint.displayed_name);
  const [description, setDescription] = useState(editedWaypoint.description);
  const [image, setImage] = useState(null);
  const [showSoundSelectOptions, setShowSoundSelectOptions] = useState(false);
  const [result, setResult] = useState<
    Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null
  >(null);

  const [sound, setSound] = useState();

  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log("StopPointEditScreen focused");
      if (route.params.soundUri !== undefined) {
        console.log("siema", route.params.soundUri);
        setSooundUri(route.params.soundUri);
      }
    }, [route.params])
  );

  async function playSound() {
    if (sooundUri === undefined || sooundUri === "") return;
    console.log("Loading Sound");

    const { sound } = await Audio.Sound.createAsync({ uri: sooundUri });
    setSound(sound);
    console.log("Playing Sound");
    await sound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
        console.log("Unloading Sound");
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

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

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      editedWaypoint.image = result.assets[0].uri;
    }
  };

  return (
    <ScrollView style={tw`bg-main-2`}>
      <Modal
        animationType={"fade"}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View
          style={tw`flex items-center justify-center h-full bg-opacity-60 bg-black border-8 border-secondary-1`}>
          <View style={tw`w-4/5 bg-main-1 p-4 border-4 border-secondary-9`}>
            <Text style={tw`text-2xl font-bold`}>Chcesz nagrać adudio czy wybrać plik?</Text>
            <View style={tw`flex flex-row justify-center px-4 py-4 text-3xl`}>
              <SquareButton
                style={tw`w-auto px-2 h-10 `}
                label={"Wybierz Plik"}
                onPress={() => {
                  DocumentPicker.pickSingle({
                    presentationStyle: "fullScreen",
                    copyTo: "cachesDirectory",
                    type: [types.audio],
                  })
                    .then((res) => {
                      setResult(res);
                      setModalVisible(false);
                      setSooundUri(res.uri);
                    })
                    .catch(handleError);
                }}></SquareButton>
              <SquareButton
                style={tw`w-auto px-2 h-10 `}
                label={"Nagraj Audio"}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("NagrywanieAudio", { ...route.params });
                }}></SquareButton>
            </View>
          </View>
        </View>
      </Modal>
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
            onPress={pickImage}></SquareButton>
        </View>

        <View style={tw`flex-row justify-between items-center my-4 `}>
          <Text style={tw`text-3xl font-bold`}>Opis Audio</Text>
          <View style={tw`flex-row`}>
            <SquareButton
              style={tw`ml-auto mr-2`}
              label={"Edytuj"}
              onPress={() => {
                setModalVisible(true);
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
          <SquareButton label="Zapisz" onPress={() => {}}></SquareButton>
          <SquareButton
            label="Wstecz"
            onPress={() => {
              navigation.goBack();
            }}></SquareButton>
        </View>
      </View>
    </ScrollView>
  );
};

export default StopPointEditScreen;
