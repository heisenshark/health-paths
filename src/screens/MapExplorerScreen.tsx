import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import { Card, Searchbar } from "react-native-paper";
import OptionsModal from "../components/OptionsModal";
import SquareButton from "../components/SquareButton";
import { DbUser, MapDocument, Pathes, Users } from "../config/firebase";
import tw from "../lib/tailwind";
import { useMapStore } from "../stores/store";
import {
  deleteMap,
  getURI,
  listAllMaps,
  loadMap,
  zipUploadMapFolder,
} from "../utils/FileSystemManager";
import { getCityAdress, imagePlaceholder } from "../utils/HelperFunctions";
import { HealthPath } from "../utils/interfaces";

//TODO uprościć menu wyboru co chcemy zrobić z mapą do prostego modala

const MapExplorerScreen = ({ navigation, route }) => {
  const [setCurrentMap] = useMapStore((state) => [state.setCurrentMap]);
  const [maps, setMaps] = useState<HealthPath[]>([]);
  const [userMaps, setUserMaps] = useState<MapDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(true);
  const [additionalOptions, setAdditionalOptions] = useState([]);
  const [mapsState, setMapsState] = useState("local");
  const onChangeSearch = (query: string) => setSearchQuery(query);

  const refreshMaps = async () => {
    const m = await listAllMaps();
    m.forEach((map) => {
      console.log(map.imagePreview);
    });
    setMaps(m);
  };

  const selectedMap = useRef(null);

  const fetchUserMaps = async () => {
    const user = await Users.doc(DbUser()).get();
    console.log(user.data());

    if (user.exists) {
      const maps = user.data().maps;
      const mapsData = await Pathes.where("ownerId", "==", DbUser()).get();

      const mapsDocs = mapsData.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as MapDocument[];
      console.log(mapsDocs);

      setUserMaps(mapsDocs);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (DbUser() === undefined) {
        setMapsState("local");
        setAdditionalOptions(localOptions());
      }
      console.log("aaaaaa");
    }, [])
  );

  useEffect(() => {
    selectedMap.current = null;
    setModalVisible(false);
    refreshMaps();
  }, []);

  const options = [] as { label: string; icon?: string; disabled?: boolean; onPress: () => void }[];

  function localOptions() {
    const isOwner = DbUser() != undefined;
    return [
      {
        label: "Pokaż Mapę",
        icon: "cloud-download",
        onPress: () => {
          setModalVisible(false);
          loadMap(selectedMap.current.name, selectedMap.current.map_id).then((m) => {
            setCurrentMap(m);
            navigation.navigate("PodgladMap");
          });
        },
      },
      {
        label: "Edytuj mapę",
        icon: "cloud-upload",
        onPress: async () => {
          setModalVisible(false);
          setCurrentMap(selectedMap.current);
          loadMap(selectedMap.current.name, selectedMap.current.map_id).then((m) => {
            setCurrentMap(m);
            navigation.navigate("Nagraj", { isRecording: false, editting: true });
          });
        },
      },
      {
        label: "Prześlij do internetu",
        icon: "minus-circle",
        onPress: async () => {
          if (DbUser() !== undefined) await zipUploadMapFolder(selectedMap.current.map_id);
          setModalVisible(false);
        },
        disabled: DbUser() === undefined,
      },
      {
        label: "Usuń mapę",
        icon: "cloud-upload",
        onPress: () => {
          deleteMap(selectedMap.current.map_id).then(() => {
            setModalVisible(false);
            refreshMaps();
          });
        },
      },
    ];
  }

  function webOptions(isPrivate: boolean) {
    return [
      {
        label: "pokaż",
        icon: "minus-circle",
        onPress: async () => {
          console.log("mocked");
        },
        disabled: isPrivate,
      },
      {
        label: "ustaw na prywatną",
        icon: "minus-circle",
        onPress: async () => {
          console.log("mocked");
        },
        disabled: isPrivate,
      },
      {
        label: "ustaw na publiczną",
        icon: "minus-circle",
        onPress: async () => {
          console.log("mocked");
        },
        disabled: !isPrivate,
      },
      {
        label: "usuń",
        icon: "minus-circle",
        onPress: async () => {
          console.log("mocked");
        },
        disabled: isPrivate,
      },
    ];
  }

  function renderMaps() {
    return maps
      .filter((map) => {
        return (
          map.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          map.location.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
      })
      .map((map) => {
        if (map.imagePreview) console.log({ aa: getURI(map, map.imagePreview) });

        return (
          <Card
            key={map.map_id}
            style={tw`flex flex-row my-1 mx-2`}
            onPress={() => {
              selectedMap.current = map;
              setModalVisible(true);
              setAdditionalOptions(localOptions());
            }}>
            <Card.Content style={tw`flex flex-row`}>
              <Image
                style={tw`flex-0 h-20 w-20 bg-white mr-2`}
                source={{
                  uri: map.imageIcon === undefined ? imagePlaceholder : getURI(map, map.imageIcon),
                }}></Image>

              <View style={tw`flex-1`}>
                <Text style={tw`text-xl font-bold pr-2`} numberOfLines={1}>
                  {map.name}
                </Text>
                <Text style={tw`text-xl`}>{getCityAdress(map.location)}</Text>
                <Text style={tw`text-xl`}>{map.map_id}</Text>
              </View>
            </Card.Content>
          </Card>
        );
      });
  }

  function renderUserMaps() {
    return (
      userMaps
        // .filter((map) => {
        //   return (
        //     map.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        //     map.location.toLowerCase().includes(searchQuery.toLowerCase().trim())
        //   );
        // })
        .map((map) => {
          if (map.previewRef) console.log({ aa: map.previewRef });

          return (
            <Card
              key={map.id}
              style={tw`flex flex-row my-1 mx-2`}
              onPress={() => {
                selectedMap.current = map;
                setModalVisible(true);
                setAdditionalOptions(webOptions(map.visibility === "private"));
              }}>
              <Card.Content style={tw`flex flex-row`}>
                <Image
                  style={tw`flex-0 h-20 w-20 bg-white mr-2`}
                  source={{
                    uri: map.iconRef === "" ? imagePlaceholder : map.iconRef,
                  }}></Image>

                <View style={tw`flex-1`}>
                  <Text style={tw`text-xl font-bold pr-2`} numberOfLines={1}>
                    {map.name}
                  </Text>
                  <Text style={tw`text-xl`}>{getCityAdress(map.location)}</Text>
                  <Text style={tw`text-xl`}>{map.id}</Text>
                </View>
              </Card.Content>
            </Card>
          );
        })
    );
  }

  return (
    <View style={tw`h-full`}>
      <OptionsModal
        visible={modalVisible}
        label={"Co chcesz zrobić z mapą?"}
        onRequestClose={() => {
          setModalVisible(false);
        }}
        actions={[...options, ...additionalOptions]}></OptionsModal>
      <View style={tw`bg-main-1 flex justify-center shadow-md`}>
        <Text style={tw`text-4xl font-bold m-0 pt-2 pl-4 shadow-md`}>
          <Text>LOKALNE </Text>
          <Text> WEB</Text>
        </Text>
      </View>
      <View style={tw`flex flex-row`}>
        <SquareButton
          style={tw`flex flex-1 h-10 mx-4 my-2`}
          uberActive={mapsState === "local"}
          label="lokalne"
          onPress={() => {
            setMapsState("local");
          }}
        />
        <SquareButton
          style={tw`flex flex-1 h-10 mx-4 my-2`}
          uberActive={mapsState === "web"}
          label="web"
          disabled={DbUser() === undefined}
          onPress={() => {
            fetchUserMaps();
            setMapsState("web");
          }}
        />
      </View>
      <Searchbar
        placeholder="Wyszukaj ścieżkę"
        style={tw`shadow-md`}
        value={searchQuery}
        onChangeText={onChangeSearch}></Searchbar>
      <ScrollView>
        {mapsState === "local" && renderMaps()}
        {mapsState === "web" && renderUserMaps()}
      </ScrollView>
    </View>
  );
};

export default MapExplorerScreen;
