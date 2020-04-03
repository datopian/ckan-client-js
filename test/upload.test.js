const test = require('ava')
const nock = require('nock')

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
    scope: ['ds:dataset-organization/dataset-name']
  },
}

const accessGranterConfig = {
  body: {
    "operation": "upload",
    "transfers": [ "basic" ],
    "ref": { "name": "refs/heads/contrib" },
    "objects": [
      {
        "oid": '8857053d874453bbe8e7613b09874e2d8fc9ddffd2130a579ca918301c31b369',
        "size": 36
      }
    ]
  },
  headers: {
    Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMi===',
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
      requested_scopes: ckanAuthzConfig.body.scope,
      granted_scopes: ckanAuthzConfig.body.scope,
      token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMi===',
      user_id: 'ckan_admin',
      expires_at: '2020-03-27T19:01:15.714553+00:00',
    },
  }
)

const mainAuthzMock_forCloudStorageAccessGranterServiceMock = nock(config.api)
  .persist()
  .post('/api/3/action/dataset-organization/dataset-name.git/info/lfs/objects/batch', accessGranterConfig.body)
  .reply(200, {
    transfer: 'basic',
    objects: [
      {
        oid: '8857053d874453bbe8e7613b09874e2d8fc9ddffd2130a579ca918301c31b369',
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

  const dataset = await Dataset.load('test/fixtures/dp-test')

  await datahub.push(dataset, ckanAuthzConfig.body.scope)

  t.is(ckanAuthzMock.isDone(), true)
  t.is(mainAuthzMock_forCloudStorageAccessGranterServiceMock.isDone(), true)
  t.is(cloudStorageMock.isDone(), true)
  t.is(verifyFileUploadMock.isDone(), true)
})
