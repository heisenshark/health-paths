import { GoogleSignin, User } from "@react-native-google-signin/google-signin";
import * as React from "react";
import { useEffect, useState } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import { Button } from "react-native-elements";
import tw from "../lib/tailwind";
import { useUserStore } from "../stores/store";
import firestore from "@react-native-firebase/firestore";
import { db, DbUser, deleteQueryBatch, Pathes, RatingDocument } from "./../config/firebase";
import { firebase } from "@react-native-firebase/auth";
import auth from "@react-native-firebase/auth";
import { imagePlaceholder } from "../utils/HelperFunctions";

const OptionsScreen = ({ navigation, route }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [logOut, checkLogged] = useUserStore((state) => [state.logOut, state.checkLogged]);
  const [user, setUser] = useState(undefined as User | undefined);
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

  const logIn = async () => {
    try {
      const elo = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      // Create a Google credential with the token
      const googleCredential = await auth.GoogleAuthProvider.credential(idToken);
      await GoogleSignin.clearCachedAccessToken(idToken);
      await GoogleSignin.getTokens();
      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);
      const usr = await GoogleSignin.getCurrentUser();
      setUser(usr);
    } catch (e) {
      console.log("err");
      console.log(e);
    }
  };

  useEffect(() => {
    console.log("navchange options");
    if (DbUser() === undefined) return;
    GoogleSignin.getCurrentUser().then((u) => {
      setUser(u);
    });
  }, [route.key]);

  return DbUser() !== undefined ? (
    <ScrollView style={tw`flex`} contentContainerStyle={""}>
      <Text style={tw`text-3xl p-10 pb-2`}>Opcje Użytkownika</Text>
      <Text style={tw`text-3xl pb-10`}>Zalogowany jako</Text>
      <Image
        style={tw`h-40 aspect-square rounded-full `}
        source={{ uri: user ? user.user.photo : imagePlaceholder }}
      />
      <Text style={tw`text-3xl `}>{user?.user?.name}</Text>
      <Button
        title="Wyloguj"
        onPress={async () => {
          await firebase.auth().signOut();
          // console.log(DbUser());
          GoogleSignin.signOut();
          setIsLogged(false);
          // logOut();
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
                  rating: 5,
                  userId: DbUser(),
                  createdAt: firestore.FieldValue.serverTimestamp(),
                } as RatingDocument;
                console.log(data);

                db.collection("Ratings").add(data);
                Pathes.doc(n.id).update({
                  rating: firestore.FieldValue.increment(ratingNumber),
                  ratingCount: firestore.FieldValue.increment(1),
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
      {/* <Button
        title="Zaloguj"
        onPress={() => {
          navigation.navigate("LogIn");
        }}
      /> */}
      <TouchableOpacity
        style={tw`w-10/12 h-4/12 bg-red-100 flex items-center justify-center border-4 rounded-2xl`}
        onPress={() =>
          logIn()
            .then(() => {
              console.log("Signed in with Google!");
              setIsLogged(true);
            })
            .catch((err) => {
              console.log(err);
            })
        }>
        <Text style={tw`text-xl text-center p-6`}>Zaloguj się przez google</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OptionsScreen;
