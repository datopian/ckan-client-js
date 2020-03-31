const createFormData = require('./form-data')
const createHashFromFile = require('./hash')
const getHeaders = require('./headers')
const CkanVersioningAPI = require('./util/ckan-upload-api')

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

  async push(resource) {
    const ckanAuthz = await CkanVersioningAPI.getJWTFromCkanAuthz(this.api, this.key)
    const accessGranter = await CkanVersioningAPI.getCloudStorageAccessGranterService(ckanAuthz.result.token)
    const cloudStorage = await CkanVersioningAPI.uploadBlobToCloudStorage(accessGranter.objects[0].actions.upload)
    const verifyUpload = await CkanVersioningAPI.verifyUpload(accessGranter.objects[0].actions.verify.href)

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
