const fetch = require('node-fetch')

const CkanVersioningAPI = {
  getJWTFromCkanAuthz: async (api, key) => {
    const path = '/api/3/action/authz_authorize'
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: key,
      },
      body: JSON.stringify({
        scope: ['res:my_resource_id:create'],
        lifetime: 5000,
      }),
    }

    const response = await fetch(`${api}${path}`, config)

    if (response.status !== 200) {
      throw new Error(`Ckan Authz Server: ${response.statusText}`)
    }

    return response.json()
  },
  getCloudStorageAccessGranterService: async token => {
    const url = 'https://git-server.com/any-path'
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
      },
      body: JSON.stringify({
        oid: '1111111',
        size: 123,
        hash: token,
      }),
    }

    const response = await fetch(url, config)

    if (response.status !== 200) {
      throw new Error(
        `Cloud Storage Access Granter Server: ${response.statusText}`
      )
    }
    return response.json()
  },
  uploadBlobToCloudStorage: async actions => {
    const { href, header, expire_in } = actions
    const config = {
      method: 'PUT',
      headers: header,
      body: JSON.stringify({}),
    }

    const response = await fetch(href, config)

    if (response.status !== 200) {
      throw new Error(`Cloud Storage: ${response.statusText}`)
    }

    return response.json()
  },
  verifyUpload: async url => {
    const response = await fetch(url)

    if (response.status !== 200) {
      throw new Error(`Verify upload: ${response.statusText}`)
    }

    return response.json()
  },
}

module.exports = CkanVersioningAPI
