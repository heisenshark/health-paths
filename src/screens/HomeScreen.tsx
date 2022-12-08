import React, { useEffect, useState } from "react";
import { Text, View, Button } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import SquareButton from "../components/SquareButton";
import tw from "../lib/tailwind";

const HomeScreen = ({ navigation }) =>
//TODO przycisk podłóżny

{
  useEffect(() => {
    // navigation.navigate("NagrywanieAudio");
  }, []);

  const [lol, setLol] = useState(1);
  //generate random number
  return (
    <View>
      <Icon name="rocket" size={30} color="#900" />
      <View className="flex-row flex-wrap">
        <SquareButton label="Gotowe">
          <Icon name="check" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Przybliż">
          <Icon name="search-plus" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Oddal">
          <Icon name="search-minus" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Dodaj">
          <Icon name="plus" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Edytuj">
          <Icon name="edit" size={40} color="black" className="flex-1" />
        </SquareButton>
        <SquareButton label="Zapisz">
          <Icon name="save" size={40} color="black" className="flex-1" />
        </SquareButton>
      </View>
      <Button
        title="Go to map screen"
        onPress={() => navigation.navigate("Nagraj", { name: "Jane" })}
      />
      <Button
        title="Go to AudioRecord"
        onPress={() => navigation.navigate("NagrywanieAudio", { RecordedAudioUri: "" })}
      />
      <Button title="lol" onPress={() => setLol(lol + 1)} />
      <Text style={tw`bg-slate-${lol * 100}`}></Text>
    </View>
  );
};

export default HomeScreen;
