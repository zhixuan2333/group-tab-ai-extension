#!/bin/bash

# Get current version from git
version=$(git describe --tags --abbrev=0)

# Export to version and short hash to version.ts
echo "export const version = '$version';" > version.ts
echo "export const shortHash = '$(git rev-parse --short HEAD)';" >> version.ts

echo "$version"
