const fetch = require('node-fetch')

const CkanVersioningAPI = {
  getJWTFromCkanAuthz: async (api, key, scope) => {
    const path = '/api/3/action/authz_authorize'
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: key,
      },
      body: JSON.stringify({
        scope: scope,
      }),
    }

    const response = await fetch(`${api}${path}`, config)

    if (response.status !== 200) {
      throw new Error(`Ckan Authz Server: ${response.statusText}`)
    }

    return await response.json()
  },
  getCloudStorageAccessGranterService: async (api, token, hash, datasetId, size) => {
    const path = '/api/3/action/cloud-storage-access-granter'
    //TODO: ask shahar about the right path url, is this bellow
    //const path = '/api/3/${organization}/${datasetId}/objects/batch'
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(
      {
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
  verifyUpload: async url => {
    const response = await fetch(url)

    if (response.status !== 200) {
      throw new Error(`Verify upload: ${response.statusText}`)
    }

    return response.json()
  },
}

module.exports = CkanVersioningAPI
