#!/bin/bash
# Antigravity Comma-First Setup Script
# Run this from your new project directory: 
# bash /Users/metagrapher/Source/Metagrapher/allyourbase/setup-comma-first.sh

TARGET_DIR=$(pwd)
SOURCE_DIR="/Users/metagrapher/Source/Metagrapher/allyourbase"

echo "Applying Comma-First precision to $TARGET_DIR..."

mkdir -p "$TARGET_DIR/.eslint-rules"
mkdir -p "$TARGET_DIR/.vscode"

cp "$SOURCE_DIR/.eslint-rules/leading-commas.js" "$TARGET_DIR/.eslint-rules/"
cp "$SOURCE_DIR/.eslintrc.cjs" "$TARGET_DIR/"
cp "$SOURCE_DIR/.vscode/settings.json" "$TARGET_DIR/.vscode/"

# Update absolute paths in settings.json to match the new target
# Note: On Mac, sed -i requires an empty string for the extension argument
sed -i '' "s|$SOURCE_DIR|$TARGET_DIR|g" "$TARGET_DIR/.vscode/settings.json"

echo "Done. Environment configured for Comma-First precision."
