const fetch = require('node-fetch')
const lodash = require('lodash')

const CkanUploadAPI = {

  // Check accessGranter objects actions is empty
  validateActionsBeforeUpload: async (actions) => {
    return await new Promise((resolve, reject) => {
      const actionsIsEmpty = lodash.isEmpty(actions)
      const verifyResponse = {
        message: "",
        error: false
      }
      if (actionsIsEmpty) {
        verifyResponse.message = "The file already is in storage."
        verifyResponse.error = true

        resolve(verifyResponse)
      }
      resolve(verifyResponse)
    });
  },

  // Send a POST request with specific payload to the URL given by the Batch API response
  uploadToStorage: async (actions, fileContent) => {
    const { href, header } = actions
    const config = {
      method: 'PUT',
      headers: header,
      body: await fileContent,
    }
    const uploadResponse = {
      message: "",
      success: false,
      error: false
    }
    const response = await fetch(href, config)

    if (response.status !== 201) {
      uploadResponse.message = "Upload Failed!"
      uploadResponse.error = true
      uploadResponse.success = false

      return uploadResponse
    }

    uploadResponse.message = "File Uploaded Successfully"
    uploadResponse.error = false
    uploadResponse.success = true

    return uploadResponse
  },

  // Get request to the verify URL given by the Batch API response
  verifyUpload: async (url, headers) => {
    const config = {
      method: 'POST',
      headers
    }
    const verifyUploadResponse = {
      message: "",
      success: false,
      error: false
    }
    const response = await fetch(url, config)
    // If the file is not found will return code 404 with a { message: 'The object was not found'}
    if (response.status !== 200) {
      verifyUploadResponse.message = response.message
      verifyUploadResponse.error = true
      verifyUploadResponse.success = false

      return verifyUploadResponse
    }

    verifyUploadResponse.message = "Verify Uploaded Successfully"
    verifyUploadResponse.error = false
    verifyUploadResponse.success = true

    return verifyUploadResponse
  },
}

module.exports = CkanUploadAPI
