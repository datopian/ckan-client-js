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

  async ckanAuthz() {
    // Create the scope to send to CkanAuthz
    let scope = [`obj:${this.organizationId}/${this.datasetId}/*:write`]

    // Get the JWT token from CkanAuthz
    const response = await CkanAuthApi.getJWTFromCkanAuthz(this.api, this.authToken, scope)
    return response
  }

  /**
   * @param {File} file
   * @param {string} token
   */
  async push(file, token, onProgress) {

    // Given the JWT token and file size, will return signed URL, verify URL and JWT token
    const lfs = await CkanAuthApi.requestFileUploadActions(this.api, token, file.sha256(), file.size(), this.organizationId, this.datasetId)
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
      await CkanUploadAPI.uploadToStorage(object.actions.upload, file.content(), onProgress)
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
  DataHub,
  FileAPI
}
