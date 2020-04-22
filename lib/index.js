const CkanAuthApi = require('./util/ckan-auth-api')
const CkanUploadAPI = require('./util/ckan-upload-api')
const FileAPI = require('./file')

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

  /**
   * @param {File} file
   * @param {string} token
   */
  async push(file, token) {

    // NOTE: Only work with gd
    // create the scope to send to CkanAuthz
    let scope = [`obj:${this.organizationId}/${this.datasetId}/*:write`]

    // Get the JWT token from CkanAuthz
    // const ckanAuthz = await CkanAuthApi.getJWTFromCkanAuthz(this.api, this.authToken, scope)

    // Given the JWT token and file size, will return signed URL, verify URL and JWT token
    // TODO: allow to have different transfer adapters
    const lfsResponse = await CkanAuthApi.requestFileUploadActions(this.api, token, file.sha256(), file.size(), this.organizationId, this.datasetId)

    // Check accessGranter objects actions is empty before upload
    const verifyActionResponse = await CkanUploadAPI.validateActionsBeforeUpload(lfsResponse.objects[0].actions)

    if (verifyActionResponse.error) {
      return  { verifyAction: verifyActionResponse }
    }

    // Upload the file to cloud storage
    const cloudStorage = await CkanUploadAPI.uploadToStorage(lfsResponse.objects[0].actions.upload, file.content())

    // If cloud storage return 201(OK), Get request to verify signed URL.
    const verifyUpload = await CkanUploadAPI.verifyUpload(lfsResponse.objects[0].actions.verify.href, lfsResponse.objects[0].actions.verify.header)
    return {
      lfs: lfsResponse,
      cloudStorage,
      verifyAction: verifyActionResponse,
      verifyUpload
    }
  }
}

module.exports = {
  DataHub,
  FileAPI
}
