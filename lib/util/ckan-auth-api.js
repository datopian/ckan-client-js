const fetch = require('node-fetch')

const CkanAuthApi = {

  // Get an authorization token from ckanext-authz-service
  getJWTFromCkanAuthz: async (baseUrl, authToken, scope) => {
    const path = '/api/3/action/authz_authorize'
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: authToken,
      },
      body: JSON.stringify({
        scopes: scope,
      }),
    }

    const response = await fetch(`${baseUrl}${path}`, config)

    if (response.status !== 200) {
      throw `Ckan Authz Server: ${response.statusText}`
    }

    return response.json()
  },

  // Send Batch API request to Git LFS server, get upload / verify actions using the authz token
  requestFileUploadActions: async (baseUrl, token, hash, size, organization, datasetId) => {
    const path = `/${organization}/${datasetId}/objects/batch`
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        operation: 'upload',
        transfers: ['basic'],
        ref: { name: 'refs/heads/contrib' },
        objects: [
          {
            oid: await hash,
            size: size,
          },
        ],
      }),
    }

    const response = await fetch(`${baseUrl}${path}`, config)

    if (response.status !== 200) {
      throw response.statusText
    }

    return response.json()
  },
}

module.exports = CkanAuthApi
