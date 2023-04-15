# health-paths
App for tracking GPS location targeted for seniors, it allows for tracking path of their location, and add some waypoints with points of interest that they can describe andd add multimedia like images and audio files. They can also share the paths by sending them to cloud, and sending a link.

#### Application made with:
- React Native(Expo)
- Firebase
- Firestore
- React Navigation
- TailwindCSS(TWClassNames) 

#### Run locally
before running you should fill in .env file according to .env.example file already existing in the repo, you should have **firebase project**, some google sign in project/option and google maps api key. also enter the maps api key in android/app/main/AndroidManifest.xml in metadata tag with value of "com.google.android.geo.API_KEY"
```bash
#It's also important to add google-services.json to android/app directory for google login
#If you have any problems reference the documentations of libraries used like
# - React Native Firebase 
# - React Native Google Sign in
# - React Native Maps
# - React Native MAps Directions
FIREBASE_API_KEY= #api key
FIREBASE_AUTH_DOMAIN= #project-XXXXX.firebase.com
FIREBASE_PROJECT_ID= #project-XXXXX
FIREBASE_STORAGE_BUCKET= #project-XXXXX.appspot.com
FIREBASE_MESSAGING_SENDER_ID= # 1234567890
FIREBASE_APP_ID= #X:X:web:X

GOOGLE_MAPS_API_KEY= #Google maps api key
WEB_CLIENT_ID= # X-X.apps.googleusercontent.com
```
After that run, you may also need to configure expo project and some stuff, I wont help you with that but I will tell that it may require creating developement build using their site.

```bash
yarn install
yarn run android
```

