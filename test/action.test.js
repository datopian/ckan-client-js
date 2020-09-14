const test = require('ava')
const nock = require('nock')
const urlParser = require('url')

const { Client } = require('../lib/index')

const config = {
  api: 'http://ckan:5000',
  authToken: '5f492394-630d-4759-92f4-000f279dd71b',
  organizationId: 'demo-organization',
  datasetId: 'my-first-dataset',
}

const client = new Client(
  config.authToken,
  config.organizationId,
  config.datasetId,
  config.api
)

test('pass correct action name and payload', async (t) => {
  const responseMock = {
    success: true,
    result: {
      foo: 'bar',
      bar: 'foo',
    },
  }

  const payload = {
    someDataPropString: 'some value',
    someDataPropBoolean: true,
  }

  const actionName = 'some_action_name'

  let scope = nock(config.api)
    .post(`/api/3/action/${actionName}`, (body) => {
      t.deepEqual(body, payload)
      return true
    })
    .reply(200, (url) => {
      return responseMock
    })

  const response = await client.action(actionName, payload)

  t.is(scope.isDone(), true)
  t.deepEqual(response, responseMock)
})

test('able to force get', async (t) => {
  const responseMock = {
    success: true,
    result: {
      foo: 'bar',
      bar: 'foo',
    },
  }

  const payload = {
    someDataPropString: 'some value',
    someDataPropBoolean: true,
    foo: 'bar',
  }

  const actionName = 'some_action_name'

  let scope = nock(config.api)
    .get(`/api/3/action/${actionName}`)
    .query(true)
    .reply(200, (url) => {
      const queryObject = urlParser.parse(url, true).query
      t.is(client.api, config.api)
      t.deepEqual(queryObject, {
        some_data_prop_string: 'some value',
        some_data_prop_boolean: 'true',
        foo: 'bar',
      })
      return responseMock
    })

  const response = await client.action(actionName, payload, true)

  t.is(scope.isDone(), true)
  t.deepEqual(response, responseMock)
})
