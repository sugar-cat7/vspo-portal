#!/bin/bash

# Specify the directories to monitor
CHECK_DIRECTORIES=("service/vspo-schedule/web/" "service/vspo-schedule/proxy/")

# Check changes since the last commit
for file in $(git diff --name-only HEAD^ HEAD); do
    for dir in "${CHECK_DIRECTORIES[@]}"; do
        # If changes are within any of the specified directories, proceed with the build
        if [[ $file == $dir* ]]; then
            echo "Building because changes were found in $file"
            exit 1 # Proceed with build
        fi
    done
done

# If no changes in the specified directories, skip the build
echo "No changes in the specified directories, skipping build"
exit 0 # Skip build
