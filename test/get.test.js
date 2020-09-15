const test = require('ava')
const nock = require('nock')
const urlParser = require('url')

const { Client } = require('../lib/index')
const fs = require('fs')

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

test('get package', async (t) => {
  const getPackageResponseMock = JSON.parse(
    await fs.readFileSync(__dirname + '/mocks/getPackageCkanResponse.json')
  )
  const packageResponseConvertedToFrictionless = JSON.parse(
    await fs.readFileSync(
      __dirname + '/mocks/frictionless-dataset-converted-from-ckan.json'
    )
  )
  // Testing dataname/id
  let scope = nock(config.api)
    .get('/api/3/action/package_show')
    .query(true)
    .reply(200, (url) => {
      const queryObject = urlParser.parse(url, true).query
      t.is(client.api, config.api)
      t.deepEqual(queryObject, {
        name_or_id: 'my_dataset',
      })
      return getPackageResponseMock
    })

  const response = await client.retrieve('my_dataset')

  t.is(scope.isDone(), true)
  t.deepEqual(response, packageResponseConvertedToFrictionless)
})
