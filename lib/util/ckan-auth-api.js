const axios = require('axios')

const CkanAuthApi = {

  // Get an authorization token from ckanext-authz-service
  getJWTFromCkanAuthz: async (baseUrl, authToken, scope) => {
    const path = '/api/3/action/authz_authorize'
    const config = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: authToken,
      }
    }
    const body = {
      scopes: scope,
    }

    const response = await axios.post(`${baseUrl}${path}`, body, config)

    if (response.status !== 200) {
      throw `Ckan Authz Server: ${response.statusText}`
    }

    return response.data
  },

  // Send Batch API request to Git LFS server, get upload / verify actions using the authz token
  requestFileUploadActions: async (baseUrl, token, hash, size, organization, datasetId) => {
    const path = `/${organization}/${datasetId}/objects/batch`
    const body = {
      operation: 'upload',
      transfers: ['basic'],
      ref: { name: 'refs/heads/contrib' },
      objects: [
        {
          oid: await hash,
          size: size,
        },
      ],
    }
    const config = {
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        Authorization: `Bearer ${token}`,
      },
    }

    const response = await axios.post(`${baseUrl}${path}`, body, config)

    if (response.status !== 200) {
      throw response.statusText
    }

    return response.data
  },
}

module.exports = CkanAuthApi
