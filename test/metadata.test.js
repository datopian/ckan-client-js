const test = require('ava')
const nock = require('nock')
const f11s = require('data.js')
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
  package_id: 'my_dataset_name'
}

/**
 * Mock
 */
const packageCreateMock = nock(config.api)
  .persist()
  .post('/api/3/action/package_create', {
    "name": config.datasetId,
    "owner_org": config.organizationId,
  })
  .reply(200, {
    help: 'http://localhost:5000/api/3/action/help_show?name=package_create',
    success: true,
    result: {
      license_title: null,
      maintainer: null,
      relationships_as_object: [],
      private: false,
      maintainer_email: null,
      num_tags: 0,
      id: '3d27173c-dcbe-4c07-b1a9-70f683623f33',
      metadata_created: '2020-09-11T00:12:07.550325',
      metadata_modified: '2020-09-11T00:12:07.550334',
      author: null,
      author_email: null,
      state: 'active',
      version: null,
      creator_user_id: 'ceb0d8c2-352b-4a6c-b2c8-2a1a4190192b',
      type: 'dataset',
      resources: [],
      num_resources: 0,
      tags: [],
      groups: [],
      license_id: null,
      relationships_as_subject: [],
      organization: {
        description: 'my org',
        created: '2020-04-14T13:27:47.434967',
        title: 'myorg',
        name: 'myorg',
        is_organization: true,
        state: 'active',
        image_url: '',
        revision_id: 'bff67202-a21e-470b-9b67-14e65ad85fa2',
        type: 'organization',
        id: 'f3fce98a-4750-4d09-a5d1-d5e1b995a2e8',
        approval_status: 'approved',
      },
      name: 'my_dataset',
      isopen: false,
      url: null,
      notes: null,
      owner_org: 'f3fce98a-4750-4d09-a5d1-d5e1b995a2e8',
      extras: [],
      title: 'my_dataset',
      revision_id: '3b10c815-d8aa-4726-ba06-bff4cb5874cb',
    },
  })

const metadataMock = nock(config.api)
  .persist()
  .post('/api/3/action/package_create', metadataBody)
  .reply(200, {
    "help": "http://localhost:5000/api/3/action/help_show?name=package_create",
    "success": true,
    "result": {
      "license_title": null,
      "maintainer": null,
      "relationships_as_object": [],
      "private": false,
      "maintainer_email": null,
      "num_tags": 0,
      "id": "9a25bbb9-a21f-430c-88c7-291a7bb37350",
      "metadata_created": "2020-09-11T02:06:23.785055",
      "metadata_modified": "2020-09-11T02:06:23.785059",
      "author": null,
      "author_email": null,
      "state": "active",
      "version": null,
      "creator_user_id": "ceb0d8c2-352b-4a6c-b2c8-2a1a4190192b",
      "type": "dataset",
      "resources": [],
      "num_resources": 0,
      "tags": [],
      "groups": [],
      "license_id": null,
      "relationships_as_subject": [],
      "organization": {
        "description": "my org",
        "created": "2020-04-14T13:27:47.434967",
        "title": "myorg",
        "name": "myorg",
        "is_organization": true,
        "state": "active",
        "image_url": "",
        "revision_id": "bff67202-a21e-470b-9b67-14e65ad85fa2",
        "type": "organization",
        "id": "f3fce98a-4750-4d09-a5d1-d5e1b995a2e8",
        "approval_status": "approved"
      },
      "name": "sample",
      "isopen": false,
      "url": null,
      "notes": null,
      "owner_org": "f3fce98a-4750-4d09-a5d1-d5e1b995a2e8",
      "extras": [],
      "title": "sample",
      "revision_id": "341b8af7-3586-450a-b38a-98fb96a7afc4"
    }
  })

const resourceMock = nock(config.api)
  .persist()
  .post('/api/3/action/resource_create', resourceBody)
  .reply(200, {
    "help": "http://localhost:5000/api/3/action/help_show?name=resource_create",
    "success": true,
    "result": {
      "cache_last_updated": null,
      "package_id": "3a1aa4af-9f00-490b-956e-2b063ed04961",
      "datastore_active": false,
      "id": "d5f496ce-2fe2-48d3-898f-3c0cc22f4015",
      "size": null,
      "encoding": "UTF-8",
      "state": "active",
      "hash": "",
      "description": "",
      "format": "CSV",
      "mediatype": "text/csv",
      "pathType": "local",
      "mimetype_inner": null,
      "url_type": null,
      "path": "test/fixtures/sample.csv",
      "mimetype": null,
      "cache_url": null,
      "name": "sample",
      "created": "2020-09-11T02:51:20.697102",
      "url": "",
      "last_modified": null,
      "position": 3,
      "revision_id": "17aea680-6dc8-4ce4-ab8b-fec31996242c",
      "resource_type": null
    }
  })

test('create a dataset', async (t) => {
  const client = new Client(
    config.authToken,
    config.organizationId,
    config.datasetId,
    config.api
  )

  const response = await client.put('package_create', { "name": "my_dataset", "owner_org": "myorg"})

  t.is(client.api, config.api)
  t.is(packageCreateMock.isDone(), true)
  t.is(response.success, true)
  t.is(response.result.name, "my_dataset")
  t.is(response.result.organization.name, "myorg")
})

test('put metadata', async (t) => {
  const path = 'test/fixtures/sample.csv'
  const file = await f11s.open(path)
  const dataset = new f11s.Dataset({
    ...file.descriptor,
    resources: [],
  })

  const response = await client.put('package_create', dataset.descriptor)

  t.is(packageCreateMock.isDone(), true)
  t.is(response.success, true)
  t.is(response.result.name, "sample")
  t.deepEqual(response.result.resources, [])
})

test('put_resource create or update a resource', async (t) => {
  const path = 'test/fixtures/sample.csv'
  const file = await f11s.open(path)

  // Dataset must exist
  file.descriptor.package_id = "my_dataset_name"

  const response = await client.put('resource_create', file.descriptor)

  t.is(resourceMock.isDone(), true)
  t.is(response.success, true)
  t.is(response.result.name, "sample")
  t.is(response.result.format, "CSV")
  t.is(response.result.mediatype, "text/csv")
})
