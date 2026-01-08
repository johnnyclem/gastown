#!/bin/bash
set -e

make && make build && rm ~/go/bin/gt && mv gt ~/go/bin

