#!/bin/bash

yarn build
rsync -avz --delete build/ root@easscan.com:easter-ui
ssh root@easscan.com "rm -rf /sites/easter-ui && cp -r easter-ui /sites/"
