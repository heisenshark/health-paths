import { LatLng } from "react-native-maps";

/**
 * Interfejs punktu stopu
 * @property {string} waypoint_id Id punktu stopu
 * @property {LatLng} coordinates Koordynaty punktu stopu
 * @property {string} displayed_name Nazwa wyświetlana punktu stopu
 * @property {string} description Opis punktu stopu
 * @property {MediaFile} [image] Obrazek punktu stopu
 * @property {MediaFile} [navigation_audio] Audio nawigacyjne punktu stopu
 * @property {string} [type] Typ punktu stopu
 * @property {MediaFile} [introduction_audio] Audio wprowadzające punktu stopu
 * @export
 * @interface Waypoint
 */
export interface Waypoint {
  waypoint_id: string;
  coordinates: LatLng;
  displayed_name: string;
  description: string;
  image?: MediaFile;
  navigation_audio?: MediaFile;
  type?: string;
  introduction_audio?: MediaFile;
}

/**
 * Interfejs mapy lokalnej na dysku
 * @property {string} [map_id] Id mapy
 * @property {string} name Nazwa mapy
 * @property {string} description Opis mapy
 * @property {string} location Lokalizacja mapy
 * @property {number} [distance] Dystans trasy
 * @property {LatLng[]} [waypoints] Punkty trasy
 * @property {Waypoint[]} [stops] Punkty stopu
 * @property {LatLng[]} [path] Trasa
 * @property {MediaFile} [imagePreview] Podgląd mapy
 * @property {MediaFile} [imageIcon] Ikona mapy
 * @property {string} [authorName] Nazwa autora mapy
 * @property {string} [authorId] Id autora mapy
 * @property {string} [webId] Id mapy na serwerze
 *
 * @export
 * @interface HealthPath
 */
export interface HealthPath {
  map_id?: string;
  name: string;
  description: string;
  location: string;
  distance?: number;
  waypoints?: LatLng[];
  stops?: Waypoint[];
  path?: LatLng[];
  imagePreview?: MediaFile;
  imageIcon?: MediaFile;

  authorName?: string;
  authorId?: string;
  webId?: string;
}
/**
 * Interfejs pliku multimedialnego
 * @property {string} media_id Id pliku
 * @property {string} type Typ pliku
 * @property {string} storage_type Typ przechowywania pliku
 * @property {string} path Ścieżka do pliku
 * @export
 * @interface MediaFile
 */
export interface MediaFile {
  media_id: string;
  type: string;
  storage_type: "cache" | "local";
  path: string;
}
