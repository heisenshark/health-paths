import * as fs from "expo-file-system";
import Waypoint, { HealthPath, MediaFile } from "./interfaces";
import { cloneDeep } from "lodash";
import { copyAsync } from "expo-file-system";
import { mediaFiles } from "../providedfiles/Export";

const mapDir = fs.documentDirectory + "Maps/"; ///data/data/com.anonymous.healthpathes/files

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
export { ensureMapDirExists, saveMap, listAllMaps };

const getNameFromUri = (uri: string) => {
  return uri.substring(uri.lastIndexOf("/") + 1, uri.length);
};

export function getURI(map: HealthPath, media: MediaFile) {
  if (media.storage_type === "cache") return media.path;
  return `${mapDir}${map.name}_${map.map_id}/${media.path}`;
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
  console.log("copyExistingFileToMedia 1 ", file);
  console.log(file, mapNameDir, path);

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
  const foldername = `${map.name}_${map.map_id}`;
  const mapNameDir = `${mapDir}${foldername}/`;
  const dirInfo = await fs.getInfoAsync(mapNameDir);
  console.log(dirInfo);
  if (!dirInfo.exists) {
    console.log(`Mapdirectory ${map} doesn't exist, creating...`);
    await fs.makeDirectoryAsync(mapNameDir, { intermediates: true });
  }
  console.log("map::: ", map);

  createIfNotExists(mapNameDir + "audios/");
  // createIfNotExists(mapNameDir + "images/");
  // createIfNotExists(mapNameDir + "images/covers/"); //clear this dir
  // createIfNotExists(mapNameDir + "audios/introductions/"); //clear this dir
  // createIfNotExists(mapNameDir + "audios/navigations/"); //clear this dir
  // createIfNotExists(mapNameDir + "Video/");
  const mapInfo = {
    name: map.name,
    map_id: map.map_id,
    imageCover: map.imageCover,
    description: map.description,
    location: map.location,
    duration: map.duration,
    distance: map.distance,
    waypoints: [...map.waypoints],
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

  let medias = [] as MediaFile[];

  try {
    for (const stop of map.stops) {
      console.log(stop);

      await checkExistanceOfMedia(stop, mapNameDir);
    }

    for (const stop of map.stops) {
      medias = [...medias, ...(await copycachedMedia(stop, mapNameDir))];
    }
  } catch (error) {
    console.error(error);
  }

  console.log(medias);

  console.log("mapid::" + map.map_id);
  await writeToFile(mapNameDir + "mapInfo.json", JSON.stringify(mapInfo));
  await writeToFile(mapNameDir + "features_" + map.name + "_lines.geojson", JSON.stringify(lines));
  await writeToFile(mapNameDir + "features.geojson_" + map.name + ".geojson");
  await writeToFile(mapNameDir + "waypoints.json", JSON.stringify(waypoints));
  await writeToFile(mapNameDir + "media_files.json", JSON.stringify(medias));

  // map.stops.forEach((stop) => {
  //   if (stop.image) {
  //     writeToFile(mapNameDir + "images/" + stop.image);
  //   }
  //   if (stop.introduction_audio) {
  //     writeToFile(mapNameDir + "audios/" + stop.audio);
  //   }
  // });

  // writeToFile(mapNameDir + "media_files.json");
  // let elo = "";
  // try {
  //   const aaaa = fs.writeAsStringAsync(
  //     mapNameDir + "mapInfo.json",
  //     JSON.stringify({ name: map.name, waypoints: [] })
  //   );
  //   console.log(aaaa);
  // } catch (error) {
  //   console.log("error: " + error);
  // }

  return mapNameDir;
}

async function listAllMaps(): Promise<string[]> {
  const files = await fs.readDirectoryAsync(mapDir);
  console.log(`Files inside ${mapDir}:\n\n${JSON.stringify(files)}`);
  return files;
}
