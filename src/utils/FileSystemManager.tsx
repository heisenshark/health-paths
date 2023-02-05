import * as fs from "expo-file-system";
import { Waypoint, HealthPath, MediaFile } from "./interfaces";
import { cloneDeep } from "lodash";
import { copyAsync } from "expo-file-system";
import { zip, unzip, unzipAssets, subscribe } from "react-native-zip-archive";
import { firebase } from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import { loadMapInfo, loadMapInfoDir } from "./MapInfoLoader";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { db, stor, addPath, MapDocument, Pathes, Users } from "../config/firebase";
import { calculateDistance } from "./HelperFunctions";
import { DbUser } from "./../config/firebase";
import uuid from "react-native-uuid";
import { ToastAndroid } from "react-native";
import Rating from "../components/Rating";
import { useDownloadTrackingStore } from "../stores/DownloadTrackingStore";
const mapDir = fs.documentDirectory + "Maps/";
const cacheDir = fs.cacheDirectory + "Maps/";
export {
  ensureMapDirExists,
  saveMap,
  listAllMaps,
  loadMap,
  deleteMap,
  UploadMapFolder as zipUploadMapFolder,
  downloadMap,
  moveMap,
  loadMapInfo,
};
/**
 *Funkcja zwracająca nazwę pliku z URI
 * @category System plików
 * @param {string} uri
 * @return {*}
 */
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
/**
 * Funkcja zwracająca ścieżkę do pliku multimedialnego z URI
 * @category System plików
 * @export
 * @param {HealthPath} map mapa pliku
 * @param {MediaFile} media plik multimedialny
 * @return {(string | undefined)} zwraca ścieżkę do pliku albo undefined jeśli nie istnieje
 */
export function getURI(map: HealthPath, media: MediaFile): string | undefined {
  if (!media) return undefined;
  if (media.storage_type === "cache") return media.path;
  return `${mapDir}_${map.map_id}/${media.path}`;
}
async function ensureMapDirExists() {
  await createIfNotExists(mapDir, { isFile: false });
}

/**
 * Funkcja Tworząca plik lub folder jeśli nie istnieje
 * @category System plików
 * @param {string} path ścieżka do pliku lub folderu
 * @param {*} [{ isFile = false, content = "" }={ isFile: false }] czy plik czy folder, jeśli to plik to zawartość
 * @return {*} zwraca informacje o utworzonym lub istniejącym pliku/folderze
 */
async function createIfNotExists(
  path: string,
  { isFile = false, content = "" }: { isFile: boolean; content?: string } = { isFile: false }
) {
  const info = await fs.getInfoAsync(path);
  if (info.exists) return info;

  if (isFile) {
    await fs.writeAsStringAsync(path, content);
  } else await fs.makeDirectoryAsync(path, { intermediates: true });
  return await fs.getInfoAsync(path);
}
/**
 * Funkcja zapisująca tekst do pliku
 * @category System plików
 * @param {string} path ścieżka do pliku
 * @param {string} [data=""] tekst do zapisania
 */
async function writeToFile(path: string, data: string = "") {
  const aaaa = await fs.writeAsStringAsync(path, data);
}
/**
 * Funkcja przenosząca istniejący plik multimedialny do lokalnego miejsca zapisu mapy
 * @category System plików
 * @param {MediaFile} file plik multimedialny
 * @param {string} mapNameDir ścieżka do folderu mapy
 * @param {string} path ścieżka do folderu w którym ma być przeniesiony plik
 * @return {*}
 */
async function copyExistingFileToMedia(file: MediaFile, mapNameDir: string, path: string) {
  if (!file || file.media_id === undefined || file.path === undefined) return undefined;

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
/**
 * Funkcja sprawdzająca czy pliki multimedialne w danym punkcie stopu istnieją
 * @category System plików
 * @param {Waypoint} stop punkt stopu
 * @param {string} mapNameDir ścieżka do folderu mapy
 */
async function checkExistanceOfMedia(stop: Waypoint, mapNameDir: string) {
  const checkMedia = async (med: MediaFile) => {
    if (med) {
      const p = med.storage_type === "local" ? mapNameDir + med.path : med.path;
      if (p === undefined) return;
      const exist = await fs.getInfoAsync(p);
      if (exist && !exist.exists) med.path = undefined;
    }
  };
  [stop.introduction_audio, stop.navigation_audio, stop.image].forEach(async (med) => {
    await checkMedia(med);
  });
}
/**
 * Funkcja kopiująca istniejące pliki multimedialne do lokalnego miejsca zapisu mapy
 * @category System plików
 * @param {Waypoint} stop punkt stopu
 * @param {string} mapNameDir ścieżka do folderu mapy
 * @return {MediaFile[]}  {Promise<MediaFile[]>} zwraca tablicę z plikami multimedialnymi
 */
async function copycachedMedia(stop: Waypoint, mapNameDir: string): Promise<MediaFile[]> {
  let medias = [];
  const elo: [MediaFile, string][] = [
    [stop.introduction_audio, "audios/introductions/"],
    [stop.navigation_audio, "audios/navigations/"],
    [stop.image, "images/covers/"],
  ];
  for (const [media, path] of elo)
    (await copyExistingFileToMedia(media, mapNameDir, path)) && medias.push(media);
  return medias;
}
/**
 * Funkcja zapisująca mapę do lokalnego miejsca zapisu mapy
 * @category System plików
 * @param {HealthPath} map mapa
 * @return {*}
 */
async function saveMap(map: HealthPath) {
  const foldername = `_${map.map_id}`;
  const mapNameDir = `${mapDir}${foldername}/`;
  const dirInfo = await createIfNotExists(mapNameDir, { isFile: false });
  const currentUser = await GoogleSignin.getCurrentUser();
  const isUserLogged = DbUser() !== undefined;

  let existingInfo = await loadMapInfo(map.map_id);

  //Obliczanie dystansu ścieżki
  if (map.distance === undefined) {
    map.distance = calculateDistance(map.path);
  }

  const webFields = {};
  if (isUserLogged) {
    webFields["authorId"] = DbUser();
    webFields["authorName"] = await currentUser.user.name;
    if (existingInfo !== undefined) webFields["webId"] = map.webId;
  }

  const mapInfo = {
    name: map.name,
    map_id: map.map_id,
    imagePreview: map.imagePreview,
    imageIcon: map.imageIcon,
    description: map.description,
    location: map.location,
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
    path_icon: map.imageIcon?.media_id,
    displayed_name: map.name,
    approximate_distance_in_meters: map.distance, 
    is_cyclic: false,
    map_url: "mapbox://styles/polslrau6/cl4fw1x8i001t14lih34jtkhz",
    waypoints: [...waypoints.map((x) => x.waypoint_id)],
    preview_image: map.imagePreview.media_id, //wrok on it
    icon: map.imageIcon?.media_id, //wrok on it
  };

  let medias = [] as MediaFile[];

  try {
    for (const stop of map.stops) {
      await checkExistanceOfMedia(stop, mapNameDir);
    }

    for (const stop of map.stops) {
      medias = [...medias, ...(await copycachedMedia(stop, mapNameDir))];
    }

    const preview = await copyExistingFileToMedia(map.imagePreview, mapNameDir, "images/previews/");
    if (preview) medias.push(preview);
    const icon = await copyExistingFileToMedia(map.imageIcon, mapNameDir, "images/icons/");
    if (icon) medias.push(icon);
  } catch (error) {
    console.error("error", error);
  }

  //

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
  return mapNameDir;
}

/**
 * Funkcja wczytująca mapę z lokalnego miejsca zapisu mapy
 * @category System plików
 * @param {string} name nazwa mapy
 * @param {string} id id mapy
 * @returns {Promise<HealthPath>} obiekt mapy
 * @async
 */
async function loadMap(name: string, id: string): Promise<HealthPath> {
  const mapNameDir = `${mapDir}_${id}/`;
  const mapInfo = await fs.readAsStringAsync(mapNameDir + "mapInfo.json");

  const map = JSON.parse(mapInfo) as HealthPath;
  const lines = await fs.readAsStringAsync(mapNameDir + "features_" + map.name + "_lines.geojson");

  map.path = JSON.parse(lines).features[0].geometry.coordinates;
  map.path = map.path.map((x) => ({ latitude: x[1], longitude: x[0] }));
  const waypoints = await fs.readAsStringAsync(mapNameDir + "waypoints.json");

  map.stops = JSON.parse(waypoints);
  map.stops.forEach((x) => {
    x.coordinates = { latitude: x.coordinates[1], longitude: x.coordinates[0] };
  });
  const mediaFiles = await fs.readAsStringAsync(mapNameDir + "media_files.json");
  let mf = JSON.parse(mediaFiles);

  let mediaMap = new Map();
  mf.map((n) => {
    mediaMap.set(n.media_id, n);
  });

  map.stops.forEach((x) => {
    x.image = mediaMap.get(x.image);
    x.introduction_audio = mediaMap.get(x.introduction_audio);
    x.navigation_audio = mediaMap.get(x.navigation_audio);
  });

  return map;
}
/*
@category System plików*
 * Funkcja zmieniająca id ścieżki
 * @param {string} id id ścieżki
 * @param {string} idTo id ścieżki po zmianie
 */
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
/*
@category System plików*
 * Funkcja zapisująca informacje o ścieżce w pliku mapInfo.json
 * @param {HealthPath} data
 * @param {string} id
 * @return {*}  {Promise<boolean>}
 */
async function saveMapInfo(data: HealthPath, id: string): Promise<boolean> {
  try {
    const mapNameDir = `${mapDir}_${id}/`;
    await writeToFile(mapNameDir + "mapInfo.json", JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}
/*
@category System plików*
 * Funkcja usuwająca ścieżkę z lokalnego miejsca zapisu mapy
 * @param {string} id id ścieżki
 */
async function deleteMap(id: string) {
  const mapNameDir = `${mapDir}_${id}/`;
  const info = await loadMapInfo(id);
  if (info.webId) {
    const entry = useDownloadTrackingStore.getState().downloadTracker[info.webId];
    if (entry) useDownloadTrackingStore.getState().deleteRecord(info.webId);
  }
  await fs.deleteAsync(mapNameDir);
}
/**
 * Funkcja przesyłająca ścieżkę do chmury
 * @category System plików
 * @param {string} id lokalne id ścieżki
 * @param {("public" | "private")} [privacy="public"] prywatność ścieżki
 * @return {*}  {Promise<boolean>}
 */
async function UploadMapFolder(
  id: string,
  privacy: "public" | "private" = "public"
): Promise<boolean> {
  let mapNameDir = `${mapDir}_${id}/`;
  let target = `${cacheDir}_${id}.zip`;

  try {
    let mapinfo = await loadMapInfo(id);
    //Tutaj jest kawałek kodu odopowiadający za sprawdzenie wlasciciela mapy
    //jeśli właścicielem jest użytkownik uploadujący mapę to updateujemy ją
    //jeśli nie to tworzymy nową mapę i uploadujemy
    //jeśli nie ma webId to zakładamy że wszystko ok

    let isPresentInWeb = mapinfo.webId !== undefined;
    let createNewInstance = true;
    if (isPresentInWeb) {
      const m = await Pathes.doc(mapinfo.webId).get();
      if (!m.exists) isPresentInWeb = false;
      else {
        const md = m.data() as MapDocument;
        if (md && md.ownerId === DbUser()) {
          createNewInstance = false;
        }
      }
    }

    //przeniesienie mapy pod nowe ID oraz zmiana ID webowego
    if (createNewInstance && isPresentInWeb) {
      const newId = uuid.v4().toString();
      await moveMap(id, newId);
      id = newId;
      mapinfo = await loadMapInfo(id);

      mapNameDir = `${mapDir}_${id}/`;
      target = `${cacheDir}_${id}.zip`;
      if (mapinfo.webId !== undefined) mapinfo.webId = undefined;
    }

    const user = await GoogleSignin.getCurrentUser();
    mapinfo.authorId = DbUser();
    mapinfo.authorName = user.user.name;

    const preview = getURI(mapinfo, mapinfo.imagePreview);
    const icon = getURI(mapinfo, mapinfo.imageIcon);

    saveMapInfo({ ...mapinfo }, id);

    const dirInfo = await createIfNotExists(cacheDir, { isFile: false });

    const zipPath = await zip(mapNameDir, target);

    const u = Users.doc(DbUser()).get();

    const stor = firebase.storage();
    // stor.getActiveUploadTasks();
    const reference = stor.ref(`Maps/${DbUser()}/_${id}`);
    const task = reference.putFile(zipPath, {
      cacheControl: "no-store",
      customMetadata: { visibility: privacy },
    });
    await task;

    let iconURL = undefined;
    let previewURL = undefined;
    if (icon) {
      const iconRef = stor.ref(`Maps/${DbUser()}/icons/_${id}_icon`);
      await iconRef.putFile(icon, {
        cacheControl: "no-store",
      });
      iconURL = await iconRef.getDownloadURL();
    }
    if (preview) {
      const previewRef = stor.ref(`Maps/${DbUser()}/previews/_${id}_icon`);
      await previewRef.putFile(preview, {
        cacheControl: "no-store",
      });
      previewURL = await previewRef.getDownloadURL();
    }

    if (mapinfo.distance === undefined) {
      mapinfo.distance = 0;
    }

    const data = {
      ownerId: DbUser(),
      ownerName: user.user.name,
      description: mapinfo.description,
      name: mapinfo.name,
      rating: 0,
      ratingCount: 0,
      distance: mapinfo.distance,
      visibility: privacy,
      iconRef: iconURL !== undefined ? iconURL : "",
      previewRef: previewURL !== undefined ? previewURL : "",
      storeRef: reference.fullPath,
      location: mapinfo.location,
      createdAt: firestore.FieldValue.serverTimestamp(),
    } as MapDocument;

    if (!createNewInstance && mapinfo.webId) {
      delete data["rating"];
      delete data["ratingCount"];
    }

    let docid = undefined;
    if (mapinfo.webId) {
      docid = await addPath(data, mapinfo.webId);
    } else docid = await addPath(data);

    await saveMapInfo({ ...mapinfo, webId: docid }, id);

    const record = {
      mapId: mapinfo.map_id,
      webId: docid,
      downloadDate: firestore.Timestamp.now(),
    };
    useDownloadTrackingStore.getState().addRecord(docid, record);

    return true;
  } catch (err) {
    ToastAndroid.show("Coś Poszło nie tak", ToastAndroid.LONG);

    return false;
  }
}
/**
 * Funkcja pobierająca wszystkie ścieżki z pamięci lokalnej
 * @category System plików
 * @return {*}  {Promise<HealthPath[]>} tablica obiektów HealthPath
 */
async function listAllMaps(): Promise<HealthPath[]> {
  const dirInfo = await fs.getInfoAsync(mapDir);
  if (!dirInfo.exists) return [];
  const files = await fs.readDirectoryAsync(mapDir);
  //
  let maps = [];
  for (const file of files) {
    const fileInfo = await fs.getInfoAsync(mapDir + file);
    if (!fileInfo.isDirectory) continue;
    const mapInfo = await fs.readAsStringAsync(mapDir + file + "/mapInfo.json");
    maps.push(JSON.parse(mapInfo) as HealthPath);
  }
  return maps;
}

/**
 * Funkcja pobierająca ścieżkę z chmury do pamięci lokalnej
 * @category System plików
 * @param {MapDocument} map obiekt ścieżki
 */
async function downloadMap(map: MapDocument) {
  if (map.id === undefined) return;
  const cacheInfo = await createIfNotExists(cacheDir);
  const reference = stor.ref(map.storeRef);
  let refName = reference.name;

  let mapNameDir = `${mapDir}${refName}/`;
  const dirInfo = await fs.getInfoAsync(mapNameDir);
  const altId = uuid.v4().toString();
  let isUpdate = false;
  if (dirInfo.exists) {
    const existingInfo = await loadMapInfoDir(refName);

    if (map.id === existingInfo.webId) {
      isUpdate = true;
    } else [refName, mapNameDir] = [`_${altId}`, `${mapDir}_${altId}/`];
  }
  const path = `${cacheDir}${refName}.zip`;
  const uri = await reference.getDownloadURL();
  await fs.downloadAsync(uri, path);
  await unzip(path, mapNameDir);
  await fs.deleteAsync(path);

  const mapInfo = await loadMapInfoDir(refName);

  if (!isUpdate && dirInfo.exists) mapInfo.map_id = altId;
  mapInfo.webId = map.id;
  saveMapInfo(mapInfo, refName.substring(1));
  const record = {
    mapId: mapInfo.map_id,
    webId: map.id,
    downloadDate: firestore.Timestamp.now(),
  };
  useDownloadTrackingStore.getState().addRecord(map.id, record);
}
/**
 * Funkcja usuwająca niechciane pliki z folderu
 * @category System plików
 * @param {string} directory ścieżka do folderu
 * @param {string[]} allowedNames tablica nazw plików do zachowania
 */
async function deleteUnwantedFiles(directory: string, allowedNames: string[]) {
  const info = await fs.getInfoAsync(directory);
  if (!info.exists) return;

  const results = await fs.readDirectoryAsync(directory);
  const filesToDelete = results.filter((name) => !allowedNames.includes(name));

  for (const file of filesToDelete) {
    await fs.deleteAsync(`${directory}/${file}`);
  }
}
/**
 * Funkcja usuwająca niechciane pliki ścieżki z pamięci lokalnej
 * @category System plików
 * @param {HealthPath} map ścieżka
 */
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
    intros.push(getNameFromUri(a.introduction_audio?.path));
    navs.push(getNameFromUri(a.navigation_audio?.path));
    stopImages.push(getNameFromUri(a.image?.path));
  }
  deleteUnwantedFiles(mapNameDir + "audios/introductions", intros);
  deleteUnwantedFiles(mapNameDir + "audios/navigations", navs);
  deleteUnwantedFiles(mapNameDir + "images/covers", stopImages);
  deleteUnwantedFiles(mapNameDir + "images/previews", [getNameFromUri(map.imagePreview?.path)]);
  deleteUnwantedFiles(mapNameDir + "images/icons", [getNameFromUri(map.imageIcon?.path)]);
  deleteUnwantedFiles(mapNameDir, wantedRoot);
}
