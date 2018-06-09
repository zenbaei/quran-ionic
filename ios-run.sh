#!/bin/sh

if [ "$1" = "e" ]; then
	#ionic cordova emulate --list
	ionic cordova emulate ios --target "iPhone-6s"
else
	#-l hangs at splashscreen
	ionic cordova run ios --device --debug
fi
