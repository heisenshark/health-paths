import * as React from "react";
import { Text, View, StyleSheet, ToastAndroid } from "react-native";
import tw from "../lib/tailwind";
import SquareButton from "./../components/SquareButton";
import Icon from "react-native-vector-icons/FontAwesome";
import { useState } from "react";
import { Audio } from "expo-av";
interface AudioRecordingScreenProps {}
//Ok, ten screen dostaje route z stoppoints, nagrywa audio i zwraca route
//właśnie do stoppoints tylko ze ścieżką do audio
//ewentualnie zrobię ten komponent jako modal
const AudioRecordingScreen = ({ navigation, route }) => {
  const [status, setStatus] = useRecordingState(RecordingStatus.NO_RECORD);
  const [recording, setRecording] = useState();
  const [soundUri, setSoundUri] = useState();
  const [soundObject, setSoundObject] = useState();
  const [soundmilis, setSoundmilis] = useState(0);

  //statey aplikacji
  // brak poprzedniego nagrania, nagrywanie trwa, nagranie zakończone, nagrywanie pauzowane
  async function startRecording() {
    try {
      setSoundmilis(0);
      setStatus(RecordingStatus.RECORDING);
      console.log("Requesting permissions..");
      const elo = await Audio.requestPermissionsAsync();
      console.log(elo);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording, status } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) setSoundmilis((n) => n + 10);
          if (status.durationMillis >= 300000) {
            stopRecording();
            ToastAndroid.show(
              "Nagranie zakończone ponieważ przekraczało 5 minut",
              ToastAndroid.SHORT
            );
          }
        },
        10
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      setStatus(RecordingStatus.NO_RECORD);
      console.error("Failed to start recording", err);
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
    if (recording === undefined) return;
    setRecording(undefined); // to zrobi się w następnej klatce renderowania
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);
    setStatus(RecordingStatus.RECORDED);
    setSoundUri(uri);
    setSoundmilis(0);
  }

  async function playSound() {
    if (soundUri === undefined) return;
    if (soundObject !== undefined) {
      //jeśli jest już jakiś dźwięk to go zatrzymaj
      await soundObject.unloadAsync();
    }
    console.log("Loading Sound");

    const { sound } = await Audio.Sound.createAsync({ uri: soundUri });
    setSoundObject(sound);

    console.log("Playing Sound");
    await soundObject.playAsync();
    await soundObject.unloadAsync();
  }

  function showToast(mess: string) {
    ToastAndroid.show(mess, ToastAndroid.SHORT);
  }

  function milisToMinutesAndSeconds(milis: number) {
    var minutes = Math.floor(milis / 60000);
    var seconds = ((milis % 60000) / 1000).toFixed(0);
    let mindisplay = (minutes + "").padStart(2, "0");
    return mindisplay + ":" + (parseInt(seconds) < 10 ? "0" : "") + seconds;
  }
  //Write function that converts milis to minutes and seconds and display it

  const recordingGui = () => {
    const size = 30;
    switch (status) {
    case RecordingStatus.NO_RECORD:
      return (
        <>
          <SquareButton
            onPress={startRecording}
            size={size}
            icon="microphone"
            label="Start recording"
          />
        </>
      );
    case RecordingStatus.RECORDING:
      return (
        <>
          <SquareButton
            onPress={pauseRecording}
            size={size}
            icon="pause"
            label="Pause recording"
          />
          <SquareButton onPress={stopRecording} size={size} icon="stop" label="Stop recording" />
        </>
      );
    case RecordingStatus.PAUSED:
      return (
        <>
          <SquareButton
            onPress={resumeRecording}
            size={size}
            icon="microphone"
            label="Resume recording"
          />
          <SquareButton onPress={stopRecording} size={size} icon="stop" label="Stop recording" />
        </>
      );
    case RecordingStatus.RECORDED:
      return (
        <>
          <SquareButton
            onPress={startRecording}
            size={size}
            icon="microphone"
            label="Start recording"
          />
          <SquareButton onPress={playSound} size={size} icon="play" label="Play recording" />
          <SquareButton
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
    <View style={tw`bg-main-1 h-1/1`}>
      <Text style={tw`text-5xl text-center py-8 bg-main-2 font-bold`}>NAGRAJ AUDIO</Text>

      <Text
        style={tw`text-8xl text-center text-secondary-9 my-8 mx-4 bg-white pt-24 pb-0 border-[2] rounded-3xl `}>
        {milisToMinutesAndSeconds(soundmilis)}
        <Text style={tw`text-3xl`}>{((soundmilis % 1000) / 10 + "").padStart(2, "0")}</Text>
      </Text>

      <View style={tw`flex flex-row justify-center`}>{recordingGui()}</View>

      <Text style={tw`text-3xl text-center py-10`}>
        Plik audio ma maksymalną długość pięciu minut.
      </Text>
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
