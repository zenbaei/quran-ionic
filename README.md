This is a starter template for [Ionic](http://ionicframework.com/docs/) projects.

## How to use this template

*This template does not work on its own*. The shared files for each starter are found in the [ionic2-app-base repo](https://github.com/ionic-team/ionic2-app-base).

To use this template, either create a new ionic project using the ionic node.js utility, or copy the files from this repository into the [Starter App Base](https://github.com/ionic-team/ionic2-app-base).

### With the Ionic CLI:

Take the name after `ionic2-starter-`, and that is the name of the template to be used when using the `ionic start` command below:

```bash
$ sudo npm install -g ionic cordova
$ ionic start mySideMenu sidemenu
```

Then, to run it, cd into `mySideMenu` and run:

```bash
$ ionic cordova platform add ios
$ ionic cordova run ios
```

Substitute ios for android if not on a Mac.

# How to run it
after checking out the app:

install Dependencies: npm install

run app: ionic serve

test app: ng test

test e2e: npm run e2e

install platforms: ionic cordova platform add ios|browser|android
 
run platform: ionic cordova run ios|browser|android

note: any scripts provided in package.json can be run by: npm run <script name>

# Build for deployment:
ionic cordova build android --prod --release
sign using kalemat keystore: jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore kalemat-key-store.jks android-release-unsigned.apk kalemat

