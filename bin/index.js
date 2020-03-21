#!/usr/bin/env node
const { program } = require('commander')
const axios = require('axios')
const filename = process.argv[3]
const fs = require('fs')
const input = fs.createReadStream(filename)
let FormData = require('form-data')

const getHeaders = require('../lib/get-headers')
const createHashFromFile = require('../lib/create-hash')

async function uploadFile(key, previous) {
  let data = new FormData()
  data.append('file', input, filename)
  await createHashFromFile(filename)
    .then(response => getHeaders(data, key, response))
    .then(headers => {
      return axios.put('http://localhost:3001/upload-csv', data, {
        headers: headers,
      })
    })
    .then(response => {
      console.log(response.data)
    })
    .catch(e => {
      console.log(e)
    })
}

program.option('-k, --apikey <key>', 'api key', uploadFile)

program.parse(process.argv)
