const axios = require('axios')

const CkanAuthApi = {
  // Get an authorization token from ckanext-authz-service
  getJWTFromCkanAuthz: async (baseUrl, authToken, scope, headers) => {
    const path = '/api/3/action/authz_authorize'
    const config = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: authToken,
        ...headers,
      },
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
}

module.exports = CkanAuthApi
