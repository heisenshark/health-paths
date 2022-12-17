import { LatLng } from "react-native-maps";

export default interface Waypoint {
  waypoint_id: string;
  coordinates: LatLng;
  displayed_name: string;
  description: string;
  image?: string;
  navigation_audio?: string;
  type?: string;
  introduction_audio?: string;
}

export interface HealthPath {
  map_id?: string;
  name: string;
  description: string;
  location: string;
  duration?: number;
  distance?: number;
  waypoints?: LatLng[];
  stops?: Waypoint[];
  path?: LatLng[];
  imageCover?: string;
}

// {
//     "waypoint_id": "gliwice.rynek.ratusz",
//     "coordinates": [
//         cords.latitude,
//         cords.longitude
//     ],
//     "type": "station",
//     "displayed_name": "Rynek Rzeźba Madonny",
//     "navigation_audio": "",
//     "image": "image.station.gliwice.ratusz.icon",
//     "introduction_audio": "audio.introduction.ratusz"
// }
