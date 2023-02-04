import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import tw from "../lib/tailwind";
import { imagePlaceholder } from "../utils/HelperFunctions";
import Icon from "react-native-vector-icons/FontAwesome5";

/**
 * @property {string} [id] id mapy
 * @property {string} icon ikona mapy
 * @property {("public" | "private")} [visibility] widoczność mapy
 * @property {string} name nazwa mapy
 * @property {string} location lokalizacja mapy
 * @property {boolean} [isDownloaded] czy mapa jest pobrana
 * @property {function} onPress funkcja wywoływana po naciśnięciu mapy
 * @interface Props
 */
interface Props {
  id?: string;
  icon: string;
  visibility?: "public" | "private";
  name: string;
  location: string;
  isDownloaded?: boolean;
  onPress: () => void;
}

/**
 * Komponent wyświetlający mapę w liście map.
 * @param {Props} { id, icon, visibility, name, location, isDownloaded, onPress }
 * @component
 */
const MapCard = ({ id, icon, visibility, name, location, isDownloaded, onPress }: Props) => {
  return (
    <TouchableOpacity
      key={id}
      style={tw`flex flex-col my-2 mx-2 bg-main-200 border-2 border-main-500 px-2 py-2 rounded-xl elevation-3`}
      onPress={onPress}>
      <View style={tw`flex flex-row pr-2`}>
        <Image
          style={tw`flex-0 h-20 w-20 bg-white border-2 border-black rounded-lg mr-2`}
          source={{
            uri: icon === "" ? imagePlaceholder : icon,
          }}></Image>

        <View style={tw`flex-auto flex flex-col rounded-xl items-stretch`}>
          <Text style={tw`text-xl font-bold`} ellipsizeMode="tail" numberOfLines={1}>
            {name}
          </Text>
          <Text style={tw`flex-auto text-xl`} ellipsizeMode="tail" numberOfLines={1}>
            {location}
          </Text>

          {visibility !== undefined && (
            <Text style={tw`text-xl text-right`}>
              <Icon name={visibility === "public" ? "eye" : "eye-slash"}></Icon>{" "}
              {visibility === "private" ? "prywatna" : "publiczna"}
              {isDownloaded && (
                <>
                  {"  "}
                  <Icon name={"download"}></Icon>
                  <Text> pobrana</Text>
                </>
              )}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MapCard;
