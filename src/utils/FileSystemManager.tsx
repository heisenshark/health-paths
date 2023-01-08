import * as fs from "expo-file-system";
import Waypoint, { HealthPath, MediaFile } from "./interfaces";
import { cloneDeep } from "lodash";
import { copyAsync } from "expo-file-system";
import { mediaFiles } from "../providedfiles/Export";
import { zip, unzip, unzipAssets, subscribe } from "react-native-zip-archive";
import { firebase } from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";

import { useUserStore } from "./../stores/store";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { db, stor, addMap, MapDocument, Pathes } from "../config/firebase";
import { calculateDistance } from "./HelperFunctions";
import { DbUser } from "./../config/firebase";
import uuid from "react-native-uuid";
const mapDir = fs.documentDirectory + "Maps/"; ///data/data/com.anonymous.healthpathes/files
const cacheDir = fs.cacheDirectory + "Maps/"; ///data/data/com.anonymous.healthpathes/cache
// Checks if gif directory exists. If not, creates it

/*
Map "testmap" 
  Audio/ 
  Image/
  waypoints.json
  mapInfo.json
  media_files.json
  features."testmap".geojson
  features_"testmap"_lines.geojson
*/
export {
  ensureMapDirExists,
  saveMap,
  listAllMaps,
  loadMap,
  deleteMap,
  UploadMapFolder as zipUploadMapFolder,
  cloudCheck,
  downloadMap,
  moveMap,
};

interface DownloadTrackerRecord {
  mapId: string;
  webId: string;
  downloadDate: FirebaseFirestoreTypes.Timestamp;
}

type DownloadTracker = {
  [id: string]: DownloadTrackerRecord;
};

//TODO upewnić się żeby Maps dir istniało jeśli mamy z niego ładować mapę
//TODO zrobić tak aby można było ustawić prywatność przed uploadem mapy
//TODO upewnić się że na pewno usuwamy pliki po edycji mapki takie jak zdjęcia które zostały zedytowane itp

const getNameFromUri = (uri: string) => {
  if (!uri) return undefined;
  if (uri.endsWith("/")) {
    uri = uri.substring(0, uri.length - 1);
  }
  if (uri.indexOf("/") === -1) {
    return uri;
  }
  return uri.substring(uri.lastIndexOf("/") + 1);
};

export function getURI(map: HealthPath, media: MediaFile) {
  if (!media) return undefined;
  if (media.storage_type === "cache") return media.path;
  return `${mapDir}_${map.map_id}/${media.path}`;
}
async function ensureMapDirExists() {
  const dirInfo = await fs.getInfoAsync(mapDir);
  console.log(dirInfo);
  if (!dirInfo.exists) {
    console.log("Map directory doesn't exist, creating...");
    await fs.makeDirectoryAsync(mapDir, { intermediates: true });
  }
  // const files = await fs.readDirectoryAsync(mapDir);
  // console.log(`Files inside ${mapDir}:\n\n${JSON.stringify(files)}`);
}

async function createIfNotExists(path: string) {
  const dirInfo = await fs.getInfoAsync(path);
  // console.log(dirInfo);
  if (!dirInfo.exists || !dirInfo.isDirectory) {
    // console.log("Map directory doesn't exist, creating...");
    await fs.makeDirectoryAsync(path);
  }
}
async function writeToFile(path: string, data: string = "") {
  const fileInfo = await fs.getInfoAsync(path);
  // console.log(fileInfo);
  const aaaa = fs.writeAsStringAsync(path, data);
  // console.log(aaaa);
}

async function copyExistingFileToMedia(file: MediaFile, mapNameDir: string, path: string) {
  if (file === undefined || !file || file.media_id === undefined || file.path === undefined)
    return undefined;
  console.log("copyExistingFileToMedia 1 ", file);
  console.log(file, mapNameDir, path);

  if (file.storage_type === "local") return file;

  const newPlace = mapNameDir + path + getNameFromUri(file.path);
  try {
    fs.copyAsync({
      from: file.path,
      to: newPlace,
    });
    file.path = path + getNameFromUri(file.path);
    file.storage_type = "local";
    return file;
  } catch (error) {
    console.error(error);
    return;
  }
}

async function checkExistanceOfMedia(stop: Waypoint, mapNameDir: string) {
  const checkOne = async (p: string) => {
    if (p === undefined) return undefined;
    return await fs.getInfoAsync(p);
  };
  if (stop.introduction_audio) {
    const introPath =
      stop.introduction_audio.storage_type === "local"
        ? mapNameDir + stop.introduction_audio.path
        : stop.introduction_audio?.path;
    console.log(introPath);

    const intro = await checkOne(introPath);
    if (intro && !intro.exists) {
      stop.introduction_audio.path = undefined;
    }
  }
  if (stop.navigation_audio) {
    const navPath =
      stop.navigation_audio.storage_type === "local"
        ? mapNameDir + stop.navigation_audio.path
        : stop.navigation_audio?.path;
    console.log(navPath);
    const nav = await checkOne(navPath);
    if (nav && !nav.exists) {
      stop.navigation_audio.path = undefined;
    }
  }
  if (stop.image) {
    const imageCoverPath =
      stop.image.storage_type === "local" ? mapNameDir + stop.image.path : stop.image?.path;
    console.log(imageCoverPath);
    const imageCover = await checkOne(imageCoverPath);
    if (stop && !imageCover.exists) {
      stop.image.path = undefined;
    }
  }
}

async function copycachedMedia(stop: Waypoint, mapNameDir: string): Promise<MediaFile[]> {
  let medias = [];
  const a = await copyExistingFileToMedia(stop.image, mapNameDir, "images/covers/");
  a !== undefined && medias.push(a);
  const b = await copyExistingFileToMedia(
    stop.introduction_audio,
    mapNameDir,
    "audios/introductions/"
  );
  b !== undefined && medias.push(b);
  const c = await copyExistingFileToMedia(stop.navigation_audio, mapNameDir, "audios/navigations/");
  c !== undefined && medias.push(c);
  return medias;
}
async function saveMap(map: HealthPath) {
  const foldername = `_${map.map_id}`;
  const mapNameDir = `${mapDir}${foldername}/`;
  const dirInfo = await fs.getInfoAsync(mapNameDir);
  const currentUser = await GoogleSignin.getCurrentUser();
  console.log(dirInfo);
  let existingInfo = undefined;
  if (!dirInfo.exists) {
    console.log(`Mapdirectory ${map} doesn't exist, creating...`);
    await fs.makeDirectoryAsync(mapNameDir, { intermediates: true });
  } else {
    existingInfo = await loadMapInfo(map.map_id);
  }
  console.log("map::: ", map);

  createIfNotExists(mapNameDir + "audios/");
  // createIfNotExists(mapNameDir + "images/");
  // createIfNotExists(mapNameDir + "images/covers/"); //clear this dir
  // createIfNotExists(mapNameDir + "audios/introductions/"); //clear this dir
  // createIfNotExists(mapNameDir + "audios/navigations/"); //clear this dir
  // createIfNotExists(mapNameDir + "Video/");

  //Obliczanie dystansu ścieżki
  if (map.distance === undefined) {
    map.distance = calculateDistance(map.path);
    console.log(map.distance);
  }

  const webFields = {};
  if (DbUser() !== undefined) {
    webFields["authorId"] = DbUser();
    webFields["authorName"] = await currentUser.user.name;
    if (existingInfo != undefined) webFields["webId"] = map.webId;
  }

  const mapInfo = {
    name: map.name,
    map_id: map.map_id,
    imagePreview: map.imagePreview,
    imageIcon: map.imageIcon,
    description: map.description,
    location: map.location,
    duration: map.duration,
    distance: map.distance,
    waypoints: [...map.waypoints],
    ...webFields,
  } as HealthPath;

  const lines = {
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [...map.path.map((x) => [x.longitude, x.latitude])],
          type: "LineString",
        },
        id: "14d9170c556c7f5206dd8a3eb57b0915",
      },
    ],
  };
  const waypoints = [
    ...map.stops.map((x) => ({
      ...x,
      coordinates: [x.coordinates.longitude, x.coordinates.latitude],
      image: x.image?.media_id,
      introduction_audio: x.introduction_audio?.media_id,
      navigation_audio: x.navigation_audio?.media_id,
    })),
  ];

  const features = {
    features: [
      ...waypoints.map((x, index) => ({
        type: "Feature",
        properties: {
          [index]: x.waypoint_id,
        },
        geometry: {
          coordinates: x.coordinates,
          type: "Point",
        },
        id: index,
      })),
    ],
  };

  const urban = {
    path_id: map.map_id,
    path_icon: map.imageIcon?.media_id, //wrok on it
    displayed_name: map.name,
    approximate_distance_in_meters: map.distance * 1000, //HACK elo to powinno być zawsze w metrach tbh
    is_cyclic: false,
    map_url: "mapbox://styles/polslrau6/cl4fw1x8i001t14lih34jtkhz",
    waypoints: [...waypoints.map((x) => x.waypoint_id)],
    preview_image: map.imagePreview.media_id, //wrok on it
    icon: map.imageIcon?.media_id, //wrok on it
  };

  let medias = [] as MediaFile[];

  try {
    for (const stop of map.stops) {
      console.log(stop);

      await checkExistanceOfMedia(stop, mapNameDir);
    }

    for (const stop of map.stops) {
      medias = [...medias, ...(await copycachedMedia(stop, mapNameDir))];
    }
    console.log("icon preview ", map.imageIcon, map.imagePreview);

    const preview = await copyExistingFileToMedia(map.imagePreview, mapNameDir, "images/previews/");
    if (preview) medias.push(preview);
    const icon = await copyExistingFileToMedia(map.imageIcon, mapNameDir, "images/icons/");
    if (icon) medias.push(icon);
  } catch (error) {
    console.error("error", error);
  }

  console.log(medias);

  console.log("mapid::" + map.map_id);
  await writeToFile(mapNameDir + "mapInfo.json", JSON.stringify(mapInfo));
  await writeToFile(mapNameDir + "features_" + map.name + "_lines.geojson", JSON.stringify(lines));
  await writeToFile(
    mapNameDir + "features.geojson_" + map.name + ".geojson",
    JSON.stringify(features)
  );
  await writeToFile(mapNameDir + "waypoints.json", JSON.stringify(waypoints));
  await writeToFile(mapNameDir + "media_files.json", JSON.stringify(medias));
  await writeToFile(mapNameDir + "urban_paths.json", JSON.stringify(urban));
  clearMapDir(map);
  //[x] write code that clears the rest of files in mapdir, to stop local storage from leaking

  return mapNameDir;
}

async function loadMap(name: string, id: string): Promise<HealthPath> {
  const mapNameDir = `${mapDir}_${id}/`;
  const mapInfo = await fs.readAsStringAsync(mapNameDir + "mapInfo.json");
  console.log(mapInfo);
  const map = JSON.parse(mapInfo) as HealthPath;
  const lines = await fs.readAsStringAsync(mapNameDir + "features_" + map.name + "_lines.geojson");
  console.log(lines);
  map.path = JSON.parse(lines).features[0].geometry.coordinates;
  map.path = map.path.map((x) => ({ latitude: x[1], longitude: x[0] }));
  const waypoints = await fs.readAsStringAsync(mapNameDir + "waypoints.json");
  console.log(waypoints);
  map.stops = JSON.parse(waypoints);
  map.stops.forEach((x) => {
    x.coordinates = { latitude: x.coordinates[1], longitude: x.coordinates[0] };
  });
  const mediaFiles = await fs.readAsStringAsync(mapNameDir + "media_files.json");
  let mf = JSON.parse(mediaFiles);
  console.log("media dilsdf:  " + mf);
  console.log(mediaFiles);
  let mediaMap = new Map();
  mf.map((n) => {
    mediaMap.set(n.media_id, n);
  });

  console.log(mediaMap);
  map.stops.forEach((x) => {
    x.image = mediaMap.get(x.image);
    x.introduction_audio = mediaMap.get(x.introduction_audio);
    x.navigation_audio = mediaMap.get(x.navigation_audio);
  });
  console.log(map);
  return map;
}

async function loadMapInfo(id: string): Promise<HealthPath> {
  try {
    const mapNameDir = `${mapDir}_${id}/`;
    const mapInfo = await fs.readAsStringAsync(mapNameDir + "mapInfo.json");
    return JSON.parse(mapInfo) as HealthPath;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function loadMapInfoDir(id: string): Promise<HealthPath> {
  const mapNameDir = `${mapDir}${id}/`;
  const mapInfo = await fs.readAsStringAsync(mapNameDir + "mapInfo.json");
  return JSON.parse(mapInfo) as HealthPath;
}

async function moveMap(id: string, idTo: string) {
  const mapNameDir = `${mapDir}_${id}/`;
  const info = await loadMapInfo(id);
  info.map_id = idTo;
  const desiredMapNameDir = `${mapDir}_${idTo}/`;
  const dirInfo = await fs.getInfoAsync(mapNameDir);
  if (!dirInfo.exists) return;
  await fs.moveAsync({ from: mapNameDir, to: desiredMapNameDir });
  await saveMapInfo(info, idTo);
}

async function saveMapInfo(data: HealthPath, id: string): Promise<boolean> {
  try {
    const mapNameDir = `${mapDir}_${id}/`;
    await writeToFile(mapNameDir + "mapInfo.json", JSON.stringify(data));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function deleteMap(id: string) {
  const mapNameDir = `${mapDir}_${id}/`;
  await fs.deleteAsync(mapNameDir);
}

async function UploadMapFolder(id: string) {
  const mapNameDir = `${mapDir}_${id}/`;
  const target = `${cacheDir}_${id}.zip`;
  try {
    const mapinfo = await loadMapInfo(id);
    const user = await GoogleSignin.getCurrentUser();
    // console.log(user.user.);
    mapinfo.authorId = DbUser();
    mapinfo.authorName = user.user.name;
    console.log(mapinfo);
    const preview = getURI(mapinfo, mapinfo.imagePreview);
    const icon = getURI(mapinfo, mapinfo.imageIcon);

    saveMapInfo({ ...mapinfo }, id);

    const dirInfo = await fs.getInfoAsync(cacheDir);
    console.log(dirInfo);
    if (!dirInfo.exists) {
      console.log("Cache directory doesn't exist, creating...");
      await fs.makeDirectoryAsync(cacheDir, { intermediates: true });
    }

    const zipPath = await zip(mapNameDir, target);
    console.log("zipUploadMapPath", zipPath);
    console.log(DbUser(), mapinfo);

    const stor = firebase.storage();
    // stor.getActiveUploadTasks();
    const reference = stor.ref(`Maps/${DbUser()}/_${id}`);
    const task = reference.putFile(zipPath, {
      cacheControl: "no-store", // disable caching
      customMetadata: { visibility: "public" },
    });
    task.on("state_changed", (taskSnapshot) => {
      console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
    });
    task.then(() => {
      console.log("Image uploaded to the bucket!");
    });
    task.catch((e) => {
      console.log(e);
    });
    let iconURL = undefined;
    let previewURL = undefined;
    if (icon) {
      const iconRef = stor.ref(`Maps/${DbUser()}/icons/_${id}_icon`);
      const iconTask = await iconRef.putFile(icon, {
        cacheControl: "no-store", // disable caching
      });
      iconURL = await iconRef.getDownloadURL();
    }
    if (preview) {
      const previewRef = stor.ref(`Maps/${DbUser()}/previews/_${id}_icon`);
      const previewTask = await previewRef.putFile(preview, {
        cacheControl: "no-store", // disable caching
      });
      previewURL = await previewRef.getDownloadURL();
    }

    if (mapinfo.distance === undefined) {
      mapinfo.distance = 0;
      console.log("somehow map distance is 0");
    }

    const data = {
      ownerId: DbUser(),
      ownerName: user.user.name,
      description: mapinfo.description,
      name: mapinfo.name,
      rating: 0,
      ratingCount: 0,
      distance: mapinfo.distance,
      visibility: "public",
      iconRef: iconURL,
      previewRef: previewURL,
      storeRef: reference.fullPath,
      location: mapinfo.location,
      createdAt: firestore.FieldValue.serverTimestamp(),
    } as MapDocument;

    console.log(data);
    const doc = await addMap(data);
    await saveMapInfo({ ...mapinfo, webId: doc.id }, id);
  } catch (err) {
    console.log(err);
    return;
  }
}

async function listAllMaps(): Promise<HealthPath[]> {
  const dirInfo = await fs.getInfoAsync(mapDir);
  if (!dirInfo.exists) return [];
  const files = await fs.readDirectoryAsync(mapDir);
  // console.log(`Files inside ${mapDir}:\n\n${JSON.stringify(files)}`);
  let maps = [];
  for (const file of files) {
    const fileInfo = await fs.getInfoAsync(mapDir + file);
    if (!fileInfo.isDirectory) continue;
    const mapInfo = await fs.readAsStringAsync(mapDir + file + "/mapInfo.json");
    // console.log(mapInfo);
    maps.push(JSON.parse(mapInfo) as HealthPath);
  }
  // console.log(maps);

  return maps;
}

async function createDownloadTracker() {
  const dirInfo = await fs.getInfoAsync(mapDir);
  console.log(dirInfo);
  if (!dirInfo.exists) {
    console.log("Cache directory doesn't exist, creating...");
    await fs.makeDirectoryAsync(mapDir, { intermediates: true });
  }
  const target = `${mapDir}downloadTracker.json`;
  const fileInfo = await fs.getInfoAsync(target);
  // console.log(fileInfo);
  if (!fileInfo.exists) {
    // console.log("downloadTracker.json doesn't exist, creating...");
    await fs.writeAsStringAsync(target, JSON.stringify({}));
  }
}

async function saveDownloadTracker(xd: { [id: string]: DownloadTrackerRecord }) {
  const target = `${mapDir}downloadTracker.json`;
  await createDownloadTracker();
  await fs.writeAsStringAsync(target, JSON.stringify(xd));
}
async function loadDownloadTracker() {
  const target = `${mapDir}downloadTracker.json`;
  await createDownloadTracker();
  const data = await fs.readAsStringAsync(target);
  return JSON.parse(data) as DownloadTracker;
}

async function downloadMap(map: MapDocument) {
  if (map.id === undefined) return;
  const tracker = (await loadDownloadTracker()) as DownloadTracker;
  const reference = stor.ref(map.storeRef);
  let refName = reference.name;
  console.log(map, refName);
  let mapNameDir = `${mapDir}${refName}/`;
  const dirInfo = await fs.getInfoAsync(mapNameDir);
  const altId = uuid.v4().toString();
  let isUpdate = false;
  if (dirInfo.exists) {
    console.log("Map already exists");
    const existingInfo = await loadMapInfoDir(refName);
    console.log(existingInfo);

    if (map.id === existingInfo.webId) {
      console.log("updating...");
      isUpdate = true;
      console.log("aaaaaaaa", altId);
    } else [refName, mapNameDir] = [`_${altId}`, `${mapDir}_${altId}/`];
  }
  const path = `${cacheDir}${refName}.zip`;
  const uri = await reference.getDownloadURL();
  await fs.downloadAsync(uri, path);
  await unzip(path, mapNameDir);
  await fs.deleteAsync(path);

  const mapInfo = await loadMapInfoDir(refName);
  console.log("dupa");

  if (!isUpdate && dirInfo.exists) mapInfo.map_id = altId;
  mapInfo.webId = map.id;
  saveMapInfo(mapInfo, refName.substring(1));
  tracker[map.id] = {
    mapId: mapInfo.map_id,
    webId: map.id,
    downloadDate: firestore.Timestamp.now(),
  };

  console.log(tracker);
  await saveDownloadTracker(tracker);
}

async function cloudCheck(id: string) {
  const user = DbUser();
  console.log(user);

  const reference = stor.ref(`Maps/${user}/_${id}/test`);
  const task = reference.putString("test");
  task.on("state_changed", (taskSnapshot) => {
    console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
  });

  task.then(() => {
    console.log("Image uploaded to the bucket!");
  });

  task.catch((e) => {
    console.log(e);
  });
  setTimeout(() => {
    console.log("task cancelled");
    task.cancel();
  }, 3000);
}

async function deleteUnwantedFiles(directory: string, allowedNames: string[]) {
  // Get a list of all the files in the directory

  const info = await fs.getInfoAsync(directory);
  if (!info.exists) return;
  const results = await fs.readDirectoryAsync(directory);

  // Filter the list of files to keep only those with disallowed names
  const filesToDelete = results.filter((name) => !allowedNames.includes(name));

  // Delete the unwanted files
  for (const file of filesToDelete) {
    await fs.deleteAsync(`${directory}/${file}`);
  }
}

async function clearMapDir(map: HealthPath) {
  const foldername = `_${map.map_id}`;
  const mapNameDir = `${mapDir}${foldername}/`;
  const dirInfo = await fs.getInfoAsync(mapNameDir);
  if (!dirInfo.exists) return;

  const wantedRoot = [
    "features_" + map.name + "_lines.geojson",
    "features.geojson_" + map.name + ".geojson",
    "images",
    "audios",
    "mapInfo.json",
    "waypoints.json",
    "urban_paths.json",
    "media_files.json",
  ];
  const intros = [];
  const navs = [];
  const stopImages = [];

  for (const a of map.stops) {
    intros.push(getNameFromUri(a.introduction_audio.path));
    navs.push(getNameFromUri(a.navigation_audio.path));
    stopImages.push(getNameFromUri(a.image.path));
  }
  deleteUnwantedFiles(mapNameDir + "audios/introductions", intros);
  deleteUnwantedFiles(mapNameDir + "audios/navigations", navs);
  deleteUnwantedFiles(mapNameDir + "images/covers", stopImages);
  deleteUnwantedFiles(mapNameDir + "images/previews", [getNameFromUri(map.imagePreview?.path)]);
  deleteUnwantedFiles(mapNameDir + "images/icons", [getNameFromUri(map.imageIcon?.path)]);
  deleteUnwantedFiles(mapNameDir, wantedRoot);
}
