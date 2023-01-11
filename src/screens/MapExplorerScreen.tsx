import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import { Card, Searchbar } from "react-native-paper";
import OptionsModal from "../components/OptionsModal";
import { DbUser } from "../config/firebase";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(true);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const refreshMaps = async () => {
    const m = await listAllMaps();
    m.forEach((map) => {
      console.log(map.imagePreview);
    });
    setMaps(m);
  };

  const selectedMap = useRef(null);

  useEffect(() => {
    selectedMap.current = null;
    setModalVisible(false);
    refreshMaps();
  }, []);

  const options = [
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
  ] as { label: string; icon?: string; onPress: () => void }[];
  return (
    <View style={tw`h-full`}>
      <OptionsModal
        visible={modalVisible}
        label={"Co chcesz zrobić z mapą?"}
        onRequestClose={() => {
          setModalVisible(false);
        }}
        actions={options}></OptionsModal>
      <View style={tw`bg-main-1 flex justify-center shadow-md`}>
        <Text style={tw`text-4xl font-bold m-0 pt-2 pl-4 shadow-md`}>
          <Text>LOKALNE </Text>
          <Text> WEB</Text>
        </Text>
      </View>
      <Searchbar
        placeholder="Wyszukaj ścieżkę"
        style={tw`shadow-md`}
        value={searchQuery}
        onChangeText={onChangeSearch}></Searchbar>
      <ScrollView>
        {maps
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
                }}>
                <Card.Content style={tw`flex flex-row`}>
                  <Image
                    style={tw`flex-0 h-20 w-20 bg-white mr-2`}
                    source={{
                      uri:
                        map.imageIcon === undefined ? imagePlaceholder : getURI(map, map.imageIcon),
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
          })}
      </ScrollView>
    </View>
  );
};

export default MapExplorerScreen;
