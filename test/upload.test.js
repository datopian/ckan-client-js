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
  },
  ckanAuthzBody: {
    scope: ['res:my_resource_id:create'],
    lifetime: 5000,
  },
  accessGranterApi: 'https://git-server.com',
  accessGranterBody: {
    oid: '1111111',
    size: 123,
    hash: 'JWT-Token',
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
  .post('/api/3/action/authz_authorize', config.ckanAuthzBody)
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

const mainAuthzMock_forCloudStorageAccessGranterServiceMock = nock(
  config.accessGranterApi
)
  .persist()
  .filteringRequestBody(body => config.accessGranterBody)
  .post('/any-path', config.accessGranterBody)
  .reply(200, {
    transfer: 'basic',
    objects: [
      {
        oid: '1111111',
        size: 123,
        authenticated: true,
        actions: {
          upload: {
            href: 'https://some-upload.com/1111111',
            header: {
              Authorization: 'Basic ...',
            },
            expires_in: 86400,
          },
          verify: {
            href: 'https://some-verify-callback.com',
            header: {
              Authorization: 'Basic ...',
            },
            expires_in: 86400,
          },
        },
      },
    ],
  })

const cloudStorageMock = nock(
  'https://myaccount.blob.core.windows.net/mycontainer/',
  {
    reqheaders: {
      'x-ms-version': '2015-02-21 ',
      'x-ms-date': '2015-02-21',
      'Content-Type': 'text/plain; charset=UTF-8',
      'x-ms-blob-content-disposition': "attachment; filename='fname.ext'",
      'x-ms-blob-type': 'BlockBlob',
      'x-ms-meta-m1': 'v1 ',
      'x-ms-meta-m2': 'v2',
      Authorization:
        'SharedKey myaccount:YhuFJjN4fAR8/AmBrqBz7MG2uFinQ4rkh4dscbj598g= ',
      'Content-Length': 11,
    },
  }
)
  .persist()
  .put('/my-blob', {})
  .reply(200, {}, {
    'Transfer-Encoding': 'chunked',
    'Content-MD5': 'sQqNsWTgdUEFt6mb5y4/5Q==',
    'x-ms-content-crc64': '77uWZTolTHU',
    Date: '2015-02-21',
    ETag: '0x8CB171BA9E94B0B',
    'Last-Modified': '2015-02-21',
    'Access-Control-Allow-Origin': 'http://contoso.com',
    'Access-Control-Expose-Headers': 'Content-MD5',
    'Access-Control-Allow-Credentials': true,
    Server: 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0',
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
  const resource = {
    path: 'test/fixtures/sample.csv',
  }
  await datahub.push(resource)

  t.is(ckanAuthzMock.isDone(), true)
  t.is(mainAuthzMock_forCloudStorageAccessGranterServiceMock.isDone(), true)
  // t.is(cloudStorageMock.isDone(), true)
})
