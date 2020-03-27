const test = require('ava')
const nock = require('nock')

const { Upload } = require('../lib/index')

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
}

/**
 * Instance of the Upload class
 */
const datahub = new Upload(
  config.token,
  config.profile.id,
  config.profile.username,
  config.api
)

/**
 * Start test
 */
test('should return JWT token from ckanAuthz', async t => {
  const body = {
    scope: ['res:my_resource_id:create'],
    lifetime: 5000,
  }
  const ckanAuthzScope = nock(config.api)
    .persist()
    .post('/api/3/action/authz_authorize', body)
    .reply(200, {
      help: 'http://ckan:5000/api/3/action/help_show?name=authz_authorize',
      success: true,
      result: {
        requested_scopes: ['org:*:read'],
        granted_scopes: [],
        token:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOiIiLCJuYW1lIjpudWxsLCJpc3MiOiJodHRwOi8vY2thbjo1MDAwIiwiZXhwIjoxNTg1MzM1Njc1LCJuYmYiOjE1ODUzMzQ3NzUsInN1YiI6ImNrYW5fYWRtaW4ifQ.V_Ubtrg8fC4weVCEoBKNmanRQRz_9Z3pJwHY_st_VEPAvWr4V6xI6QHQoCLKPzJ9yTc1tAOCexH_gcAyGvbGWCdHndc4rsBRRNo85e9JmdOW_2NYpnvc1pI64QGxar9Rda_IQbmLJAqaWNplKwYiRaN7bKf18Wq7KyjuvA-YlAntDTUl0Qy8ekzrnezkJDIQJJ0PVEbOZkvYppk6-2QqutiFrVcF_dR26oxl6k49Gcl07sIMgTMi5D4RTEEploLXYSXsZhz5JVHKD5_dsqAF1boCd8HuMY8_kNpJ11uMij5ZBXZpIHw8bKLE4fdrDIu3u03MUplw1TvTZQox-_1vraBfnc_RBejKJ6ZlNrdXnAZThLtt0t3FNy1bAC-rLrKikfTsUNyBtNVcgLzTn-KLE42BbHXIM406Rnn3rQR1flcUnb0qOvPPCuyK02b9SGvZXuUTemsrFIg4vqXwISmXhZgX4a6vki_u9-pPap9teJsRih4dNo1kbb3Iam2WKMxADSjr5qINd8YSAVNuI5qwoCSLCXM_TcWi6zni5cV2GbxPZ8SNNEfLQ-FVcI9WHd-2Tj1f06bNor9PI-ySf8FXjh8UG9n8EUIQHjfW_Hm8UIDCUfFjx0f6rKAK7BN3r_vPol_bKMyoG_s7W0t3Q5OfXs0tzEduWMn9fkgEV6nNvcA',
        user_id: 'ckan_admin',
        expires_at: '2020-03-27T19:01:15.714553+00:00',
      },
    })

  await datahub.push(body)

  t.is(ckanAuthzScope.isDone(), true)
})

/*
test('push works with a single file', async t => {
  const resource = {
    path: 'test/fixtures/sample.csv',
  }
  await datahub.push(resource)

  t.is(mainAuthzMock_forCloudStorageAccessGranterServiceMock.isDone(), true)
  // t.is(cloudStorageAccessGranterMock.isDone(), true)
  // t.is(storageMock.isDone(), true)
  // t.is(metastoreMock.isDone(), true)
})

const authzToekn = 'abc'

const mainAuthzMock_forCloudStorageAccessGranterServiceMock = nock(config.api)
  .persist()
  .post('/api/3/action/authz_authorize', body)
  .reply(200, {
    token: authzToekn,
    user_id: 'user_name',
    expires_at: '20200326T170624Z',
    requested_scopes: ['res:my_resource_id:create'],
    granted_scopes: ['res:my_resource_id:create'],
  })

const gitLFSScope = nock('https://git-server.com')
  .persist()
  // authzToken shows up here ...
  .post('/any-path', body) // this body is crucial - it should include info from authz
  .reply(200, {
    results: {
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
          },
        },
      ],
    },
  })












//const storageMock ...



test('should return blob url from GitLSF server', async t => {
  const body = {
    oid: '1111111',
    size: 123,
    hash: '',
  }
  const gitLFSScope = nock('https://git-server.com')
    .persist()
    .post('/any-path', body)
    .reply(200, {
      results: {
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
            },
          },
        ],
      },
    })

  await datahub.getBlobUrl(body)

  t.is(gitLFSScope.isDone(), true)
})

/**
 * Cloud storage
 *
 * S3 or Azure
 *
 * Azure reference: https://docs.microsoft.com/en-us/rest/api/storageservices/put-blob
 * Azure url: https://myaccount.blob.core.windows.net/mycontainer/myblob
 * scope ?
 * response ?
 */

//  const azureScope = nock('https://myaccount.blob.core.windows.net/mycontainer/')
//     .persist()
//     .post('/my-blob', body)
//     .reply(200, {})
