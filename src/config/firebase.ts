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
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

export interface MapDocument {
  id?: string;
  ownerId: string;
  ownerName: string;
  description: string;
  name: string;
  rating: number;
  ratingCount: number;
  distance: number;
  location: string;
  visibility: "public" | "private";
  storeRef: string;
  previewRef: string;
  iconRef: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  lastEditedAt?: FirebaseFirestoreTypes.Timestamp;
}
export interface RatingDocument {
  id?: string;
  pathRef: string;
  pathOwnerId: string;
  rating: number;
  comment: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  userId: string;
  userName: string;
}

// Initialize Firebase
const signinApp = initializeApp(firebaseConfig);
GoogleSignin.configure({
  webClientId: "***REMOVED***-hnrvujupc8dlvnkro5nslrobk7m2bdbk.apps.googleusercontent.com",
});

export const stor = firebase.storage();
// set the host and the port property to connect to the emulator
// set these before any read/write operations occur to ensure it doesn't affect your Cloud Firestore data!
// if (__DEV__) {
//   firestore().useEmulator("localhost", 8081);
//   firebase.storage().useEmulator("localhost", 9199);
//   console.log("elo firebase devmode");
// }

export const db = firestore();

export const Pathes = db.collection("Pathes");
export const Users = db.collection("Users");
export const DbUser = () => firebase.auth().currentUser?.uid;
db.settings({ persistence: false });

async function deleteCollection(collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy("__name__").limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

export async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

export const addMap = async (map: MapDocument, webId: string = undefined) => {
  let doc = null;
  let id = "";
  console.log(map);

  if (webId === undefined) {
    console.log("elo");

    doc = await Pathes.add(map);
    id = doc.id;
  } else {
    await Pathes.doc(webId).set(map);
    doc = map;
    id = webId;
    doc["id"] = webId;
  }
  console.log(id);

  const userId = firebase.auth().currentUser?.uid;
  const user = await Users.doc(userId).get();
  console.log(user.data());
  if (user.data()?.maps.length >= 20) throw new Error("You have reached the limit of 20 maps");
  await Users.doc(userId).set(
    {
      maps: firestore.FieldValue.arrayUnion(id),
    },
    { merge: true }
  );
  console.log("na pewno nie wulgarne słowo");
  return id;
};

async function deleteFile(fileRef) {
  try {
    await fileRef.delete();
    console.log("File deleted successfully");
  } catch (error) {
    if (error.code === "storage/object-not-found") {
      console.log("File not found");
    } else {
      console.log("Error deleting file:", error);
    }
  }
}

export const deleteMapWeb = async (webId: string) => {
  const docref = Pathes.doc(webId);
  let doc = await docref.get();
  if (!doc.exists) return;
  await deleteFile(stor.ref(doc.data().storeRef));
  if (!__DEV__) {
    const iconRef = stor.refFromURL(doc.data().iconRef);
    const previewRef = stor.refFromURL(doc.data().previewRef);
    await deleteFile(iconRef);
    await deleteFile(previewRef);
  }
  await docref.delete();
  console.log("deleted", docref.path);
};

export const addRating = async (rating: RatingDocument) => {
  const doc = await db.collection("Ratings").add(rating);
  console.log(doc);
};

export const togglePrivate = async (mapId: string, isPrivate: boolean) => {
  await Pathes.doc(mapId).set(
    {
      visibility: isPrivate ? "private" : "public",
    },
    { merge: true }
  );
  const doc = await Pathes.doc(mapId).get();
  // console.log(doc.data(), isPrivate, doc.data().storeRef);
  const task = stor.ref(doc.data().storeRef).updateMetadata({
    customMetadata: { visibility: isPrivate ? "private" : "public" },
  });

  task.then((res) => {
    console.log(res, isPrivate ? "private" : "public");
  });
};
