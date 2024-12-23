#!/bin/bash

# Ensure the script fails if any command fails
set -e

# Function to safely base64 encode a file
encode_file() {
    local filename="$1"
    base64 -i "$filename" | tr -d '\n'
}

# Start of the samples block
echo "const samples = {"

# Kick
echo "    'Kick': 'data:audio/mp3;base64,$(encode_file bass.mp3)',"

# Snare
echo "    'Snare': 'data:audio/mp3;base64,$(encode_file snare-drum.mp3)',"

# HiHat
echo "    'HiHat': 'data:audio/mp3;base64,$(encode_file hihat.mp3)',"

# HiHat Open
echo "    'HiHat Open': 'data:audio/mp3;base64,$(encode_file hihat-open.mp3)',"

# Ride
echo "    'Ride': 'data:audio/mp3;base64,$(encode_file ride.mp3)',"

# Tom 1
echo "    'Tom 1': 'data:audio/mp3;base64,$(encode_file tom1.mp3)',"

# Tom 2
echo "    'Tom 2': 'data:audio/mp3;base64,$(encode_file tom2.mp3)',"

# Floor Tom
echo "    'Floor Tom': 'data:audio/mp3;base64,$(encode_file floor-tom.mp3)'"

# Close the samples block
echo "};"
