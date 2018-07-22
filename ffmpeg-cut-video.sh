##-an for no audio
## -acodec copy means copy audio encoding

FOLDER="../../Movies/"
ffmpeg -i "$FOLDER$1" -ss 00:00:00 -t 00:00:30 -async 1 "$FOLDERcut-$1"
