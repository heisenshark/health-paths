import { GoogleSignin, User } from "@react-native-google-signin/google-signin";
import * as React from "react";
import { useEffect, useState } from "react";
import { Text, View, Image, ScrollView } from "react-native";
import { Button } from "react-native-elements";
import tw from "../lib/tailwind";
import { useUserStore } from "../stores/store";
import firestore from "@react-native-firebase/firestore";
import { db, deleteQueryBatch, Pathes } from "./../config/firebase";

const OptionsScreen = ({ navigation, route }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [logIn, logOut, user, checkLogged] = useUserStore((state) => [
    state.logIn,
    state.logOut,
    state.user,
    state.checkLogged,
  ]);
  const [pathes, setPathes] = useState([]);
  const fetchPatches = async () => {
    Pathes.add({
      name: "mapka",
      age: 12,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  };
  const logUsers = async () => {
    const users = await Pathes.get();
    users.forEach((n) => console.log(n));
    return users;
  };

  useEffect(() => {
    const unsub = Pathes.onSnapshot((querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        const { name, age } = doc.data();
        list.push({
          id: doc.id,
          name,
          age,
        });
      });
      setPathes(list);
    });

    return unsub;
  }, []);

  return user != null ? (
    <ScrollView style={tw`flex`} contentContainerStyle={""}>
      <Text style={tw`text-3xl p-10 pb-2`}>Opcje Użytkownika</Text>
      <Text style={tw`text-3xl pb-10`}>Zalogowany jako</Text>
      <Image style={tw`h-40 aspect-square rounded-full `} source={{ uri: user.user.photo }} />
      <Text style={tw`text-3xl `}>{user.user.name}</Text>
      <Button
        title="Wyloguj"
        onPress={() => {
          GoogleSignin.signOut();
          setIsLogged(false);
          logOut();
        }}
      />
      <Button
        title="test firestore"
        onPress={() => {
          fetchPatches();
        }}
      />
      <Button
        title="test firestore"
        onPress={() => {
          logUsers();
        }}
      />
      {pathes.map((n) => (
        <View key={n.id}>
          <Text>
            {n.name} {n.id}
          </Text>
          <View style={tw`flex-row flex `}>
            <Button
              title={"dodaj Rating"}
              onPress={() => {
                db.collection("Ratings").add({
                  pathRef: n.id,
                  rating: 5,
                  comment: "super",
                  createdAt: firestore.FieldValue.serverTimestamp(),
                });
              }}></Button>
            <Button
              title={"print ratings"}
              onPress={() => {
                console.log("printing Ratings");
                db.collection("Ratings")
                  .where("pathRef", "==", n.id)
                  .get()
                  .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      console.log(doc.data());
                    });
                  });
              }}></Button>
            <Button
              title={"remove path"}
              onPress={() => {
                console.log("printing Ratings");
                const id = n.id;
                const query = db.collection("Ratings").where("pathRef", "==", n.id);
                deleteQueryBatch(query, () => {});
                Pathes.doc(id).delete();
              }}></Button>
          </View>
        </View>
      ))}
      <Button
        title="test firestore"
        onPress={() => {
          logUsers();
        }}
      />
    </ScrollView>
  ) : (
    <View style={tw`flex items-center`}>
      <Text style={tw`text-3xl p-10 pb-2`}>Opcje Użytkownika</Text>
      <Text style={tw`text-3xl pb-10`}>Zaloguj się aby korzystać z opcji</Text>
      <Button
        title="Zaloguj"
        onPress={() => {
          navigation.navigate("LogIn");
        }}
      />
    </View>
  );
};

export default OptionsScreen;
