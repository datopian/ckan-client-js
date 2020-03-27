const path = require('path')
const assert = require('assert')
const nock = require('nock')
const test = require('ava')
// const urljoin = require('url-join')
const {Dataset, File} = require('data.js')
// const FinanceDp = require('./fixtures/finance-vix/datapackage.json')
const {DataHub} = require('../lib/datahub.js')


 // the idea of this test is ...
  //
  // to test the upload flow which is multi-step and involves interacting with several external services (~4)
  // we will have mocked out each of these services and then test that the upload flow has correctly called each of these services in turn
  // you can see a diagram of this flow here ... insert link (preferably in an issue - not scratch hackmd and that may disappear)
  // finally, we will test the return value of the function
  //
  // 0. has an api token (assumed to have this to start with ...)
  // 1. gets token authenticates with ckan authz
  // 2. gets token ckan storage token access issuer (git lfs)
  // 3. upload file(s) to storage using the token and relevant headers
    // file*s* test is for the future
  // 4. [update ckan metastore with the uploaded file info ... (as appropriate)]

test('Can instantiate DataHub', (t) => {
  const apiUrl = 'https://apifix.datahub.io'
  const token = ''
  const datahub = new DataHub({apiUrl, token})
  t.is(datahub.apiUrl, apiUrl)
})

// =====================
// Push stuff

const config = {
  token: 't35tt0k3N',
  api: 'https://test.com',
  profile: {
    id: 'test-userid',
    username: 'test-username'
  }
}

const datahub = new DataHub({apiUrl: config.api, token: config.token, ownerid: config.profile.id, owner: config.profile.username})

const dpinfo = {
  md5: 'm84YSonibUrw5Mg8QbCNHA==',
  length: 72,
  name: 'datapackage.json'
}

const rawstoreUrl = 'https://s3-us-west-2.amazonaws.com'

/**
 * In Ckan Authz a successful response will include a JWT token, as well as the information
 * encoded into the token in accessible format:
 *
 * token - the encoded / signed / encrypted JWT token
 * user_id - the authorized user name
 * expires_at - token expiration time in ISO-8601 format
 * requested_scopes - list of permission scopes requested
 * granted_scopes - list of permission scopes granted
 *
 * reference: https://gitlab.com/datopian/tech/ckanext-jwt-authz-api#response
 * scope eg. https://gitlab.com/datopian/tech/ckanext-jwt-authz-api/-/blob/master/ckanext/jwt_authz_api/tests/test_authzzie.py#L13
 */

const ckanAuthz = nock(config.api, {reqheaders: {'Auth-Token': config.token}})
  .persist()
  .post('/authorize', {
    scope: ["res:my_resource_id:create"],
    lifetime: 5000
  })
  .reply(200,{
    token: "diheuiadea===",
    user_id: "user_name",
    expires_at:"20200326T170624Z",
    requested_scopes: ["res:my_resource_id:create"],
    granted_scopes: ["res:my_resource_id:create"]
  })

  test('push works with packaged dataset', async (t) => {
    const dataset = await Dataset.load('test/fixtures/dp-no-resources')
    const options = {findability: 'unlisted'}
    await datahub.push(dataset, options)

    t.is(ckanAuthz.isDone(), true)
    // t.is(rawstoreStorageMock.isDone(), true)
    // t.is(apiSpecStore.isDone(), true)
    // t.is(authorizeForServices.isDone(), true)

    // t.is(dataset.resources.length, 0)
  })

/**
 * CKAN Cloud Storage Access Granter
 *
 *
 *
 * reference?
 * scope ?
 * response ?
 */

 const gitLFS = nock(config.api)
 .get('/any-path', {
  oid: '1111111',
  size: 123,
  hash: ""
 })
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
