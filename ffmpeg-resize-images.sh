##-an for no audio
## -acodec copy means copy audio encoding

FOLDER="../../Pictures/"
if [$2 != "land"];then
	ffmpeg -i $FOLDER$1 -vf scale=1242:2208 $FOLDER"iphone-"$1
	ffmpeg -i $FOLDER$1 -vf scale=2048:2732 $FOLDER"ipad-"$1
else
        ffmpeg -i $FOLDER$1 -vf scale=2208:1242 $FOLDER"iphone-landscape-"$1
        ffmpeg -i $FOLDER$1 -vf scale=2732:2048 $FOLDER"ipad-landscape-"$1
fi
