import * as fs from "expo-file-system";
import { HealthPath } from "./interfaces";

const mapDir = fs.documentDirectory + "Maps/"; ///data/data/com.anonymous.healthpathes/files
/**
 * Funkcja ładująca informacje o ścieżce
 * @export
 * @param {string} id id lokalne ścieżki
 * @return {Promise<(HealthPath|undefined)>}  {Promise<HealthPath>} zwraca obiekt informacji o ścieżce w przypadku powodzenia, undefined w przypadku niepowodzenia
 */
export async function loadMapInfo(id: string): Promise<HealthPath> {
  try {
    const mapNameDir = `${mapDir}_${id}/`;
    const mapInfo = await fs.readAsStringAsync(mapNameDir + "mapInfo.json");
    return JSON.parse(mapInfo) as HealthPath;
  } catch (error) {
    return undefined;
  }
}
export async function loadMapInfoDir(id: string): Promise<HealthPath> {
  return loadMapInfo(id.substring(1));
}
