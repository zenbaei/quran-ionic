#!/bin/sh

if [ "$1" = "e" ]; then
	#ionic cordova emulate --list
	ionic cordova emulate ios --target "iPhone-6s"
elsif ["$1" = "d"]; then
	#-l hangs at splashscreen
	ionic cordova run ios --devicee
fi
