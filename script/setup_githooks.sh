#!/bin/sh

#
# Creates symbolic links between all git hooks stored in the repository
#

REPO_HOOKS_DIR=./githooks
GIT_HOOKS_DIR=./.git/hooks

for file in $REPO_HOOKS_DIR/*; do
    filename=$(basename "${file}")
    echo "${file} --> ${GIT_HOOKS_DIR}/${filename}"

    # paths in .git/hooks dir are relative to that dir, hence the ../../
    # to get back out to the main dir
    ln -s -f "../../$file" "${GIT_HOOKS_DIR}/$filename"
done
echo "Done"
