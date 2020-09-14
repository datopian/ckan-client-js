const axios = require('axios')

const ActionApi = {
  // Call the ckan api actions ie. 'package_create'
  action: async (baseUrl, authToken, actionType, data) => {
    const path = `/api/3/action/${actionType}`
    const config = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: authToken,
      },
    }
    const body = JSON.stringify(data)

    const response = await axios.post(`${baseUrl}${path}`, data, config)
    if (!response.data.success) {
      throw `Action response: ${response.statusText}`
    }

    return response.data
  },
  getActions: async (baseUrl, authToken, actionType, params) => {
    const path = `/api/3/action/${actionType}`
    const config = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: authToken,
      },
      params,
    }

    const response = await axios.get(`${baseUrl}${path}`, config)
    if (!response.data.success) {
      throw `Action response: ${response.statusText}`
    }

    return response.data
  },
}

module.exports = ActionApi
