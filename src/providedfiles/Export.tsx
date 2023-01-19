export const geojsonFeatures = {
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.66577, 50.29387],
          [18.665969, 50.293949],
        ],
        type: "LineString",
      },
      id: "14d9170c556c7f5206dd8a3eb57b0915",
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.665827, 50.29441],
          [18.665768, 50.294341],
          [18.665645, 50.294409],
          [18.665639, 50.29449],
          [18.665618, 50.294508],
          [18.665649, 50.2946],
          [18.665571, 50.294543],
          [18.665389, 50.294659],
        ],
        type: "LineString",
      },
      id: "2b79337ef0d5125bae1cd6fde04e8eda",
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.66541, 50.294162],
          [18.665331, 50.293974],
          [18.665577, 50.293819],
          [18.66577, 50.293871],
        ],
        type: "LineString",
      },
      id: "7adea235c2ce5141026826d0108e4688",
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.66592, 50.29412],
          [18.665827, 50.294409],
        ],
        type: "LineString",
      },
      id: "8b6b25f2c811893a334ef7492af35ed7",
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.665969, 50.293952],
          [18.66592, 50.294122],
        ],
        type: "LineString",
      },
      id: "d628db1af6289a9045db70e4fd158d58",
    },
  ],
  type: "FeatureCollection",
};
export const featuresRynek = {
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.66577, 50.29387],
          [18.665969, 50.293949],
        ],
        type: "LineString",
      },
      id: "14d9170c556c7f5206dd8a3eb57b0915",
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.665827, 50.29441],
          [18.665768, 50.294341],
          [18.665645, 50.294409],
          [18.665639, 50.29449],
          [18.665618, 50.294508],
          [18.665649, 50.2946],
          [18.665571, 50.294543],
          [18.665389, 50.294659],
        ],
        type: "LineString",
      },
      id: "2b79337ef0d5125bae1cd6fde04e8eda",
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.66541, 50.294162],
          [18.665331, 50.293974],
          [18.665577, 50.293819],
          [18.66577, 50.293871],
        ],
        type: "LineString",
      },
      id: "7adea235c2ce5141026826d0108e4688",
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.66592, 50.29412],
          [18.665827, 50.294409],
        ],
        type: "LineString",
      },
      id: "8b6b25f2c811893a334ef7492af35ed7",
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [18.665969, 50.293952],
          [18.66592, 50.294122],
        ],
        type: "LineString",
      },
      id: "d628db1af6289a9045db70e4fd158d58",
    },
  ],
  type: "FeatureCollection",
};
export const mediaFiles = [
  {
    media_id: "image.preview.gliwice.rynek",
    type: "image",
    storage_type: "local",
    path: "images/previews/gliwice_rynek",
  },
  {
    media_id: "audio.introduction.zamek",
    type: "audio",
    storage_type: "local",
    path: "audios/introductions/Audio_16+17",
  },
  {
    media_id: "video.test.test_1",
    type: "video",
    storage_type: "local",
    path: "videos/test/Test_1",
  },
];
export const waypointsApp = [
  // {
  //     "waypoint_id": "gliwice.rynek.neptun",
  //     "coordinates": {
  //         "latitude": 50.29416,
  //         "longitude": 18.66541
  //     }
  //     ,
  //     "type": "station",
  //     "displayed_name": "Rynek Fontanna Neptuna",
  //     "navigation_audio": "",
  //     "image": "image.station.gliwice.neptun.icon",
  //     "introduction_audio": "audio.introduction.neptun"
  // },
  // {
  //     "waypoint_id": "gliwice.rynek.ratusz",
  //     "coordinates": {
  //         "latitude": 50.29387,
  //         "longitude": 18.66577
  //     },
  //     "type": "station",
  //     "displayed_name": "Rynek Rzeźba Madonny",
  //     "navigation_audio": "",
  //     "image": "image.station.gliwice.ratusz.icon",
  //     "introduction_audio": "audio.introduction.ratusz"
  // }
];
export const mapStylesJSON = [
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi.attraction",
    stylers: [
      {
        saturation: 25,
      },
      {
        lightness: 5,
      },
      {
        visibility: "off",
      },
      {
        weight: 2,
      },
    ],
  },
  {
    featureType: "poi.business",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi.park",
    stylers: [
      {
        saturation: 100,
      },
      {
        visibility: "on",
      },
      {
        weight: 1.5,
      },
    ],
  },
  {
    featureType: "poi.place_of_worship",
    stylers: [
      {
        saturation: 100,
      },
      {
        lightness: -60,
      },
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "transit",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];
export const mapStylenoLandmarks = [
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "transit",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];

export const mapstyleSilver = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#000000",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.business",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#ffd29e",
      },
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "poi.government",
    elementType: "geometry.fill",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#75d77b",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "poi.place_of_worship",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi.school",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#d8d2ca",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text",
    stylers: [
      {
        color: "#000000",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#a8a8a8",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#6b6b6b",
      },
      {
        weight: 3.5,
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#dadada",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#737373",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#545454",
      },
      {
        weight: 2,
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#c7c7c7",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#5e5e5e",
      },
      {
        weight: 2,
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text",
    stylers: [
      {
        color: "#000000",
      },
      {
        weight: 4.5,
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#85d0ff",
      },
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
];
