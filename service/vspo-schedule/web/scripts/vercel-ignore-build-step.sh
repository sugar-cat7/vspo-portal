#!/bin/bash

# Specify the directory to monitor
CHECK_DIRECTORY="service/vspo-schedule/web/"

# Check changes since the last commit
for file in $(git diff --name-only HEAD^ HEAD); do
    # If changes are within the specified directory, proceed with the build
    if [[ $file == $CHECK_DIRECTORY* ]]; then
        echo "Building because changes were found in $file"
        exit 1 # Proceed with build
    fi
done

# If no changes in the specified directory, skip the build
echo "No changes in $CHECK_DIRECTORY, skipping build"
exit 0 # Skip build
