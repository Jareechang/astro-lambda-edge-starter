#!/bin/bash

echo "Generating assets starting."

pnpm install
pnpm build
pnpm clean:node_modules
pnpm install --prod --prefer-offline --offline
zip -r main.zip dist node_modules

echo "Generating assets finished."
