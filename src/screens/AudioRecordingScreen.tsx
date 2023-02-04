import * as React from "react";
import { Text, View, ToastAndroid } from "react-native";
import tw from "../lib/tailwind";
import SquareButton from "./../components/SquareButton";
import { useRef, useState } from "react";
import { Audio } from "expo-av";
import { Recording, Sound } from "expo-av/build/Audio";
import { useNavigation } from "@react-navigation/native";
import HeaderBar from "../components/HeaderBar";
import { log } from "react-native-reanimated";
interface AudioRecordingScreenProps {}
//Ok, ten screen dostaje route z stoppoints, nagrywa audio i zwraca route
//właśnie do stoppoints tylko ze ścieżką do audio
//ewentualnie zrobię ten komponent jako modal
//[x] naprawić buga który uniemożliwia zastopowanie nagrywania audio
//[x] zrobi nagrywanie w niszej jakoci

/**
 * Ekran nagrywania audio z możliwością zatrzymania i wznowienia nagrywania oraz zapisania nagrania do punktu stopu
 * @category Ekrany
 * @param {*} props { navigation, route }
 * @component
 */
const AudioRecordingScreen = ({ navigation, route }) => {
  const nav = useNavigation();
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(
    RecordingStatus.NO_RECORD
  );
  const [soundUri, setSoundUri] = useState<string>();
  const soundObject = useRef<Sound>(new Audio.Sound());
  const recordingObject = useRef<Recording>(new Audio.Recording());
  const [soundmilis, setSoundmilis] = useState(0);
  const [audioStatus, setAudioStatus] = useState({});
  const resetTimer = useRef<any>();
  //stany aplikacji
  //brak poprzedniego nagrania, nagrywanie trwa, nagranie zakończone, nagrywanie pauzowane
  const maxDuration = 180000; //3min
  React.useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      stopSound();
      stopRecording();
    });
    return unsub;
  }, [navigation]);
  /**
   *Funkcja rozpoczynająca nagrywanie
   */
  async function startRecording() {
    await stopSound();
    const elo = await Audio.requestPermissionsAsync(); //może przenieść to gdzie indziej
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    setSoundmilis(0);

    try {
      recordingObject.current = new Audio.Recording();
      const status = await recordingObject.current.getStatusAsync();
      if (status.isRecording === true) await recordingObject.current.stopAndUnloadAsync();
      await recordingObject.current.prepareToRecordAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
      recordingObject.current.setOnRecordingStatusUpdate(async (status) => {
        if (status.isRecording) setSoundmilis(status.durationMillis);
      });
      recordingObject.current.setProgressUpdateInterval(16);
      await recordingObject.current.startAsync();
      setRecordingStatus(RecordingStatus.RECORDING);
      startResetTimer();
    } catch (error) {}
  }
  /**
   *Funkcja pauzująca nagrywanie
   */
  async function pauseRecording() {
    setRecordingStatus(RecordingStatus.PAUSED);
    stopResetTimer();
    await recordingObject.current.pauseAsync();
  }
  /**
   * Funkcja wznawiająca nagrywanie
   */
  async function resumeRecording() {
    setRecordingStatus(RecordingStatus.RECORDING);
    await recordingObject.current.startAsync();
    startResetTimer();
  }
  /**
   * Funkcja zatrzymująca nagrywanie
   */
  async function stopRecording() {
    if (!recordingObject.current) return;
    const status = await recordingObject.current.getStatusAsync();
    console.log(status);
    if (status === undefined || status.isDoneRecording) return;
    if (status.canRecord) recordingObject.current.stopAndUnloadAsync();

    const uri = recordingObject.current.getURI();
    stopResetTimer();
    setRecordingStatus(RecordingStatus.RECORDED);
    setSoundUri(uri);
    setSoundmilis(0);
  }
  /**
   * funkcja zatrzymująca odtwarzany dźwięk
   */
  async function stopSound() {
    const status = await soundObject.current?.getStatusAsync();
    if (status === undefined || !status.isLoaded) return;
    await soundObject.current.getStatusAsync().then((status) => {});
    await soundObject.current.pauseAsync();
    return;
  }
  /**
   * Funkcja odtwarzająca nagranie
   * @return {*}
   */
  async function playSound() {
    if (soundUri === undefined) return;
    try {
      let result = await soundObject.current?.getStatusAsync();
      if (result.isLoaded) await soundObject.current.unloadAsync();
      result = await soundObject.current.loadAsync({ uri: soundUri });
      await soundObject.current.playAsync();
      setAudioStatus(result);
    } catch (error) {
      ToastAndroid.show("playSound error", ToastAndroid.SHORT);
    }
  }
  /**
   * Funkcja formatująca milisekundy na minuty i sekundy
   * @param {number} milis milisekundy
   * @return {*}
   */
  function milisToMinutesAndSeconds(milis: number) {
    let minutes = Math.floor(milis / 60000);
    let seconds = Math.floor(milis / 1000);
    let mindisplay = (minutes + "").padStart(2, "0");
    let secdisplay = (seconds + "").padStart(2, "0");
    return mindisplay + ":" + secdisplay;
  }

  /**
   * Funkcja zwracająca GUI w zależności od statusu nagrywania
   * @component
   */
  const recordingGui = () => {
    const size = 25;
    switch (recordingStatus) {
    case RecordingStatus.NO_RECORD:
      return (
        <>
          <SquareButton
            size={tw.prefixMatch("md") ? size : size * 0.9}
            style={tw`elevation-5`}
            onPress={startRecording}
            icon="record-vinyl"
            label="Nagrywaj"
          />
        </>
      );
    case RecordingStatus.RECORDING:
      return (
        <>
          <SquareButton
            size={tw.prefixMatch("md") ? size : size * 0.9}
            style={tw`elevation-5 mx-2`}
            onPress={pauseRecording}
            icon="pause"
            label="Zatrzymaj"
          />
          <SquareButton
            size={tw.prefixMatch("md") ? size : size * 0.9}
            style={tw`elevation-5 mx-2`}
            onPress={stopRecording}
            icon="stop"
            label="Zakończ"
          />
        </>
      );
    case RecordingStatus.PAUSED:
      return (
        <>
          <SquareButton
            size={tw.prefixMatch("md") ? size : size * 0.9}
            style={tw`elevation-5 mx-2`}
            onPress={resumeRecording}
            icon="microphone"
            label="Wznów"
          />
          <SquareButton
            size={tw.prefixMatch("md") ? size : size * 0.9}
            style={tw`elevation-5 mx-2`}
            onPress={stopRecording}
            icon="stop"
            label="Zakończ"
          />
        </>
      );
    case RecordingStatus.RECORDED:
      return (
        <>
          <SquareButton
            size={tw.prefixMatch("md") ? size : size * 0.9}
            style={tw`elevation-5 mx-2`}
            onPress={startRecording}
            icon="microphone"
            label="Nagraj ponownie"
          />
          <SquareButton
            size={tw.prefixMatch("md") ? size : size * 0.9}
            style={tw`elevation-5 mx-2`}
            onPress={playSound}
            icon="play"
            label="Odtwórz"
          />
          <SquareButton
            size={tw.prefixMatch("md") ? size : size * 0.9}
            style={tw`elevation-5 mx-2`}
            onPress={() => {
              navigation.navigate("EdycjaMap", {
                ...route.params,
                soundUri: soundUri,
              });
            }}
            icon="save"
            label="Zapisz"
          />
        </>
      );
    }
  };

  function startResetTimer() {
    stopResetTimer();
    const elo = setTimeout(async () => {
      stopRecording();
      ToastAndroid.show("Nagranie zakończone ponieważ przekraczało 3 minuty", ToastAndroid.SHORT);
    }, maxDuration - soundmilis);
    resetTimer.current = elo;
  }

  function stopResetTimer() {
    if (resetTimer.current !== undefined) clearTimeout(resetTimer.current);
  }

  return (
    <View style={tw`bg-slate-100 h-1/1`}>
      <HeaderBar label={"NAGRAJ AUDIO"} removeMargin useBack />

      <Text
        style={tw`text-8xl text-center text-slate-900 mt-8 mb-4 mx-4 border-2 border-slate-800 bg-slate-100 pt-20 pb-0 rounded-3xl elevation-5`}>
        {milisToMinutesAndSeconds(soundmilis)}
        <Text style={tw`text-3xl`}>
          {(Math.floor((soundmilis / 10) % 100) + "").padStart(2, "0")}
        </Text>
        {/* <Text style={tw`text-3xl`}>{soundmilis}</Text> */}
      </Text>
      <Text style={tw`text-xl text-center py-2 bg-slate-300 rounded-3xl mx-4 mb-2 elevation-5`}>
        Plik audio może mieć maksymalnie 3 minuty.
      </Text>
      <View
        style={tw`flex flex-row justify-center my-4 mx-4 py-4 bg-main-100 rounded-xl elevation-5`}>
        {recordingGui()}
      </View>
    </View>
  );
};

export default AudioRecordingScreen;
/**
 * Enum z statusami nagrywania
 * @property {number} NO_RECORD brak nagrywania
 * @property {number} RECORDING - nagrywanie
 * @property {number} PAUSED - nagrywanie wstrzymane
 * @property {number} RECORDED - nagranie zakończone
 * @enum {number}
 */
enum RecordingStatus {
  NO_RECORD,
  RECORDING,
  PAUSED,
  RECORDED,
}
