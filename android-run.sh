if [ "$1" = "e" ]; then
        #ionic cordova emulate --list
        ionic cordova emulate android --debug -c --target "Nexus_6_API_26" 
elif [ "$1" = "d" ]; then
        ionic cordova run android --device
fi

