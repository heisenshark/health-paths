import * as React from "react";
import { Text, View, StyleSheet, ScrollView, Image } from "react-native";
import SquareButton from "./../components/SquareButton";
import { Icon } from "react-native-vector-icons/FontAwesome";
import tw from "../lib/tailwind";
import Waypoint from "./../utils/interfaces";
import { TextInput } from "react-native-paper";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

interface StopPointEditScreenProps {
  editedWaypoint: Waypoint;
}

const StopPointEditScreen = ({ navigation, route }) => {
    const { editedWaypoint } = route.params as { editedWaypoint: Waypoint };
    const [name, setName] = useState(editedWaypoint.displayed_name);
    const [description, setDescription] = useState(editedWaypoint.description);

    const [image, setImage] = useState(null);

    const pickImage = async () => {
    // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }

        editedWaypoint.image = result.assets[0].uri;
    };

    return (
        <ScrollView style={tw`bg-main-2`}>
            <View style={tw`px-4 py-4 flex-col`}>
                <Text style={tw`text-3xl font-bold`}>Edytuj Punkt Zdrowia:</Text>
                <View>
                    <Image
                        style={tw`aspect-square w-full h-auto justify-center self-center my-4 border-4 border-black rounded-2xl`}
                        source={{ uri: editedWaypoint.image }}
                    />
                    <SquareButton
                        addStyle={"absolute bottom-8 right-4"}
                        label={"Edytuj"}
                        onPress={pickImage}></SquareButton>
                </View>

                <View style={tw`flex-row justify-between items-center my-4 `}>
                    <Text style={tw`text-3xl font-bold`}>Opis Audio</Text>
                    <View style={tw`flex-row`}>
                        <SquareButton
                            addStyle={"ml-auto mr-2"}
                            label={"Edytuj"}
                            onPress={() => {
                                console.log("");
                            }}></SquareButton>
                        <SquareButton
                            addStyle={"ml-auto"}
                            label={"Odtwórz"}
                            onPress={() => {
                                console.log("Otwieram audio");
                            }}></SquareButton>
                    </View>
                </View>
                <TextInput
                    style={tw`rounded-xl bg-main-1 text-2xl`}
                    placeholder="Nazwa"
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                    }}
                    label="Nazwa Punktu"></TextInput>
                <TextInput
                    style={tw`h-60 rounded-xl my-4 bg-main-1 text-2xl`}
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
