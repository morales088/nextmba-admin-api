#!/usr/bin/env bash
# exit on errorset -o errexit

npm install;
npx puppeteer browsers install chrome;
npx prisma db push;
npx prisma generate;
nest build;

# Store/pull Puppeteer cache with build cache
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  echo $XDG_CACHE_HOME/puppeteer/$PUPPETEER_CACHE_DIR
  cp -R "$XDG_CACHE_HOME/puppeteer/" "$PUPPETEER_CACHE_DIR"
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME
fi