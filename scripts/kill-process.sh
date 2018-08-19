#!/bin/sh

PRG_NAME="$1"
PIDS=`pgrep $PRG_NAME`
#`ps -ef | grep $PRG_NAME | cut -d " " -f 3,4`
for pid in $PIDS
do
    sudo kill -9 $pid
    echo "Killed pid $pid"
done
