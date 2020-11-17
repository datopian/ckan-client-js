const frictionlessCkanMapper = require('frictionless-ckan-mapper-js')
const axios = require('axios')

const CkanAuthApi = require('./util/ckan-auth-api')
const LfsClient = require('./lfs-client')

const { camelToSnakeCase } = require('./util/general')

/**
 * @class Client
 * @param {string} apiKey
 * @param {string} organizationId
 * @param {string} datasetId
 * @param {string} api
 */
class Client {
  constructor(apiKey, organizationId, datasetId, api, lfsServerUrl) {
    this.apiKey = apiKey
    this.organizationId = organizationId
    this.datasetId = datasetId
    this.api = api
    this.lfsServerUrl = lfsServerUrl
  }

  async getUploadAuthToken() {
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
   * `action` gives you direct access to the [CKAN Action API][ckan-api].
   * Note: it uses the CKAN dataset and resource formats rather than [Frictionless][f11s].
   * If you want to have frictionless data you have to use [CKAN<=>Frictionless Mapper][c2f].
   * [ckan-api]: https://docs.ckan.org/en/2.8/api/
   * @memberof Client
   * @example
   * const response = await client.action('package_update', {
   *   id: '03de2e7a-6e52-4410-b6b1-49491f0f4d5a',
   *   title: 'New title',
   * })
   * console.log(response.result)
   * @async
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
   * @example
   * const dataset = await client.create({
   *   name: 'market',
   * })
   * console.log(dataset)
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
   * @example
   * const dataset = await client.retrieve('03de2e7a-6e52-4410-b6b1-49491f0f4d5a')
   * const dataset = await client.retrieve('market')
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
   * Upload a blob to storage
   *
   * This will return a promise that can be resolve to 'true' if the file has
   * been uploaded successfully, or `false` if the file was not uploaded
   * because it already exists in storage. Either case can be considered a
   * success.
   *
   * Any kind of failure to upload will trigger an exception.
   *
   * @param {File} resource
   * @param {CallableFunction} onProgress
   * @returns {Promise<boolean>}
   */
  async pushBlob(resource, onProgress) {
    // Get the JWT token
    const token = await this.getUploadAuthToken()

    const lfsClient = new LfsClient.GitLfsClient(this.lfsServerUrl, {
      "Authorization": `Bearer ${token}`
    })

    return await lfsClient.upload(resource, this.organizationId, this.datasetId, onProgress);
  }
}

module.exports = {
  Client,
}
