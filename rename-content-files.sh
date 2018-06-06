#!/bin/sh

DIR=./src/assets/data/mushaf
ORIGIN=.ios.quran
TO=.quran

for (( i=1; i < 605; i++))
do
	mv $DIR/$i/$i$ORIGIN $DIR/$i/$i$TO
done
