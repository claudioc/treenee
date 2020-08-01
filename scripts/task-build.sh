#!/usr/bin/env bash

###
# This script automates the generation of a static version of a treenee
# installation. It won't work out-of-the-box because it uses directory names
# that are not present (it's part of another project) but it is left here
# as an "inspiration" in case you have a similar need.
#
# Cheers :)
###

# Remove this line once you know what you're doing.
exit 0

treenee_port=3067

type wget >/dev/null 2>&1 || { echo >&2 "😟  `wget` is apparently not installed."; exit 1; }

type node >/dev/null 2>&1 || { echo >&2 "😟  Can't find any version of Nodejs."; exit 1; }

# Ensure treenee is not listening already
# Also, we want to make sure we start it because we don't trust any
# other service running on that port anyway.
nc -z localhost ${treenee_port} 2> /dev/null && { echo >&2 "😟  There is already something listening on port ${treenee_port}. Stop it and retry."; exit 1; }

echo Starting Treenee…
node index -s ../treenee-settings.json > /dev/null &
pid=$(echo $!)

# Wait until treenee is there (it should take a couple of seconds top)
while ! echo exit | nc -z localhost ${treenee_port} 2> /dev/null; do sleep 1; done

echo Creating the website…

wget -q --mirror --convert-links --adjust-extension --page-requisites --no-parent http://localhost:${treenee_port} -P ../website

echo Stopping Treenee…
kill ${pid}
wait ${pid} 2>/dev/null

mv ../website/localhost:${treenee_port}/* ../website
rm -rf ../website/localhost:${treenee_port}

open $(ls -1 ../website/tree/*.html | head -1)

echo All done.
