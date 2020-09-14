const mapper = require('frictionless-ckan-mapper-js')
const axios = require('axios')

const CkanAuthApi = require('./util/ckan-auth-api')
const CkanUploadAPI = require('./util/ckan-upload-api')
const Open = require('./file')
const { camelToSnakeCase } = require('./util/general')

/**
 * @class Client.
 * @param {string} apiKey
 * @param {number} organizationId
 * @param {string} datasetId
 * @param {string} api
 */
class Client {
  constructor(apiKey, organizationId, datasetId, api) {
    this.apiKey = apiKey
    this.organizationId = organizationId
    this.datasetId = datasetId
    this.api = api
  }

  async ckanAuthz(url) {
    // Create the scope to send to CkanAuthz
    let scope = [`obj:${this.organizationId}/${this.datasetId}/*:write`]

    // Get the JWT token from CkanAuthz, the user should provide the url
    if (url) {
      const response = await CkanAuthApi.getJWTFromCkanAuthz(
        url,
        this.apiKey,
        scope
      )
      return response
    }
    throw 'invalid URL argument'
  }

  /**
   * Make action request CKAN. For more info check
   * https://docs.ckan.org/en/latest/api/index.html#action-api-reference
   * @param {string} actionName - The action name, e.g. site_read, package_show ...
   * @param {object} payload - The payload being sent to CKAN
   * @param {string} requestType - The requestType is the request method, default is POST
   */
  async action(actionName, payload, requestType = "POST") {
    const path = `/api/3/action/${actionName}`
    const headers = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: this.apiKey,
      },
    }

    const response = await axios({
      method: requestType,
      url:`${this.api}${path}`,
      headers: headers,
      data: payload
    })

    if (!response.data.success) {
      throw `Action response: ${response.statusText}`
    }

    return response.data
  }

  put(actionType, payload) {
    return this.action(actionType, payload)
  }

  /**
   * @param {File} file
   * @param {string} token
   */
  async push(file, token, onProgress) {
    // Given the JWT token and file size, will return signed URL, verify URL and JWT token
    const lfs = await CkanAuthApi.requestFileUploadActions(
      this.api,
      token,
      file.sha256(),
      file.size(),
      this.organizationId,
      this.datasetId
    )
    const object = lfs.objects[0]
    const result = {
      oid: object.oid,
      size: object.size,
      name: file.name(),
      success: true,
      fileExists: false,
    }

    // Upload the file to cloud storage
    if (object.actions) {
      await CkanUploadAPI.uploadToStorage(
        object.actions.upload,
        file.content(),
        onProgress
      )
      await CkanUploadAPI.verifyUpload(lfs.objects[0].actions.verify, file)
      return result
    } else {
      // File is already in storage
      result.fileExists = true
      return result
    }
  }
}

module.exports = {
  Client,
  Open,
}
