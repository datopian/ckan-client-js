const fetch = require('node-fetch')
const lodash = require('lodash')

const CkanUploadAPI = {

  // Check accessGranter objects actions is empty
  validateActionsBeforeUpload: async (lfsResponse) => {

    return await new Promise((resolve, reject) => {
      const actionsIsEmpty = lodash.isEmpty(lfsResponse.objects[0].actions)
      if (actionsIsEmpty) {
        reject("The file already is in storage.")
      }
      resolve({success: true})
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
      throw "Upload Failed!"
    }

    uploadResponse.message = "File Uploaded Successfully"
    uploadResponse.error = false
    uploadResponse.success = true

    return uploadResponse
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
    const verifyUploadResponse = {
      message: null,
      success: false,
    }
    const response = await fetch(action.href, config)

    // If the file is not found will return code 404 with a { message: 'The object was not found'}
    if (response.status !== 200) {
      throw response.message
    } else {
      verifyUploadResponse.message = "Verify Uploaded Successfully"
      verifyUploadResponse.success = true
    }

    return verifyUploadResponse
  },
}

module.exports = CkanUploadAPI
