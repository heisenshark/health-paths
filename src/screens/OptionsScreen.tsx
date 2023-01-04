import { GoogleSignin, User } from "@react-native-google-signin/google-signin";
import * as React from "react";
import { useEffect, useState } from "react";
import { Text, View, Image, ScrollView } from "react-native";
import { Button } from "react-native-elements";
import tw from "../lib/tailwind";
import { useUserStore } from "../stores/store";
import firestore from "@react-native-firebase/firestore";
import { db, DbUser, deleteQueryBatch, Pathes, RatingDocument } from "./../config/firebase";

const OptionsScreen = ({ navigation, route }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [logIn, logOut, user, checkLogged] = useUserStore((state) => [
    state.logIn,
    state.logOut,
    state.user,
    state.checkLogged,
  ]);
  const [pathes, setPathes] = useState([]);
  const addPath = async () => {
    const data = {
      ownerId: DbUser(),
      description: "opis",
      name: "mapka",
      age: 12,
      rating: 0,
      ratingCount: 0,
      distance: 2137,
      visibility: "public",
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    console.log(data);
    Pathes.add(data);
  };
  const logPaths = async () => {
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
          ...doc.data(),
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
          logPaths();
        }}
      />
      <Button
        title="add path"
        onPress={() => {
          addPath();
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
                console.log("adding Rating", n);
                const ratingNumber = 5;
                const data = {
                  pathRef: n.id,
                  pathOwnerId: n.ownerId,
                  rating: 5,
                  comment: "super",
                  createdAt: firestore.FieldValue.serverTimestamp(),
                  userId: DbUser(),
                  userName: user.user.name,
                } as RatingDocument;
                console.log(data);

                db.collection("Ratings").add(data);
                Pathes.doc(n.id).update({
                  rating: firestore.FieldValue.increment(ratingNumber),
                  ratingsCount: firestore.FieldValue.increment(1),
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
                console.log("deleting Path");
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
          logPaths();
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
