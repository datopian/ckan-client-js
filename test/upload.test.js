const test = require('ava')
const nock = require('nock')
const path = require('path')

const { DataHub } = require('../lib/index')
const { Dataset, File } = require('data.js')

/**
 * Push stuff
 */
const config = {
  token: 'b70e2e12-f885-40d9-a297-f823651b111c',
  api: 'http://localhost:5000',
  profile: {
    id: 'test-userid',
    username: 'test-username',
    unauthorizedScope: ['ds:*:metadata:create'],
  },
}

const ckanAuthzConfig = {
  body: {
    scope: ['org:*:read'],
    dataset_id: 'test'
  },
}

const accessGranterConfig = {
  api: 'https://git-server.com',
  body: {
    oid: 'hash of the file',
    size: 123,
  },
  headers: {
    Authorization: 'Bearer TOKEN',
  },
}

const cloudStorageConfig = {
  api: 'https://myaccount.blob.core.windows.net/mycontainer',
  path: '/my-blob',
  body: {
    meta: {
      version: 1,
      ownerid: 'test-userid',
      owner: 'test-username',
      dataset: 'iso',
      findability: 'unlisted',
    },
    inputs: [],
  },
}

/**
 * Instance of the Upload class
 */
const datahub = new DataHub(
  config.token,
  config.profile.id,
  config.profile.username,
  config.api
)

/**
 * Mock
 */
const ckanAuthzMock = nock(config.api)
  .persist()
  .post('/api/3/action/authz_authorize', ckanAuthzConfig.body)
  .reply(200, {
    help: 'http://ckan:5000/api/3/action/help_show?name=authz_authorize',
    success: true,
    result: {
      requested_scopes: ['org:*:read'],
      granted_scopes: [],
      token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMi===',
      user_id: 'ckan_admin',
      expires_at: '2020-03-27T19:01:15.714553+00:00',
    },
  })

const mainAuthzMock_forCloudStorageAccessGranterServiceMock = nock(config.api)
  .persist()
  .filteringRequestBody(body => accessGranterConfig.body)
  .post('/api/3/action/cloud-storage-access-granter', accessGranterConfig.body)
  .reply(200, {
    transfer: 'basic',
    objects: [
      {
        oid: '1111111', //TODO: change for the hash of the file
        size: 123,
        authenticated: true,
        actions: {
          upload: {
            href: 'https://myaccount.blob.core.windows.net/mycontainer/my-blob',
            header: accessGranterConfig.headers,
            expires_in: 86400,
          },
          verify: {
            href: 'https://some-verify-callback.com',
            header: {
              Authorization: 'Bearer TOKEN',
            },
            expires_in: 86400,
          },
        },
      },
    ],
  })

const cloudStorageMock = nock(cloudStorageConfig.api, {
  reqheaders: accessGranterConfig.headers,
})
  .persist()
  .filteringRequestBody(body => cloudStorageConfig.body)
  .put(cloudStorageConfig.path, cloudStorageConfig.body)
  .reply(201, { success: true }) // The return of the azure is only 201 - ok

const verifyFileUploadMock = nock('https://some-verify-callback.com')
  .persist()
  .get('/')
  .reply(200, {
    success: true,
  })

/**
 * Start test
 */
test('Can instantiate DataHub', t => {
  const datahub = new DataHub(
    config.token,
    config.profile.id,
    config.profile.username,
    config.api
  )
  t.is(datahub.api, config.api)
})

test('Push works with packaged dataset', async t => {
  const filePath = 'test/fixtures/sample.csv'
  const scope = ['org:*:read']
  const pathParts = path.parse(filePath)
  const file = File.load(pathParts.base, {basePath: pathParts.dir})
  const metadata = {
    name: 'this-is-a-test',
    resources: []
  }
  const dataset = await Dataset.load(metadata)
  dataset.addResource(file)

  await datahub.push(dataset, scope)

  t.is(ckanAuthzMock.isDone(), true)
  t.is(mainAuthzMock_forCloudStorageAccessGranterServiceMock.isDone(), true)
  t.is(cloudStorageMock.isDone(), true)
  t.is(verifyFileUploadMock.isDone(), true)
})
