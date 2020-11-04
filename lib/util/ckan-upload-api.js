const axios = require('axios')

const CkanUploadAPI = {
  // Send a POST request with specific payload to the URL given by the Batch API response
  pushDataToBlobStorage: async (actions, resource, onProgress) => {
    const { href, header } = actions
    const { buffer } = resource
    // browser file object
    const file = resource.descriptor

    let body = file

    if (typeof window !== 'undefined') {
      // if it's in Node env then add the buffer
      // TODO probably for Node we need to pass stream
      body = await buffer
    }

    const config = {
      headers: { ...header, 'Content-Type': file.type },
    }

    if (onProgress) {
      config.onUploadProgress = onProgress
    }

    const response = await axios.put(href, body, config)
    if (Math.floor(response.status / 100) !== 2) {
      throw 'Uploading the file to storage failed'
    }

    return true
  },

  // Get request to the verify URL given by the Batch API response
  verifyUpload: async (action, hash, size) => {
    const body = JSON.stringify({
      oid: hash,
      size: size,
    })
    const config = {
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        ...action.header,
      },
    }

    const response = await axios.post(action.href, body, config)

    // If the file is not found will return code 404 with a { message: 'The object was not found'}
    if (response.status !== 200) {
      throw response.message
    }

    return true
  },
}

module.exports = CkanUploadAPI
