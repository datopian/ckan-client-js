const createFormData = require('./form-data')
const createHashFromFile = require('./hash')
const getHeaders = require('./headers')
const axios = require('axios')

class Upload {
  constructor(key, path, fileName, url) {
    this.key = key
    this.path = path
    this.fileName = fileName
    this.url = url
  }

  getFormData() {
    return createFormData(this.path, this.fileName)
  }

  async push() {
    const data = this.getFormData()
    const hash = await createHashFromFile(this.path)
    const headers = await getHeaders(data, this.key, hash)

    const result = axios
      .put(this.url, data, {
        headers: headers,
      })
      .catch(error => error)

    return result
  }
}

module.exports = {
  Upload,
}
