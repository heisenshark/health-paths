import { log } from "react-native-reanimated";
import { ToastAndroid } from "react-native";
// Import the functions you need from the SDKs you need
import "@react-native-firebase/app";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebase, storage } from "@react-native-firebase/storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

export const gApiKey = "***REMOVED***";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

/**
 * Interfejs mapy w bazie danych
 * @property {string} id Identyfikator mapy
 * @property {string} ownerId Identyfikator właściciela mapy
 * @property {string} ownerName Nazwa właściciela mapy
 * @property {string} description Opis mapy
 * @property {string} name Nazwa mapy
 * @property {number} rating suma ocen mapy
 * @property {number} ratingCount Liczba ocen mapy
 * @property {number} distance Odległość od użytkownika
 * @property {string} location Lokalizacja mapy
 * @property {"public" | "private"} visibility Widoczność mapy
 * @property {string} storeRef Ścieżka do pliku z mapą
 * @property {string} previewRef Ścieżka do pliku z podglądem mapy
 * @property {string} iconRef Ścieżka do pliku z ikoną mapy
 * @property {FirebaseFirestoreTypes.Timestamp} createdAt Data utworzenia mapy
 * @export
 * @interface MapDocument
 * @category firebase
 */
export interface MapDocument {
  id?: string;
  ownerId: string;
  ownerName: string;
  description: string;
  name: string;
  rating?: number;
  ratingCount?: number;
  distance: number;
  location: string;
  visibility: "public" | "private";
  storeRef: string;
  previewRef: string;
  iconRef: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}
/**
 * @property {string} id Identyfikator użytkownika
 * @property {number} rating ocena
 * @property {string} mapId Identyfikator mapy
 * @export
 * @interface RatingDocument
 * @category firebase
 */
export interface RatingDocument {
  mapId?: string;
  rating: number;
  userId: string;
}

// Initialize Firebase
const signinApp = initializeApp(firebaseConfig);
GoogleSignin.configure({
  webClientId: "***REMOVED***-hnrvujupc8dlvnkro5nslrobk7m2bdbk.apps.googleusercontent.com",
});

export const stor = firebase.storage();
/*Odkomentować jeśli chcemy korzystać z emulatora*/
if (__DEV__) {
  // firestore().useEmulator("localhost", 8081);
  // firebase.storage().useEmulator("localhost", 9199);
}

/*referencja do bazy*/
export const db = firestore();
/*referencja do ścieżek*/
export const Pathes = db.collection("Pathes");
/*referencja do użytkowników*/
export const Users = db.collection("Users");
/*referencja do ocen*/
export const Ratings = db.collection("Ratings");
/*zalogowany użytkownik*/
export const DbUser = () => firebase.auth().currentUser?.uid;
db.settings({ persistence: false });

/**
 * Funckja dodająca ścieżkę do bazy
 * @export
 * @param {MapDocument} map ścieżka
 * @param {string} [webId=undefined] id ścieżki, jeśli znajduje się uprzednio w bazie
 * @return {Promise<string>} id ścieżki
 * @category firebase
 */
export async function addPath(map: MapDocument, webId: string = undefined): Promise<string> {
  let doc = null;
  let id = "";

  if (webId === undefined) {
    doc = await Pathes.add(map);
    id = doc.id;
  } else {
    await Pathes.doc(webId).set(map, { merge: true });
    doc = map;
    id = webId;
    doc["id"] = webId;
  }

  const userId = firebase.auth().currentUser?.uid;
  const user = await Users.doc(userId).get();
  if (user.data()?.maps.length >= 20) throw new Error("You have reached the limit of 20 maps");
  await Users.doc(userId).set(
    {
      maps: firestore.FieldValue.arrayUnion(id),
    },
    { merge: true }
  );
  return id;
}
/**
 * Funkcja usuwająca plik z chmury
 * @param {*} fileRef
 * @category firebase
 */
async function deleteFile(fileRef) {
  try {
    await fileRef.delete();
  } catch (error) {
    ToastAndroid.show("Błąd z usuwaniem plików", ToastAndroid.SHORT);
  }
}
/**
 * Funkcja usuwająca ścieżkę z bazy oraz chmury
 * @export
 * @param {string} webId id ścieżki
 * @category firebase
 */
export async function deleteMapWeb(webId: string) {
  const docref = Pathes.doc(webId);
  let doc = await docref.get();
  if (!doc.exists) return;

  await deleteFile(stor.ref(doc.data().storeRef));
  if (doc.data().iconRef !== undefined && doc.data().iconRef !== "") {
    const iconRef = stor.refFromURL(doc.data().iconRef);
    await deleteFile(iconRef);
  }
  if (doc.data().previewRef !== undefined && doc.data().previewRef !== "") {
    const previewRef = stor.refFromURL(doc.data().previewRef);
    await deleteFile(previewRef);
  }

  await docref.delete();
}
/**
 * Funkcja dodająca ocenę do ścieżki
 * @export
 * @param {RatingDocument} rating ocena
 * @category firebase
 */
export async function addRating(rating: RatingDocument) {
  const doc = await db.collection("Ratings").add(rating);
}
/**
 * Funkcja zmieniająca widoczność ścieżki
 * @export
 * @param {string} mapId id ścieżki
 * @param {boolean} isPrivate czy jest prywatna
 * @category firebase
 */
export async function togglePrivate(mapId: string, isPrivate: boolean) {
  await Pathes.doc(mapId).set(
    {
      visibility: isPrivate ? "private" : "public",
    },
    { merge: true }
  );
  const doc = await Pathes.doc(mapId).get();
  const task = stor.ref(doc.data().storeRef).updateMetadata({
    customMetadata: { visibility: isPrivate ? "private" : "public" },
  });

  task.then((res) => {});
}
