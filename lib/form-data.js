let FormData = require('form-data')
const fs = require('fs')

const createFormData = (path, fileName) => {
  const file = fs.createReadStream(path)
  let data = new FormData()
  data.append('file', file, fileName)
  return data
}

module.exports = createFormData;
