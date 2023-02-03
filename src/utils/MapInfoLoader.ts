import * as fs from "expo-file-system";
import { HealthPath } from "./interfaces";

const mapDir = fs.documentDirectory + "Maps/"; ///data/data/com.anonymous.healthpathes/files

export async function loadMapInfo(id: string): Promise<HealthPath> {
  try {
    const mapNameDir = `${mapDir}_${id}/`;
    const mapInfo = await fs.readAsStringAsync(mapNameDir + "mapInfo.json");
    return JSON.parse(mapInfo) as HealthPath;
  } catch (error) {
    return undefined;
  }
}
