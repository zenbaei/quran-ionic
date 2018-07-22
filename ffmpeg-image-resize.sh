##-an for no audio
## -acodec copy means copy audio encoding

FOLDER="../../Movies/"
ffmpeg -i "$FOLDER$1" -vf scale=1242:2208  "$FOLDERiphone-$1"
ffmpeg -i "$FOLDER$1" -vf scale=2048:2732  "$FOLDERipad-$1"
