import * as fs from "expo-file-system";
import { HealthPath } from "./interfaces";
import { cloneDeep } from "lodash";

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
  console.log(dirInfo);
  if (!dirInfo.exists || !dirInfo.isDirectory) {
    console.log("Map directory doesn't exist, creating...");
    await fs.makeDirectoryAsync(path);
  }
}
async function writeToFile(path: string, data: string = "") {
  const fileInfo = await fs.getInfoAsync(path);
  console.log(fileInfo);
  if (!fileInfo.exists || fileInfo.isDirectory) {
    const aaaa = fs.writeAsStringAsync(path, data);
    console.log(aaaa);
  }
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

  createIfNotExists(mapNameDir + "Audio/");
  createIfNotExists(mapNameDir + "Image/");
  createIfNotExists(mapNameDir + "Video/");
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
  console.log(mapInfo);

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
    })),
  ];
  writeToFile(mapNameDir + "mapInfo.json", JSON.stringify(mapInfo));
  writeToFile(mapNameDir + "features_" + map.name + "_lines.geojson", JSON.stringify(lines));
  writeToFile(mapNameDir + "features.geojson_" + map.name + ".geojson");
  writeToFile(mapNameDir + "waypoints.json", JSON.stringify(waypoints));
  writeToFile(mapNameDir + "media_files.json");
  let elo = "";
  try {
    const aaaa = fs.writeAsStringAsync(
      mapNameDir + "mapInfo.json",
      JSON.stringify({ name: map.name, waypoints: [] })
    );
    console.log(aaaa);
  } catch (error) {
    console.log("error: " + error);
  }

  return mapNameDir;
}

async function listAllMaps(): Promise<string[]> {
  const files = await fs.readDirectoryAsync(mapDir);
  console.log(`Files inside ${mapDir}:\n\n${JSON.stringify(files)}`);
  return files;
}
