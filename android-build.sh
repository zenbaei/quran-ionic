rm -r ./platforms/android/build/outputs/apk/
ionic cordova build android --prod --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore kalemat-key-store.jks ./platforms/android/build/outputs/apk/android-release-unsigned.apk kalemat -storepass muslim1@
~/Android/Sdk/build-tools/25.0.2/zipalign -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk ./platforms/android/build/outputs/apk/mushaf.apk
