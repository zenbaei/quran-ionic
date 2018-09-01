DIR="./src/assets/data/tafsir/makhlouf/*"

for file in $DIR
do
##	echo $file;
	iconv -f UTF-16LE -t UTF-8 $file > $file
done

