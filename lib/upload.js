let FormData = require('form-data')
const axios = require('axios')
const fs = require('fs')

const getHeaders = require('./get-headers')
const createHashFromFile = require('./create-hash')

const push = async resource => {
  const { key, path, fileName, url } = resource
  const data = createFormData(path, fileName)

  const result = await createHashFromFile(path)
    .then(hash => getHeaders(data, key, hash))
    .then(headers => {
      return axios.put(url, data, {
        headers: headers,
      })
    })
    .catch(error => error)

  return result
}

const createFormData = (path, fileName) => {
  const file = fs.createReadStream(path)
  let data = new FormData()
  data.append('file', file, fileName)
  return data
}

module.exports = push
