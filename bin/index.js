#!/usr/bin/env node
const { program } = require('commander')

const uploadFile = require('../lib/upload')

program.option('-k, --apikey <key>', 'api key', uploadFile)

program.parse(process.argv)
