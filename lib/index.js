const createFormData = require('./form-data')
const createHashFromFile = require('./hash')
const getHeaders = require('./headers')
const axios = require('axios')
const fetch = require('node-fetch')

class DataHub {
  constructor(key, ownerId, owner, api) {
    this.key = key
    this.ownerId = ownerId
    this.owner = owner
    this.api = api
  }

  getFormData() {
    return createFormData(path, fileName)
  }

  async getJWTAuth() {
    const response = await fetch(`${this.api}/api/3/action/authz_authorize`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        "Authorization": this.key
      },
      body: JSON.stringify({
        scope: ['res:my_resource_id:create'],
        lifetime: 5000,
      })
    })
    if (response.status !== 200) {
      throw new Error(`Authz Server: ${response.statusText}`)
    }

    return response.json()
  }

  async getCloudStorageAccessGranterService(token) {
    const response = await fetch(`https://git-server.com/any-path`,{
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json'
      },
      body: JSON.stringify({
        oid: '1111111',
        size: 123,
        hash:  token
      })
    })
    if (response.status !== 200) {
      throw new Error(`Cloud Storage Access Granter Server: ${response.statusText}`)
    }
    return response.json()
  }

  async push(resource) {
    const jwtToken = await this.getJWTAuth()

    if (jwtToken.success) {
      const accessGranterResponse = await this.getCloudStorageAccessGranterService(jwtToken.token);
      console.log(accessGranterResponse.objects[0])
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
  DataHub,
}
