import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, ScrollView, Image, ToastAndroid, Share } from "react-native";
import tw from "../lib/tailwind";
import { DbUser, MapDocument, Ratings } from "./../config/firebase";
import SquareButton from "./../components/SquareButton";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { formatDistance, imagePlaceholder } from "./../utils/HelperFunctions";
import { firebase } from "@react-native-firebase/auth";
import Rating from "../components/Rating";
import { Pathes } from "../config/firebase";
import { deleteMap, downloadMap, loadMap } from "../utils/FileSystemManager";
import TileButton from "../components/TileButton";
import { DownloadTrackerRecord, useDownloadTrackingStore } from "../stores/DownloadTrackingStore";
import HeaderBar from "../components/HeaderBar";

/**
 * Ekran podglądu mapy z chmury po kliknięciu w mapę z listy, wyświetla szczegóły mapy oraz umożliwia jej pobranie aktualizację oraz usunięcie z pamieci urządzenia
 * @category Ekrany
 * @param {*} { navigation, route }
 * @component
 */
const MapWebPreview = ({ navigation, route }) => {
  const [downloadTracker] = useDownloadTrackingStore((state) => [state.downloadTracker]);
  const [map, setMapa] = useState<MapDocument>(null);
  const [optionsState, setOptionsState] = useState("download");
  const [disabled, setDisabled] = useState(false);
  const rate = useRef<number>(0);

  /**
   * Funkcja formatująca datę
   * @param {number} time czas w sekundach
   * @return {string} zwraca datę w formacie "dd LLLL yyyy"
   */
  function formatTime(time: number): string {
    if (time === undefined) return "";
    return format(time * 1000, "do LLLL yyyy", { locale: pl });
  }
  /**
   * Funkcja pobierająca mapę z chmury
   */
  const fetchMap = async () => {
    const newMap = await Pathes.doc(map.id).get();
    setMapa({ id: map.id, ...newMap.data() } as MapDocument);
  };

  /**
   * Funkcja porównująca datę utworzenia mapy z datą pobrania mapy
   * @param {MapDocument} map mapa
   * @param {DownloadTrackerRecord} record wpis z obiektu pobrań
   * @return {("download" | "delete" | "update")}
   */
  const compareInfo = (map: MapDocument, record: DownloadTrackerRecord): string => {
    if (record === undefined) return "download";
    if (firebase.firestore.Timestamp.now().seconds < map.createdAt.seconds) return "delete";
    if (record.downloadDate.seconds + 10 < map.createdAt.seconds) return "update";
    return "delete";
  };

  useEffect(() => {
    const m = route.params.webMap;
    if (!m) {
      if (!route.params.id) navigation.goBack();
      Pathes.doc(route.params.id)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            ToastAndroid.show("Mapa nie istnieje", ToastAndroid.SHORT);
            navigation.goBack();
          } else {
            setUpMap({ id: doc.id, ...doc.data() } as MapDocument);
          }
        })
        .catch(() => {
          ToastAndroid.show(
            "Błąd odczytu mapy, upewnij się że czy na pewno jest publiczna",
            ToastAndroid.LONG
          );
          navigation.goBack();
        });
      return;
    }
    setUpMap(m);
  }, []);

  /**
   * Funkcja wywoływana w celu zainicjalizowania komponentu na podstawie danych ścieżki
   * @param {MapDocument} m ścieżka
   */
  function setUpMap(m: MapDocument) {
    setMapa(m as MapDocument);
    const entry = downloadTracker[m.id];

    if (entry !== undefined) {
      const state = compareInfo(m, entry);

      setOptionsState(state);
    }
  }
  /**
   * Funkcja oceniająca mapę
   */
  async function ratingAdd() {
    //
    const r = rate.current as number;

    const prevValue = await Ratings.doc(map.id + DbUser()).get();

    const dta = prevValue.data();

    await Ratings.doc(map.id + DbUser()).set({
      mapId: map.id,
      userId: DbUser(),
      rating: r,
    });

    let ratingSum = rate.current;
    if (dta && dta.rating) ratingSum -= dta.rating;
    const addition = dta ? 0 : 1;

    await Pathes.doc(map.id).update({
      rating: firebase.firestore.FieldValue.increment(ratingSum),
      ratingCount: firebase.firestore.FieldValue.increment(addition),
    });
    ToastAndroid.show("Oceniono", ToastAndroid.SHORT);
    fetchMap();
  }

  /**
   * Funkcja udostępniająca mapę
   */
  const onShare = async () => {
    try {
      const message =
        `Zapraszam do pobrania trasy ${map.name} w aplikacji Ścieżki Zdrowia. ` +
        `https://healthpaths.page.link/?link=https://example.com/pathes?id%3D${map.id}&apn=com.heisenshark.healthpaths`;
      const result = await Share.share({
        message: message,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };
  /**
   * Funkcja wywoływana po naciśnięciu przycisku pobierania mapy, pobiera mapę z chmury
   */
  async function onDownload() {
    setDisabled(true);
    try {
      await downloadMap(map);
    } catch (e) {
      ToastAndroid.show(e, ToastAndroid.SHORT);
    }
    setOptionsState("delete");
    setDisabled(false);
  }
  /**
   * Funkcja wywoływana po naciśnięciu przycisku aktualizacji mapy, usuwa mapę z pamięci lokalnej
   */
  async function onDelete() {
    setDisabled(true);
    try {
      const info = downloadTracker[map.id];
      await deleteMap(info.mapId);
      useDownloadTrackingStore.getState().deleteRecord(map.id);
    } catch (e) {
      ToastAndroid.show(e, ToastAndroid.SHORT);
    }
    setOptionsState("download");
    setDisabled(false);
  }
  /**
   * Funkcja wywoływana po naciśnięciu przycisku pokaż, pokazuje mapę w trybie podglądu
   */
  async function onShow() {
    setDisabled(true);
    try {
      const info = downloadTracker[map.id];
      const m = await loadMap("", info.mapId);
      setDisabled(false);
      navigation.navigate("PodgladMap", { map: m });
    } catch (e) {
      ToastAndroid.show(e, ToastAndroid.SHORT);
    }
  }
  /**
   * Funkcja renderująca opcje w zależności od stanu
   * @return {*}
   */
  function renderOptions() {
    switch (optionsState) {
    case "download":
      return (
        <SquareButton
          style={tw`flex-1`}
          size={30}
          icon="cloud-download-alt"
          label={"pobierz"}
          labelStyle={tw`text-xl`}
          onPress={onDownload}
        />
      );
    case "update":
      return (
        <>
          <SquareButton
            style={tw`flex-1`}
            size={30}
            icon="cloud-download-alt"
            label={"zaktualizuj"}
            labelStyle={tw`text-xl`}
            onPress={onDownload}
          />
          <SquareButton
            style={tw`flex-1 ml-4`}
            size={30}
            icon="trash"
            label={"usuń z pamięci"}
            labelStyle={tw`text-xl`}
            onPress={onDelete}
          />
        </>
      );
    case "delete":
      return (
        <>
          <SquareButton
            style={tw`flex-1`}
            size={30}
            icon={"eye"}
            label={"pokaż"}
            labelStyle={tw`text-xl`}
            onPress={onShow}
          />
          <SquareButton
            style={tw`flex-1 ml-4`}
            size={30}
            icon={"trash"}
            label={"usuń z pamięci"}
            labelStyle={tw`text-xl`}
            onPress={onDelete}
          />
        </>
      );
    }
  }

  if (!map) return <Text style={tw`text-3xl`}>Ładowanie...</Text>;
  return (
    <>
      <HeaderBar label={"ŚCIEŻKA"} useBack removeMargin />

      <ScrollView style={tw`pt-3 flex-col bg-slate-200 h-full`}>
        <View>
          <Text style={tw`mx-4 font-bold text-2xl flex-auto`} ellipsizeMode="tail">
            {map.name}
          </Text>
          <View style={tw`w-full flex flex-row mx-4 mt-4`}>
            <Image
              style={tw`flex-0 h-30 w-30 bg-white mr-2 rounded-md border-2 border-black`}
              source={{ uri: map.iconRef !== "" ? map.iconRef : imagePlaceholder }}></Image>
            <View style={tw`flex-initial flex flex-col items-start justify-center`}>
              <Text
                style={tw`text-left text-lg font-bold underline flex-initial`}
                numberOfLines={2}>
                Lokacja: {map.location || "Brak"}
              </Text>
              <Text style={tw`text-lg text-right`}>
                Dodano: {formatTime(map?.createdAt?.seconds)}
              </Text>
              <Text style={tw`text-lg bg-black text-white rounded-lg p-2 px-4 mr-auto`}>
                Dystans: {formatDistance(map?.distance)}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={tw`flex flex-row  mx-4 mt-2 pb-1 justify-around items-center border-b-2 border-slate-300`}
          pointerEvents={disabled ? "none" : "auto"}>
          {renderOptions()}
        </View>

        <View style={tw`flex flex-col items-center`}>
          <Image
            style={tw`flex-0 aspect-square w-10/12 bg-white mr-2 items-center justify-center`}
            source={{ uri: map?.previewRef }}></Image>
          <Text style={tw`text-xl font-bold self-start ml-4`}>Opis: {map.description}</Text>
        </View>
        {map.ownerId !== DbUser() ? (
          <Text style={tw`text-lg text-center`}>Mapa utworzona przez {map.ownerName}</Text>
        ) : (
          <>
            <Text style={tw`text-lg text-left ml-4`}>Jesteś właścicielem tej mapy</Text>
          </>
        )}
        <View style={tw`mt-4 mb-2 mx-14 p-4 rounded-xl bg-slate-300 `}>
          <Text style={tw`text-2xl text-center`}>
            Ocena:{" "}
            {map.ratingCount > 0 ? (
              <Text style={tw`text-3xl`}>
                {(map.rating / map.ratingCount).toFixed(2)} ({map.ratingCount})
              </Text>
            ) : (
              <Text style={tw`text-2xl`}>Brak ocen</Text>
            )}
          </Text>
        </View>

        {DbUser() !== undefined && (
          <View style={tw`flex flex-col justify-center items-center`}>
            <Rating
              style={tw`w-10/12 justify-around mb-4`}
              onRatingChange={(rating) => {
                rate.current = rating;
              }}
              onSubmit={ratingAdd}></Rating>
          </View>
        )}

        {map.visibility === "public" && (
          <View style={tw`flex flex-initial mx-10 mb-10`}>
            <TileButton style={tw``} label="Udostępnij!" icon="share" onPress={onShare} />
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default MapWebPreview;
