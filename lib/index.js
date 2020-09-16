const frictionlessCkanMapper = require('frictionless-ckan-mapper-js')
const axios = require('axios')

const CkanAuthApi = require('./util/ckan-auth-api')
const CkanUploadAPI = require('./util/ckan-upload-api')
const ActionApi = require('./util/action-api')
const Open = require('./file')

const { camelToSnakeCase } = require('./util/general')

/**
 * @class Client.
 * @param {string} apiKey
 * @param {string} organizationId
 * @param {string} datasetId
 * @param {string} api
 */
class Client {
  constructor(apiKey, organizationId, datasetId, api, lfs) {
    this.apiKey = apiKey
    this.organizationId = organizationId
    this.datasetId = datasetId
    this.api = api
    this.lfs = lfs
  }

  async doBlobAuthz() {
    // Create the scope to send to CkanAuthz
    let scope = [`obj:${this.organizationId}/${this.datasetId}/*:write`]

    // Get the JWT token from CkanAuthz, the user should provide the url
    const response = await CkanAuthApi.getJWTFromCkanAuthz(
      this.api,
      this.apiKey,
      scope
    )
    return response.result.token
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

  /**
   * Creates a new dataset
   * @async
   * @param {(string|Object)} datasetNameOrMetadata - It is either a string being a valid dataset name
   * or metadata for the dataset in frictionless format.
   * @return {Promise<Object>} The frictionless dataset
   */
  async create(datasetNameOrMetadata) {
    const datasetMetadata =
      typeof datasetNameOrMetadata === 'string'
        ? { name: datasetNameOrMetadata }
        : datasetNameOrMetadata

    const ckanMetadata = frictionlessCkanMapper.packageFrictionlessToCkan(
      datasetMetadata
    )

    const response = await this.action('package_create', ckanMetadata)
    return frictionlessCkanMapper.packageCkanToFrictionless(response.result)
  }

  /**
   * Updates the dataset
   * @async
   * @param {Object} datasetMetadata
   * @return {Promise<Object>} The frictionless dataset
   */
  async push(datasetMetadata) {
    const ckanMetadata = frictionlessCkanMapper.packageFrictionlessToCkan(
      datasetMetadata
    )
    const response = await this.action('package_update', ckanMetadata)
    return frictionlessCkanMapper.packageCkanToFrictionless(response.result)
  }

  /**
   * Retrieves the dataset
   *
   * @async
   * @param {string} nameOrId - Id or name of the dataset
   * @return {Promise<Object>} The frictionless dataset
   */
  async retrieve(nameOrId) {
    const response = await this.action(
      'package_show',
      {
        nameOrId,
      },
      true
    )

    return frictionlessCkanMapper.packageCkanToFrictionless(response.result)
  }

  /**
   * The result of push blob method
   * @typedef {Object} PushBlobResult
   * @property {string} oid - oid
   * @property {number} size - size of the file
   * @property {string} name - resource name
   * @property {boolean} success - Indicates whether the request was successful or not
   * @property {boolean} fileExists - Indicates whether the resource exists or not
   */
  /**
   * @param {Object} resource - This datajs resource. Please check https://github.com/datopian/data.js
   * @param {function} onProgress a callback function to track the progress
   * @return {Promise<PushBlobResult>} request result
   */
  async pushBlob(resource, onProgress) {
    // Get the JWT token
    const token = await this.doBlobAuthz()

    const resourceContent = await resource.buffer

    // Given the JWT token and file size, will return signed URL, verify URL and JWT token
    const lfs = await CkanAuthApi.requestFileUploadActions(
      this.lfs,
      token,
      resource.descriptor.hash,
      resource.size,
      this.organizationId,
      this.datasetId
    )
    const object = lfs.objects[0]
    const result = {
      oid: object.oid,
      size: object.size,
      name: resource.descriptor.name,
      success: true,
      fileExists: false,
    }

    // Upload the file to cloud storage
    if (object.actions) {
      await CkanUploadAPI.pushDataToBlobStorage(
        object.actions.upload,
        resourceContent,
        onProgress
      )
      await CkanUploadAPI.verifyUpload(
        lfs.objects[0].actions.verify,
        resource.descriptor.hash,
        resource.size
      )
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
