#!/bin/bash
# Make Protos

#Check if MRPC tools have been downloaded
MRPC_DIR=$1

if [ -z $MRPC_DIR ]; then
  MRPC_DIR="mrpc"
fi

if [ -d $MRPC_DIR ]; then
  cd $MRPC_DIR
  tar zxvf mrpc-darwin-amd64.tar.gz
  echo $PATH
  cd $GITHUB_WORKSPACE
  find . -name "protoc-gen-mesa-swift" -ls
  make protos
else 
  echo "$MRPC_DIR does not exist"
fi
