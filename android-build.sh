rm -r ./platforms/android/build/outputs/apk/
ionic cordova build android --prod --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore kalemat-key-store.jks ./platforms/android/build/outputs/apk/android-release-unsigned.apk kalemat -storepass muslim1@
~/Android/Sdk/build-tools/25.0.2/zipalign -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk ./platforms/android/build/outputs/apk/mushaf.apk
##Upload to dropbox under /home/Apps/zenbaei-app
## curl -X POST https://content.dropboxapi.com/2/files/upload --header "Authorization: Bearer At3ONjROlSMAAAAAAAACoSyNvmG3x7Mr3RrWCJ1okIvdEdxGVtQPf5QIkKLhbYL1" --header "Dropbox-API-Arg: {\"path\": \"/mushaf.apk\",\"mode\": \"add\",\"autorename\": true,\"mute\": false}" --header "Content-Type: application/octet-stream" --data-binary @./platforms/android/build/outputs/apk/mushaf.apk
