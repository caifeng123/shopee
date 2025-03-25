#!/bin/bash

PACKED_FOLDER="dist/hack_shopee_extension"
ZIP_FILE="dist/hack_shopee_extension.zip"

# Create dist directory if it doesn't exist
mkdir -p dist

# Remove existing packed folder and zip file if they exist
rm -rf "$PACKED_FOLDER"
rm -f "$ZIP_FILE"

# Create the packed folder
mkdir -p "$PACKED_FOLDER"

# Copy all files and directories except excluded ones
rsync -av \
    --exclude 'dist' \
    --exclude 'hack-backup' \
    --exclude 'hack-workspace' \
    --exclude '.gitignore' \
    --exclude '.git' \
    --exclude 'pack.sh' \
    --exclude "$PACKED_FOLDER" \
    --exclude "$ZIP_FILE" \
    ./ "$PACKED_FOLDER"

# Create zip archive
cd dist && zip -r "hack_shopee_extension.zip" "hack_shopee_extension"

echo "✅ Packing completed!"
echo "📁 Packed folder: $PACKED_FOLDER"
echo "📦 Zip file: $ZIP_FILE" 