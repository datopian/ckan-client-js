const test = require('ava')
const nock = require('nock')
const f11s = require('frictionless.js')
const fs = require('fs')

const { Client } = require('../lib/index')

/**
 * Push stuff
 */
const config = {
  api: 'http://localhost:5000',
  authToken: 'be270cae-1c77-4853-b8c1-30b6cf5e9878',
  organizationId: 'myorg',
  datasetId: 'my_dataset',
}

const client = new Client(
  config.authToken,
  config.organizationId,
  config.datasetId,
  config.api
)

test('push a metadata', async (t) => {
  // Mock datasets
  const frictionlessDataset = JSON.parse(
    await fs.readFileSync(
      __dirname + '/mocks/frictionless-dataset-converted-from-ckan.json'
    )
  )
  const ckanDataset = JSON.parse(
    await fs.readFileSync(__dirname + '/mocks/ckan-dataset.json')
  )

  const packagePushMock = nock(config.api)
    .persist()
    .post('/api/3/action/package_update', (body) => {
      t.deepEqual(body, {
        notes: 'GDPs list',
        url: 'https://datopian.com',
        extras: [
          {
            key: 'schema',
            value:
              '{"fields":[{"name":"id","type":"integer"},{"name":"title","type":"string"}]}',
          },
        ],
        name: 'gdp',
        resources: [
          {
            name: 'data.csv',
            url: 'http://someplace.com/data.csv',
            size: 100,
          },
        ],
      })
      return true
    })
    .reply(200, {
      help: 'http://localhost:5000/api/3/action/help_show?name=package_create',
      success: true,
      result: ckanDataset,
    })

  const response = await client.push(frictionlessDataset)

  t.is(packagePushMock.isDone(), true)
  t.deepEqual(response, frictionlessDataset)
})

test('create a metadata', async (t) => {
  // Mock datasets
  const frictionlessDataset = JSON.parse(
    await fs.readFileSync(
      __dirname + '/mocks/frictionless-dataset-converted-from-ckan.json'
    )
  )
  const ckanDataset = JSON.parse(
    await fs.readFileSync(__dirname + '/mocks/ckan-dataset.json')
  )

  // test with object
  let packageCreateMock = nock(config.api)
    .post('/api/3/action/package_create', (body) => {
      t.deepEqual(body, {
        notes: 'GDPs list',
        url: 'https://datopian.com',
        extras: [
          {
            key: 'schema',
            value:
              '{"fields":[{"name":"id","type":"integer"},{"name":"title","type":"string"}]}',
          },
        ],
        name: 'gdp',
        resources: [
          {
            name: 'data.csv',
            url: 'http://someplace.com/data.csv',
            size: 100,
          },
        ],
      })
      return true
    })
    .reply(200, {
      help: 'http://localhost:5000/api/3/action/help_show?name=package_create',
      success: true,
      result: ckanDataset,
    })

  let response = await client.create(frictionlessDataset)

  t.is(packageCreateMock.isDone(), true)
  t.deepEqual(response, frictionlessDataset)

  // test with string
  packageCreateMock = nock(config.api)
    .persist()
    .post('/api/3/action/package_create', (body) => {
      t.deepEqual(body, {
        name: 'My Dataset Name',
      })
      return true
    })
    .reply(200, {
      help: 'http://localhost:5000/api/3/action/help_show?name=package_create',
      success: true,
      result: {
        name: 'My Dataset Name',
      },
    })

  response = await client.create('My Dataset Name')

  t.is(packageCreateMock.isDone(), true)
  t.deepEqual(response, {
    name: 'My Dataset Name',
  })
})
