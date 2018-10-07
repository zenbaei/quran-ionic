#!/bin/sh

read -p "Enter d for Device or e for Emulator: " input

if [ $input = "e" ]; then
	#ionic cordova emulate --list
	ionic cordova emulate ios --target "iPhone-6s"
elif [ $input = "d" ]; then
	#-l hangs at splashscreen
	ionic cordova run ios --device
fi
