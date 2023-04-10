import { LatLng } from "react-native-maps";
import * as Location from "expo-location";
import { gApiKey } from "../config/firebase";

/**
 * Funkcja obliczająca odległość całej ścieżki
 *
 * @export
 * @param {LatLng[]} path
 * @return {*}
 */
export function calculateDistance(path: LatLng[]) {
  let distance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const lat1 = path[i].latitude;
    const lon1 = path[i].longitude;
    const lat2 = path[i + 1].latitude;
    const lon2 = path[i + 1].longitude;
    const R = 6371000;
    const f1 = (lat1 * Math.PI) / 180;
    const f2 = (lat2 * Math.PI) / 180;
    const df = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(df / 2) * Math.sin(df / 2) +
      Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    distance += d;
  }
  return distance;
}

/**
 * Funkcja formatująca odległość
 * @export
 * @param {number} distance
 * @return {string} zwraca string z odległością w metrach lub kilometrach
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) return `${Math.round(distance)} m`;
  return `${(distance / 1000).toFixed(2)} km`;
}

/**
 * Funkcja dekodująca punkty z API Google Directions, zapożyczona z
 * react-native-maps-directions
 * @param {*} t
 * @return {*}
 */
function decode(t) {
  let points = [];
  for (let step of t) {
    let encoded = step.polyline.points;
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;
    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
  }
  return points;
}
/**
 * Funkcja pobierająca trasę z API Google Directions
 *
 * @export
 * @param {LatLng} origin punkt początkowy
 * @param {LatLng} destination  punkt końcowy
 * @param {string} [apikey=GOOGLE_API_KEY] klucz API
 * @param {string} [mode="WALKING"] tryb trasy
 * @return {*}
 */
export async function getRoute(
  origin: LatLng,
  destination: LatLng,
  apikey = gApiKey,
  mode = "WALKING"
) {
  const directionsServiceBaseUrl = "https://maps.googleapis.com/maps/api/directions/json";
  mode = "WALKING";
  // Define the URL to call. Only add default parameters to the URL if it's a string.
  let url = directionsServiceBaseUrl;
  if (typeof directionsServiceBaseUrl === "string") {
    url += `?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${
      destination.longitude
    }&key=${apikey}&mode=${mode.toLowerCase()}`;
  }

  const response = await fetch(url);
  const json = await response.json();
  if (json.status !== "OK") {
    const errorMessage = json.error_message || json.status || "Unknown error";
    return Promise.reject(errorMessage);
  }
  if (json.routes.length) {
    const route = json.routes[0];

    return Promise.resolve(
      route.legs.reduce((carry, curr) => {
        return [...carry, ...decode(curr.steps)];
      }, [])
    );
  } else {
    return Promise.reject();
  }
}
/**
 * Funkcja prosząca o zezwolenie na użycie lokalizacji urządzenia
 * @export
 * @return {*}  {Promise<boolean>} zwraca true jeśli użytkownik zezwolił na użycie lokalizacji
 */
export async function getLocationPermissions(): Promise<boolean> {
  let { status } = await Location.requestForegroundPermissionsAsync();

  let ss = await Location.requestBackgroundPermissionsAsync();

  if (status !== "granted" || ss.status !== "granted") {
    return false;
  }
  return true;
}

export const imagePlaceholder =
  "https://cdn.discordapp.com/attachments/989095141874749470/1060571824385163384/800px-Question_mark_28black29.png";
