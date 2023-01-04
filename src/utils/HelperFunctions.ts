import { LatLng } from "react-native-maps";
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

export const getCityAdress = (location: string) => {
  if (location === undefined) return "";
  const trimnumbers = (str: string) => {
    return str.replace(/\d{2}-\d{3}/g, "").trim();
  };
  const arr = location.split(", ");
  if (arr.length > 2) return trimnumbers(arr[1]);
  return "";
};
