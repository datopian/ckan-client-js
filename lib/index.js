const lodash = require('lodash')
const { Dataset, File, open } = require('data.js')

const createFormData = require('./form-data')
const createHashFromFile = require('./hash')
const CkanAuthApi = require('./util/ckan-auth-api')
const CkanUploadAPI = require('./util/ckan-upload-api')

/**
 * @class DataHub.
 * @param {string} key
 * @param {number} ownerId
 * @param {string} owner
 * @param {string} api
 */
class DataHub {
  constructor(key, ownerId, owner, api) {
    this.key = key
    this.ownerId = ownerId
    this.owner = owner
    this.api = api
  }

  async push(dataset) {
    let resources = lodash.clone(dataset.resources)

    // Check if remote resources are
    // If every thing is fine, you should see output like what is shown below with a link to your file, which is OK:
    await Promise.all(resources.map(async (res) => {
      if (res.descriptor.pathType === 'remote') {
        await checkUrlIsOK(res.descriptor.path)
      }
    }))

    // Exclude remote Resources
    resources = resources.filter(res => res.descriptor.pathType === 'local')

    // Get Dataset itself (datapackage.json) as an (Inline) File
    const _descriptor = lodash.cloneDeep(dataset.descriptor)
    const dpJsonResource = File.load({
      path: 'datapackage.json',
      name: 'datapackage.json',
      data: _descriptor
    })

    resources.push(dpJsonResource)

    // extract path(s) and name of the file
    const basePath = resources[0]._basePath
    const path = resources[0]._descriptor.path
    const name = dataset.descriptor.name
    const organization = dataset.descriptor.organization

    // create formData, get file size and generate the hash
    const file = createFormData(basePath, name)
    const fileSize = open(`${basePath}/${path}`).size
    const hash = await createHashFromFile(`${basePath}/${path}`)

    // NOTE: Only work with gd
    // create the scope to send to CkanAuthz
    let scope = [`obj:${organization}/${name}/*:write`]

    // Get the JWT token from CkanAuthz
    const ckanAuthz = await CkanAuthApi.getJWTFromCkanAuthz(this.api, this.key, scope)

    // Given the JWT token and file size, will return signed URL, verify URL and JWT token
    // TODO: allow to have diferents transfer adapters
    const accessGranter = await CkanAuthApi.getCloudStorageAccessGranterService(this.api, ckanAuthz.result.token, hash, organization, name, fileSize)

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
