const fetch = require('node-fetch')

const CkanAuthApi = {

  // Get an authorization token from ckanext-authz-service
  getJWTFromCkanAuthz: async (api, key, scope) => {
    const path = '/api/3/action/authz_authorize'
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: key,
      },
      body: JSON.stringify({
        scopes: scope,
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
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        operation: 'upload',
        // TODO
        // study about polimofirm
        // look the giftless code to understand better
        transfers: ['basic'],
        ref: { name: 'refs/heads/contrib' },
        objects: [
          {
            oid: hash,
            size: size,
          },
        ],
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
}

module.exports = CkanAuthApi
