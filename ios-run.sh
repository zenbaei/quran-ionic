#!/bin/sh

DEVICE="$1"

if ["$DEVICE" = "e"];
then
	ionic cordova emulate ios -lc
else
	#-l hangs at splashscreen
	ionic cordova run ios --device --debug
fi
