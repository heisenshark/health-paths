import * as React from "react";
import { Text, View, StyleSheet, ToastAndroid, Alert, BackHandler } from "react-native";
import tw from "../lib/tailwind";
import SquareButton from "./../components/SquareButton";
import Icon from "react-native-vector-icons/FontAwesome";
import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { Recording, Sound } from "expo-av/build/Audio";
import { useNavigation } from "@react-navigation/native";
interface AudioRecordingScreenProps {}
//Ok, ten screen dostaje route z stoppoints, nagrywa audio i zwraca route
//właśnie do stoppoints tylko ze ścieżką do audio
//ewentualnie zrobię ten komponent jako modal
//TODO naprawić buga który uniemożliwia zastopowanie nagrywania audio
const AudioRecordingScreen = ({ navigation, route }) => {
  const nav = useNavigation();
  const [status, setStatus] = useRecordingState(RecordingStatus.NO_RECORD);
  const [recording, setRecording] = useState<Recording>();
  const [soundUri, setSoundUri] = useState();
  // const [soundObject, setSoundObject] = useState<Sound>();
  const soundObject = useRef<Sound>(new Audio.Sound());
  const recordingObject = useRef<Recording>(new Audio.Recording());
  const [soundmilis, setSoundmilis] = useState(0);
  const [audioStatus, setAudioStatus] = useState({});
  const [recordingStatus, setRecordingStatus] = useState();
  //statey aplikacji
  // brak poprzedniego nagrania, nagrywanie trwa, nagranie zakończone, nagrywanie pauzowane

  React.useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      console.log("beforeRemove");
      stopSound();
      stopRecording();
    });
  }, [navigation]);

  async function startRecording() {
    await stopSound();

    const elo = await Audio.requestPermissionsAsync(); //może przenieść to gdzie indziej
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    setSoundmilis(0);
    try {
      console.log("Starting recording..");
      recordingObject.current = new Audio.Recording();
      const status = await recordingObject.current.getStatusAsync();
      console.log(status);

      if (status.isRecording === true) await recordingObject.current.stopAndUnloadAsync();
      await recordingObject.current.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingObject.current.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) setSoundmilis(status.durationMillis);
        if (status.durationMillis >= 300000) {
          stopRecording();
          ToastAndroid.show(
            "Nagranie zakończone ponieważ przekraczało 5 minut",
            ToastAndroid.SHORT
          );
        }
      });
      recordingObject.current.setProgressUpdateInterval(16);
      await recordingObject.current.startAsync();
      setStatus(RecordingStatus.RECORDING);
    } catch (error) {
      console.log(error);
    }
  }

  async function pauseRecording() {
    setStatus(RecordingStatus.PAUSED);
    console.log("Pausing recording..");
    await recording.pauseAsync();
    console.log("Recording paused");
  }

  async function resumeRecording() {
    setStatus(RecordingStatus.RECORDING);
    console.log("Resuming recording..");
    await recording.startAsync();
    console.log("Recording resumed");
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    const status = await recordingObject.current.getStatusAsync();
    if (status === undefined || status.isRecording === false) return;
    recordingObject.current.stopAndUnloadAsync();
    setRecording(undefined); // to zrobi się w następnej klatce renderowania
    const uri = recordingObject.current.getURI();
    console.log("Recording stopped and stored at", uri);
    setStatus(RecordingStatus.RECORDED);
    setSoundUri(uri);
    setSoundmilis(0);
  }

  async function stopSound() {
    const status = await soundObject.current?.getStatusAsync();
    if (status === undefined || !status.isLoaded) return;
    await soundObject.current.getStatusAsync().then((status) => {
      console.log(status);
    });
    // await soundObject.unloadAsync();
    await soundObject.current.pauseAsync();
    // await new Promise((resolve) => setTimeout(resolve, 100));
    // console.log("after 0.1s");

    return;
  }

  async function playSound() {
    if (soundUri === undefined) return;
    try {
      let result = await soundObject.current?.getStatusAsync();
      if (result.isLoaded) await soundObject.current.unloadAsync();
      result = await soundObject.current.loadAsync({ uri: soundUri });
      await soundObject.current.playAsync();
      setAudioStatus(result);
    } catch (error) {
      showToast("playSound error");
      console.log(error);
    }
    console.log(soundObject);
  }

  function showToast(mess: string) {
    ToastAndroid.show(mess, ToastAndroid.SHORT);
  }

  function milisToMinutesAndSeconds(milis: number) {
    let minutes = Math.floor(milis / 60000);
    let seconds = Math.floor(milis / 1000);
    let mindisplay = (minutes + "").padStart(2, "0");
    let secdisplay = (seconds + "").padStart(2, "0");
    return mindisplay + ":" + secdisplay;
  }
  //Write function that converts milis to minutes and seconds and display it

  const recordingGui = () => {
    const size = 25;
    switch (status) {
    case RecordingStatus.NO_RECORD:
      return (
        <>
          <SquareButton
            style={tw`elevation-5`}
            onPress={startRecording}
            size={size}
            icon="record-vinyl"
            label="Nagrywaj"
          />
        </>
      );
    case RecordingStatus.RECORDING:
      return (
        <>
          <SquareButton
            style={tw`elevation-5 mx-2`}
            onPress={pauseRecording}
            size={size}
            icon="pause"
            label="Zatrzymaj"
          />
          <SquareButton
            style={tw`elevation-5 mx-2`}
            onPress={stopRecording}
            size={size}
            icon="stop"
            label="Zakończ"
          />
        </>
      );
    case RecordingStatus.PAUSED:
      return (
        <>
          <SquareButton
            style={tw`elevation-5 mx-2`}
            onPress={resumeRecording}
            size={size}
            icon="microphone"
            label="Wznów"
          />
          <SquareButton
            style={tw`elevation-5 mx-2`}
            onPress={stopRecording}
            size={size}
            icon="stop"
            label="Zakończ"
          />
        </>
      );
    case RecordingStatus.RECORDED:
      return (
        <>
          <SquareButton
            style={tw`elevation-5 mx-2`}
            onPress={startRecording}
            size={size}
            icon="microphone"
            label="Nagraj nowy"
          />
          <SquareButton
            style={tw`elevation-5 mx-2`}
            onPress={playSound}
            size={size}
            icon="play"
            label="Play recording"
          />
          <SquareButton
            style={tw`elevation-5 mx-2`}
            onPress={() => {
              navigation.navigate("EdycjaMap", {
                ...route.params,
                soundUri: soundUri,
              });
            }}
            size={size}
            icon="save"
            label="Save recording"
          />
        </>
      );
    }
  };

  return (
    <View style={tw`bg-slate-100 h-1/1`}>
      <Text
        style={tw`text-5xl text-center pb-4 pt-6 bg-main-100 font-bold rounded-3xl mx-4 mt-4 elevation-5`}>
        NAGRAJ AUDIO
      </Text>

      <Text
        style={tw`text-8xl text-center text-slate-900 mt-8 mb-4 mx-4 bg-slate-100 pt-24 pb-0 rounded-3xl elevation-5`}>
        {milisToMinutesAndSeconds(soundmilis)}
        <Text style={tw`text-3xl`}>
          {(Math.floor((soundmilis / 10) % 100) + "").padStart(2, "0")}
        </Text>
        {/* <Text style={tw`text-3xl`}>{soundmilis}</Text> */}
      </Text>
      <Text style={tw`text-3xl text-center py-5 bg-slate-300 rounded-3xl mx-4 mb-2 elevation-5`}>
        Plik audio może mieć maksymalnie 5 minut.
      </Text>
      <View
        style={tw`flex flex-row justify-center my-4 mx-4 py-4 bg-main-100 rounded-xl elevation-5`}>
        {recordingGui()}
      </View>

      <SquareButton
        style={tw`self-center mt-3 elevation-5`}
        onPress={() => {
          navigation.goBack();
        }}
        size={30}
        icon="arrow-left"
        label="Wróć"
      />
    </View>
  );
};

export default AudioRecordingScreen;

enum RecordingStatus {
  NO_RECORD,
  RECORDING,
  PAUSED,
  RECORDED,
}

function useRecordingState(s: RecordingStatus) {
  const [status, setStatus] = useState(s);
  return [status, setStatus] as const;
}
