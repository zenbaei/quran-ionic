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

# Run lab mode
ionic serve --lab

# Generate icon and splash
ionic cordova resources
#in case of login problem:
ionic config set backend pro -g
ionic login

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
comment out code in cleancss function in quran-ionic/node_modules/@ionic/app-scripts/dist/cleancss.js to avoid loosing page border after build!
run ./android-build.sh

# Generate Android icons:
https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html#foreground.type=image&foreground.space.trim=1&foreground.space.pad=0.25&foreColor=rgba(96%2C%20125%2C%20139%2C%200)&backColor=rgb(255%2C%20255%2C%20255)&crop=0&backgroundShape=square&effects=none&name=ic_launcher

# Updating cordova plugins:
$ npm install -g cordova-check-plugins
$ cordova-check-plugins --update=auto

# Check app problems:
$ ionic doctor

# Mobile views on Browser:
http://localhost:8100/?ionicplatform=android
http://localhost:8100/ionic-lab