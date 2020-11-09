#!/bin/bash
set -e

echo "Adding videos...."
echo "Their ids will be printed"
dfx canister call asset_storage store "(\"...\", \"Test video\", principal \"$(dfx identity get-principal)\", 0, 0)"
dfx canister call asset_storage store "(\"...\", \"Another test video\", principal \"$(dfx identity get-principal)\", 0, 0)"
dfx canister call asset_storage store "(\"...\", \"Video with birds\", principal \"$(dfx identity get-principal)\", 0, 0)"
dfx canister call asset_storage store "(\"...\", \"B@B Fundamentals Lecture #2\", principal \"$(dfx identity get-principal)\", 0, 0)"
dfx canister call asset_storage store "(\"...\", \"B@B Fundamentals Lecture #3\", principal \"$(dfx identity get-principal)\", 0, 0)"
dfx canister call asset_storage store "(\"...\", \"B@B Fundamentals Lecture #4\", principal \"$(dfx identity get-principal)\", 0, 0)"
dfx canister call asset_storage store "(\"...\", \"B@B Fundamentals Lecture #5\", principal \"$(dfx identity get-principal)\", 0, 0)"

echo "Printing all videos..."
dfx canister call asset_storage all