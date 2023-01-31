import { LatLng } from "react-native-maps";
import * as Location from "expo-location";

export const calculateDistance = (path: LatLng[]) => {
  let distance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const lat1 = path[i].latitude;
    const lon1 = path[i].longitude;
    const lat2 = path[i + 1].latitude;
    const lon2 = path[i + 1].longitude;
    const R = 6371e3; // metres
    const f1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const f2 = (lat2 * Math.PI) / 180;
    const df = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(df / 2) * Math.sin(df / 2) +
      Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // in metres
    distance += d;
  }
  return distance;
};
export const imagePlaceholder =
  "https://cdn.discordapp.com/attachments/989095141874749470/1060571824385163384/800px-Question_mark_28black29.png";

export const getCityAdress = (location: string) => {
  if (location === undefined) return "";
  const trimnumbers = (str: string) => {
    return str.replace(/\d{2}-\d{3}/g, "").trim();
  };
  const arr = location.split(", ");
  if (arr.length > 2) return trimnumbers(arr[1]);
  return "";
};

export const formatDistance = (distance: number) => {
  if (distance < 1000) return `${Math.round(distance)} m`;
  return `${(distance / 1000).toFixed(2)} km`;
};

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

export async function getRoute(
  origin: LatLng,
  destination: LatLng,
  apikey = "***REMOVED***",
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
  console.log(url);

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

export async function getLocationPermissions(): Promise<boolean> {
  console.log("permcheck");

  let { status } = await Location.requestForegroundPermissionsAsync();
  console.log("ssssssss");

  console.log(status);
  let ss = await Location.requestBackgroundPermissionsAsync();
  console.log(ss.status);
  if (status !== "granted" || ss.status !== "granted") {
    return false;
  }
  return true;
}

// console.log("elo from helper functions");
// getRoute(
//   {
//     latitude: 50.23488,
//     longitude: 19.16162,
//   },
//   {
//     latitude: 50.22781,
//     longitude: 19.17179,
//   },
//   "***REMOVED***",
//   "WALKING"
// ).then((res) => console.log(res));
