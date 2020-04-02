const lodash = require('lodash')
const { Dataset, File } = require('data.js')

const createFormData = require('./form-data')
const createHashFromFile = require('./hash')
const getHeaders = require('./headers')
const CkanVersioningAPI = require('./util/ckan-upload-api')

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

  getFormData() {
    return createFormData(path, fileName)
  }

  async push(dataset, scope) {
    let resources = lodash.clone(dataset.resources)
    // Check if remote resources are
    // If every thing is fine, you should see output like what is shown below with a link to your file, which is OK:
    await Promise.all(
      resources.map(async res => {
        if (res.descriptor.pathType === 'remote') {
          await checkUrlIsOK(res.descriptor.path)
        }
      })
    )
    // Exclude remote Resources
    resources = resources.filter(res => res.descriptor.pathType === 'local')
    // Get Dataset itself (datapackage.json) as an (Inline) File
    const _descriptor = lodash.cloneDeep(dataset.descriptor)
    const dpJsonResource = File.load({
      path: 'datapackage.json',
      name: 'datapackage.json',
      data: _descriptor,
    })

    resources.push(dpJsonResource)

    this.rawstore(resources, scope)

    /**
     * TODO:
     *  - [ ] ckanAuthz - change the test string to the datasetId and check the scope
     *  - [ ] accessGranter - change the hash, test string, 231 to (hash, datasetId, size)
     *  - [ ] cloudStorage - add the body
     */
    const ckanAuthz = await CkanVersioningAPI.getJWTFromCkanAuthz(this.api, this.key, scope, 'test')
    const accessGranter = await CkanVersioningAPI.getCloudStorageAccessGranterService(this.api,ckanAuthz.result.token,'hash','test',231)
    const cloudStorage = await CkanVersioningAPI.uploadBlobToCloudStorage(accessGranter.objects[0].actions.upload)
    const verifyUpload = await CkanVersioningAPI.verifyUpload(accessGranter.objects[0].actions.verify.href)
  }

  async rawstore(resources, options = {}) {
    const fileData = {}
    resources.forEach(resource => {
      fileData[resource.descriptor.path] = {
        length: resource.size,
        md5: resource.hash,
        name: resource.descriptor.name,
      }
    })

    const body = {
      metadata: {
        owner: this.ownerId,
        findability: options.findability,
      },
      filedata: fileData,
    }

    return body
  }
}

module.exports = {
  DataHub,
}
