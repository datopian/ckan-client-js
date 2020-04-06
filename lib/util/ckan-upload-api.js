const fetch = require('node-fetch')

const CkanVersioningAPI = {

  // Get an authorization token from ckanext-authz-service
  getJWTFromCkanAuthz: async (api, key, scope) => {
    const path = '/api/3/action/authz_authorize'
    const config = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Authorization": key,
      },
      body: JSON.stringify({
        "scopes": scope
      }),
    }

    const response = await fetch(`${api}${path}`, config)

    if (response.status !== 200) {
      throw new Error(`Ckan Authz Server: ${response.statusText}`)
    }

    return response.json()
  },

  // Send Batch API request to Git LFS server, get upload / verify actions using the authz token
  getCloudStorageAccessGranterService: async (api, token, hash, organization, datasetId, size) => {
    const path = `/api/3/action/${organization}/${datasetId}/objects/batch`
    const config = {
      method: 'POST',
      headers: {
        "Accept": "application/vnd.git-lfs+json",
        "Content-Type": "application/vnd.git-lfs+json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        "operation": "upload",
        "transfers": [ "basic" ],
        "ref": { "name": "refs/heads/contrib" },
        "objects": [
          {
            "oid": hash,
            "size": size
          }
        ]
     }),
    }

    const response = await fetch(`${api}${path}`, config)

    if (response.status !== 200) {
      throw new Error(
        `Cloud Storage Access Granter Server: ${response.statusText}`
      )
    }
    return response.json()
  },

  // Send a POST request with specific payload to the URL given by the Batch API response
  uploadBlobToCloudStorage: async (actions, body) => {
    const { href, header, expire_in } = actions
    const config = {
      method: 'PUT',
      headers: header,
      body: JSON.stringify({body}),
    }

    const response = await fetch(href, config)

    if (response.status !== 201) {
      throw new Error(`Cloud Storage: ${response.statusText}`)
    }

    return response.json()
  },

  // Get request to the verify URL given by the Batch API response
  verifyUpload: async url => {
    const response = await fetch(url)

    // If the file is not found will return code 404 with a { message: 'The object was not found'}
    return response.json()
  },
}

module.exports = CkanVersioningAPI
