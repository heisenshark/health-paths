import { firebase } from "@react-native-firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Card, Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome5";
import HeaderBar from "../components/HeaderBar";
import MapCard from "../components/MapCard";
import { ModalChoice, useAlertModal } from "../components/ModalChoice";
import OptionsModal from "../components/OptionsModal";
import SquareButton from "../components/SquareButton";
import {
  DbUser,
  deleteMapWeb,
  MapDocument,
  Pathes,
  togglePrivate,
  Users,
} from "../config/firebase";
import { useForceUpdate } from "../hooks/useForceUpdate";
import tw from "../lib/tailwind";
import { useDownloadTrackingStore } from "../stores/DownloadTrackingStore";
import { useMapStore } from "../stores/store";
import {
  deleteMap,
  getURI,
  listAllMaps,
  loadMap,
  zipUploadMapFolder,
} from "../utils/FileSystemManager";
import { imagePlaceholder } from "../utils/HelperFunctions";
import { HealthPath } from "../utils/interfaces";

/**
 * Ekran wyświetlający listę map użytkownika
 * @category Ekrany
 * @param {*} navigation_props { navigation, route }
 * @component
 */
const MapExplorerScreen = ({ navigation, route }) => {
  const [downloadTracker] = useDownloadTrackingStore((state) => [state.downloadTracker]);
  const [setCurrentMap] = useMapStore((state) => [state.setCurrentMap]);

  const [maps, setMaps] = useState<HealthPath[]>([]);
  const [userMaps, setUserMaps] = useState<MapDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [additionalOptions, setAdditionalOptions] = useState([]);
  const [mapsState, setMapsState] = useState("local");
  const [webDisabled, setWebDisabled] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [alertState, showAlert] = useAlertModal();

  const force = useForceUpdate();
  const selectedMap = useRef(null);
  /**
   * Funkcja wywoływana przy zmianie wartości pola wyszukiwania
   * @param query nowa wartość pola wyszukiwania
   */
  const onChangeSearch = (query: string) => setSearchQuery(query);
  /**
   * Funkcja w celu odświeżenia listy ścieżek
   */
  const refreshMaps = async () => {
    const m = await listAllMaps();
    setMaps(m);
  };
  /**
   * Funkcja w celu pobrania ścieżek użytkownika z bazy danych
   */
  const fetchUserMaps = async () => {
    const user = await Users.doc(DbUser()).get();

    if (user.exists) {
      const maps = user.data().maps;
      const mapsData = await Pathes.where("ownerId", "==", DbUser()).get();
      const mapsDocs = mapsData.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as MapDocument[];
      setUserMaps(mapsDocs);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (DbUser() === undefined) {
        setWebDisabled(true);
        setMapsState("local");
        setAdditionalOptions(localOptions());
      } else {
        setWebDisabled(false);
      }
    }, [])
  );

  useEffect(() => {
    selectedMap.current = null;
    setModalVisible(false);
    refreshMaps();
  }, []);

  const options = [] as { label: string; icon?: string; disabled?: boolean; onPress: () => void }[];

  /**
   * Funkcja zwracająca opcje dla ścieżek lokalnych
   * @return {*} opcje dla ścieżek lokalnych
   */
  function localOptions() {
    const isOwner = DbUser() != undefined;
    return [
      {
        label: "Pokaż ścieżkę",
        icon: "eye",
        onPress: () => {
          setModalVisible(false);
          loadMap(selectedMap.current.name, selectedMap.current.map_id).then((m) => {
            navigation.navigate("PodgladMap", { map: m });
          });
        },
      },
      {
        label: "Edytuj ścieżkę",
        icon: "edit",
        onPress: async () => {
          setModalVisible(false);
          setCurrentMap(selectedMap.current);
          loadMap(selectedMap.current.name, selectedMap.current.map_id).then((m) => {
            setCurrentMap(m);
            navigation.navigate("Planuj", { isRecording: false, editting: true });
          });
        },
      },
      {
        label: "Prześlij ścieżkę",
        icon: "cloud-upload",
        onPress: async () => {
          if (DbUser() === undefined) {
            setModalVisible(false);
            return;
          }

          showAlert("Przesyłanie ścieżki, wybierz prywatność", [
            {
              text: "Publiczna",
              icon: "eye",
              onPress: async () => {
                setDisabled(true);
                await zipUploadMapFolder(selectedMap.current.map_id, "public");
                setDisabled(false);
                refreshMaps();
              },
            },
            {
              text: "Prywatna",
              icon: "eye-slash",
              onPress: async () => {
                setDisabled(true);
                await zipUploadMapFolder(selectedMap.current.map_id, "private");
                setDisabled(false);
                refreshMaps();
              },
            },
          ]);
          setModalVisible(false);
        },
        disabled: DbUser() === undefined,
      },
      {
        label: "Usuń ścieżkę",
        icon: "trash",
        onPress: () => {
          showAlert(
            "Czy na pewno chcesz usunąć ścieżkę z pamięci?",
            [
              {
                text: "Tak",
                icon: "trash",
                onPress: async () => {
                  await deleteMap(selectedMap.current.map_id);
                  setModalVisible(false);
                  refreshMaps();
                },
              },
              { text: "Anuluj", icon: "arrow-left", onPress: () => {} },
            ],
            true
          );
          setModalVisible(false);
        },
      },
    ];
  }

  /**
   * Funkcja zwracająca opcje dla ścieżki z serwera
   * @param {MapDocument} map dokument ścieżki
   * @param {boolean} isPrivate czy ścieżka jest prywatna
   * @return {*} opcje dla ścieżki z serwera
   */
  function webOptions(map: MapDocument, isPrivate: boolean) {
    return [
      {
        label: "pokaż",
        icon: "eye",
        onPress: async () => {
          navigation.navigate("MapWebPreviewScreen", { webMap: map });
        },
      },
      {
        label: "ustaw na prywatną",
        icon: "eye-slash",
        onPress: async () => {
          try {
            await togglePrivate(map.id, true);
            map.visibility = "private";
            force();
          } catch (e) {}
        },
        disabled: isPrivate,
      },
      {
        label: "ustaw na publiczną",
        icon: "eye",
        onPress: async () => {
          try {
            await togglePrivate(map.id, false);
            map.visibility = "public";
            force();
          } catch (e) {}
        },
        disabled: !isPrivate,
      },
      {
        label: "usuń",
        icon: "trash",
        onPress: () => {
          showAlert(
            "Czy na pewno chcesz usunąć mapę z internetu?",
            [
              {
                text: "Tak",
                icon: "trash",
                onPress: async () => {
                  await deleteMapWeb(map.id);

                  Users.doc(DbUser()).set(
                    {
                      maps: firebase.firestore.FieldValue.arrayRemove(map.id),
                    },
                    { merge: true }
                  );

                  setUserMaps(userMaps.filter((m) => m.id !== map.id));
                  refreshMaps();
                },
              },
              { text: "Anuluj", icon: "arrow-left", onPress: () => {} },
            ],
            true
          );
          setModalVisible(false);
        },
      },
    ];
  }

  /**
   * Funkcja renderująca listę ścieżek lokalnych
   */
  function renderMaps() {
    if (maps.length === 0)
      return (
        <View style={tw`h-100 flex items-center justify-center`}>
          <Text style={tw`text-3xl text-center font-bold`}>Brak map...</Text>
          <Text style={tw`text-xl w-2/3 text-center font-semibold`} numberOfLines={2}>
            Możesz je dodać w Sekcji Planuj oraz Nagraj
          </Text>
        </View>
      );

    return maps
      .filter((map) => {
        return (
          map.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          map.location.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
      })
      .map((map) => (
        <MapCard
          key={map.map_id}
          name={map.name}
          location={map.location}
          icon={map.imageIcon === undefined ? "" : getURI(map, map.imageIcon)}
          onPress={() => {
            selectedMap.current = map;
            setModalVisible(true);
            setAdditionalOptions(localOptions());
          }}
        />
      ));
  }
  /**
   * Funkcja renderująca listę ścieżek udostępnionych przez użytkownika
   */
  function renderUserMaps() {
    if (userMaps.length === 0)
      return (
        <View style={tw`h-100 flex items-center justify-center`}>
          <Text style={tw`text-3xl text-center font-bold`}>Brak map...</Text>
          <Text style={tw`text-xl w-2/3 text-center font-semibold`} numberOfLines={2}>
            Możesz je udostępniać w zakładce Lokalne
          </Text>
        </View>
      );

    return userMaps.map((map) => (
      <MapCard
        key={map.id}
        icon={map.iconRef}
        name={map.name}
        location={map.location}
        visibility={map.visibility}
        isDownloaded={downloadTracker[map.id] !== undefined}
        onPress={() => {
          selectedMap.current = map;

          setAdditionalOptions(webOptions(map, map.visibility === "private"));
          setModalVisible(true);
        }}
      />
    ));
  }

  return (
    <View style={tw`h-full`} pointerEvents={disabled ? "none" : "auto"}>
      <ModalChoice {...alertState} />
      <OptionsModal
        visible={modalVisible}
        label={"Co chcesz zrobić ze ścieżką?"}
        onRequestClose={() => {
          setModalVisible(false);
        }}
        actions={[...options, ...additionalOptions]}></OptionsModal>

      <HeaderBar label={"MOJE ŚCIEŻKI"} useBack removeMargin />

      {mapsState === "local" && (
        <Searchbar
          placeholder="Wyszukaj ścieżkę"
          style={tw`shadow-md`}
          value={searchQuery}
          onChangeText={onChangeSearch}></Searchbar>
      )}

      <ScrollView>
        {mapsState === "local" && renderMaps()}
        {mapsState === "web" && renderUserMaps()}
      </ScrollView>
      <View style={tw`flex flex-row border-b-2 border-slate-700`}>
        <SquareButton
          style={tw`flex flex-1 h-14 rounded-none border-b-0 border-r-0 border-main-700 rounded-tl-3xl`}
          active={mapsState === "local"}
          label="lokalne"
          labelStyle={tw`text-3xl`}
          onPress={() => {
            setMapsState("local");
          }}
        />
        <View style={tw`border-l-2 border-main-700`}></View>
        <SquareButton
          style={tw`flex flex-1 h-14 rounded-none border-b-0 border-l-0 border-main-700 rounded-tr-3xl `}
          active={mapsState === "web"}
          label="w chmurze"
          labelStyle={tw`text-3xl`}
          disabled={webDisabled}
          onPress={() => {
            fetchUserMaps();
            setMapsState("web");
          }}
        />
      </View>
    </View>
  );
};

export default MapExplorerScreen;
