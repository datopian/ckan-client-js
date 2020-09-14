const test = require('ava')
const f11s = require('data.js')
const { Client } = require('../lib/index')
const { getGetPackageMock } = require('./mocks/get.mocks')

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

const metadataBody = {
  path: 'test/fixtures/sample.csv',
  pathType: 'local',
  name: 'sample',
  format: 'csv',
  mediatype: 'text/csv',
  encoding: 'UTF-8',
  resources: [],
}

const resourceBody = {
  path: 'test/fixtures/sample.csv',
  pathType: 'local',
  name: 'sample',
  format: 'csv',
  mediatype: 'text/csv',
  encoding: 'UTF-8',
  package_id: 'my_dataset_name',
}

test('get a dataset', async (t) => {
  const client = new Client(
    config.authToken,
    config.organizationId,
    config.datasetId,
    config.api
  )

  const response = await client.getPackage({
    id: 'my_dataset',
    useDefaultSchema: false,
    includeTracking: false,
  })

  t.is(client.api, config.api)
  t.is(getGetPackageMock(config).isDone(), true)
  t.is(response.success, true)
  t.is(response.result.name, config.datasetId)
  t.is(response.result.organization.name, config.organizationId)
})
