const fetch = require('node-fetch')
const axios = require('axios')

const CkanUploadAPI = {

  // Send a POST request with specific payload to the URL given by the Batch API response
  uploadToStorage: async (actions, fileContent, onProgress) => {
    const { href, header } = actions
    const body = await fileContent
    const config = {
      headers: header
    }

    if (onProgress) {
      config.onUploadProgress = onProgress;
    }

    const response = await axios.put(href, body, config)
    if (response.status !== 201) {
      throw "Uploading the file to storage failed"
    }

    return true
  },

  // Get request to the verify URL given by the Batch API response
  verifyUpload: async (action, file) => {
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        ...action.header,
      },
      body: JSON.stringify({
        oid: await file.sha256(),
        size: file.size(),
      })
    }

    const response = await fetch(action.href, config)

    // If the file is not found will return code 404 with a { message: 'The object was not found'}
    if (response.status !== 200) {
      throw response.message
    }

    return true
  },
}

module.exports = CkanUploadAPI
