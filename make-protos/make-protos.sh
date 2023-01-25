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
  make protos
  git commit -am "make protos"
  git push
else 
  echo "$MRPC_DIR does not exist"
fi
