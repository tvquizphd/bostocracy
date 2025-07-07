#!/bin/bash
# Add to crontab: */1 * * * * /root/bostocracy/pull-main.sh

cd /root/bostocracy || exit
git fetch --all --prune
git merge-base --is-ancestor HEAD origin/main && git merge origin/main
