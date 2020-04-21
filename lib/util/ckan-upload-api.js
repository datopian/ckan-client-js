const fetch = require('node-fetch')
const lodash = require('lodash')

const CkanUploadAPI = {

  // Check accessGranter objects actions is empty
  validateActionsBeforeUpload: (actions) => {
    return new Promise((resolve, reject) => {
      const actionsIsEmpty = lodash.isEmpty(actions)
      if (actionsIsEmpty) {
        throw new Error("Actions is empty!")
      }
      resolve(actions)
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

    const response = await fetch(href, config)

    if (response.status !== 201) {
      throw new Error(`Cloud Storage: ${response.statusText}`)
    }

    return response.json()
  },

  // Get request to the verify URL given by the Batch API response
  verifyUpload: async (url, headers) => {
    const config = {
      method: 'GET',
      headers
    }
    const response = await fetch(url, config)
    // If the file is not found will return code 404 with a { message: 'The object was not found'}
    return response.json()
  },
}

module.exports = CkanUploadAPI
