##-an for no audio
## -acodec copy means copy audio encoding

FOLDER="../../Movies/"
##with sound:
#ffmpeg -i "$FOLDER$1" -i "$FOLDER"nature-sounds.mp3 -map 0:v -map 1:a -acodec copy -crf 12 -vf scale=1080:1920,setsar=1:1 -shortest "$FOLDER"1080-"$1"
#ffmpeg -i "$FOLDER$1" -i "$FOLDER"nature-sounds.mp3 -map 0:v -map 1:a -vcodec libx264 -acodec aac -r 30 -vf scale=1200:1600 -shortest "$FOLDER"1200-"$1"

##silence:
ffmpeg -i "$FOLDER$1" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -map 0:v -map 1:a -r 30 -vf scale=1080:1920,setsar=1:1 -shortest "$FOLDER"iphone-"$1"
ffmpeg -i "$FOLDER$1" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -map 0:v -map 1:a -r 30 -vf scale=1200:1600,setsar=1:1 -shortest "$FOLDER"ipad-"$1"


