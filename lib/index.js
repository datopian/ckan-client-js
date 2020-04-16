const lodash = require('lodash')
const { Dataset, File, open } = require('data.js')

const createFormData = require('./form-data')
const createHashFromFile = require('./hash')
const CkanAuthApi = require('./util/ckan-auth-api')
const CkanUploadAPI = require('./util/ckan-upload-api')

/**
 * @class DataHub.
 * @param {string} authToken
 * @param {number} organizationId
 * @param {string} datasetId
 * @param {string} api
 */
class DataHub {
  constructor(authToken, organizationId, datasetId, api) {
    this.authToken = authToken
    this.organizationId = organizationId
    this.datasetId = datasetId
    this.api = api
  }

  async push(resources) {

    const { basePath, path } = resources

    // create formData, get file size and generate the hash
    const file = createFormData(basePath, this.datasetName)
    const fileSize = open(`${basePath}/${path}`).size
    const hash = await createHashFromFile(`${basePath}/${path}`)

    // NOTE: Only work with gd
    // create the scope to send to CkanAuthz
    let scope = [`obj:${this.organizationId}/${this.datasetId}/*:write`]

    // Get the JWT token from CkanAuthz
    const ckanAuthz = await CkanAuthApi.getJWTFromCkanAuthz(this.api, this.authToken, scope)

    // Given the JWT token and file size, will return signed URL, verify URL and JWT token
    // TODO: allow to have diferents transfer adapters
    const accessGranter = await CkanAuthApi.getCloudStorageAccessGranterService(this.api, ckanAuthz.result.token, hash, this.organizationId, this.datasetId, fileSize)

    // Check accessGranter objects actions is empty before upload
    await CkanUploadAPI.validateActionsBeforeUpload(accessGranter.objects[0].actions)

    // Upload the file to cloud storage
    const cloudStorage = await CkanUploadAPI.uploadToStorage(accessGranter.objects[0].actions.upload, file)

    // If cloud storage return 201(OK), Get request to verify signed URL.
    const verifyUpload = await CkanUploadAPI.verifyUpload(accessGranter.objects[0].actions.verify.href, accessGranter.objects[0].actions.verify.header)
  }
}

module.exports = {
  DataHub,
}
