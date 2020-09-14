const mapper = require('frictionless-ckan-mapper-js')
const axios = require('axios')
const f11s = require('data.js')

const CkanAuthApi = require('./util/ckan-auth-api')
const CkanUploadAPI = require('./util/ckan-upload-api')
const ActionApi = require('./util/action-api')
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
   * @param {object} useHttpGet - Optional, if `true` will make `GET` request, otherwise `POST`.
   * Note that if the payload is provided during the `GET`, then it will be converted to params,
   * where each property will be snake case converted from camel case
   */
  async action(actionName, payload, useHttpGet = false) {
    const path = `/api/3/action/${actionName}`
    const config = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: this.apiKey,
      },
    }
    let response
    if (!useHttpGet)
      response = await axios.post(`${this.api}${path}`, payload, config)
    else {
      // use the payload as HTTP params
      response = await axios.get(`${this.api}${path}`, {
        ...config,
        params: camelToSnakeCase(payload),
      })
    }

    if (!response.data.success) {
      throw `Action response: ${response.statusText}`
    }

    return response.data
  }

  push(actionType, payload) {
    const file = f11s.open(payload)
    const dataset = new f11s.Dataset({
      ...file.descriptor,
      resources: [],
    })
    return this.action(actionType, dataset.descriptor)
  }

  /**
   * @param {File} file
   * @param {string} token
   */
  async pushBlob(file, token, onProgress) {
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
