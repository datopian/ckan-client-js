const createFormData = require('./form-data')
const createHashFromFile = require('./hash')
const getHeaders = require('./headers')
const axios = require('axios')
const fetch = require('node-fetch')

class Upload {
  constructor(key, ownerId, owner, api) {
    this.key = key
    this.ownerId = ownerId
    this.owner = owner
    this.api = api
  }

  getFormData() {
    return createFormData(path, fileName)
  }

  async getJWTAuth(body) {
    const response = await fetch(`${this.api}/api/3/action/authz_authorize`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        "Authorization": this.key
      },
      body: JSON.stringify(body)
    })
    if (response.status !== 200) {
      throw new Error(`Authz server: ${response.statusText}`)
    }

    return response.json().token
  }

  async getBlobUrl(body) {
    const response = await fetch(`https://git-server.com/any-path`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(body)
    })

    return response
  }


  async push(body, path = "", fileName = "") {
    const jwtToken = await this.getJWTAuth(body)
    if (jwtToken) {
      console.log(jwtToken.success)
    }

    // Commented until finish the authenticate flow
    // const data = this.getFormData(path, fileName)
    // const hash = await createHashFromFile(path)
    // const headers = await getHeaders(data, this.key, hash)

    // const result = axios
    //   .put(this.api, data, {
    //     headers: headers,
    //   })
    //   .catch(error => error)

    // return result
  }
}

module.exports = {
  Upload,
}
