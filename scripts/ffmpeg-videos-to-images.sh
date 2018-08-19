##-an for no audio
## -acodec copy means copy audio encoding

FOLDER="../../Movies/"
ffmpeg -i "$FOLDER$1" "$FOLDER"thumb%04d.jpg -hide_banner
