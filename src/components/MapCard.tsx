import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import tw from "../lib/tailwind";
import { getCityAdress, imagePlaceholder } from "../utils/HelperFunctions";
import Icon from "react-native-vector-icons/FontAwesome5";
import { MapDocument } from "../config/firebase";
import { HealthPath } from "../utils/interfaces";
import { getURI } from "../utils/FileSystemManager";

type Props = {
  id?: string;
  icon: string;
  visibility?: "public" | "private";
  name: string;
  location: string;
  onPress: () => void;
};

const MapCard = ({ id, icon, visibility, name, location, onPress }: Props) => {
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
            {getCityAdress(location)}
          </Text>

          {visibility !== undefined && (
            <Text style={tw`text-xl text-right`}>
              <Icon name={visibility === "public" ? "eye" : "eye-slash"}></Icon>{" "}
              {visibility === "private" ? "prywatna" : "publiczna"}
            </Text>
          )}

          {/* {id !== undefined && (
            <Text style={tw`text-xl`} numberOfLines={1}>
              {id}
            </Text>
          )} */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MapCard;
