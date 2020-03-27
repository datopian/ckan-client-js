const expect = require('chai').expect
const nock = require('nock')
const axios = require('axios')

const getHeaders = require('../lib/headers')
const createHashFromFile = require('../lib/hash')
const { Upload } = require('../lib/index')

const HASH = '4f12d29fa262e3a588ced941d56aa3103dd50aa284670c5868ce357fa1f84426'
const API_KEY = 'L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg'
const API_UPLOAD_PATH = 'http://localhost:3001/upload-csv'
const PATH_OF_THE_FILE = 'mock/sample.csv'
const FILE_NAME = 'sample.csv'
const NOCK_API_URL = 'http://localhost:3001'
const NOCK_API_PATH = '/upload-csv'


describe('Upload File to Storage and Update MetaStore', function() {
  const ckan = new Upload(API_KEY, PATH_OF_THE_FILE, FILE_NAME, API_UPLOAD_PATH)

  before(function() {
    nock.cleanAll()
  })

  afterEach(function() {
    nock.cleanAll()
  })

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
  describe('Upload file', () => {
    it('should return status code 200 and an object', async () => {
      nock(NOCK_API_URL)
        .put(NOCK_API_PATH)
        .reply(200, {})

      const result = await ckan.push()

      expect(typeof result.data).to.equal('object')
      expect(result.status).to.equal(200)
    })
  })

  describe('# Get headers', () => {
    it('should return a object', async () => {
      const data = ckan.getFormData()
      const headers = await getHeaders(data, API_KEY, HASH)

      expect(typeof headers).to.equal('object')
    })
  })

  describe('# Create sha256 hash', () => {
    it('should return a sha256 hash with char(64)', async () => {
      const hash = await createHashFromFile(PATH_OF_THE_FILE)

      expect(typeof hash).to.equal('string')
      expect(hash).to.have.lengthOf(64)
    })
  })

})

describe('Git lfs server request', () => {
  describe('# OK - 200', () => {
    it('should return status code 200 and an object', async () => {
      nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
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

      const result = await axios(`${NOCK_API_URL}${NOCK_API_PATH}`)

      expect(result.status).to.equal(200)
      expect(result.request.method).to.equal('GET')
      expect(typeof result.data).to.equal('object')
      expect(result.data).to.have.property('results')
    })
  })

  describe('# Not Found - 404', () => {
    it('should return status code 404 and an object', async () => {
      nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .replyWithError({
          message: 'Not found',
          code: '404',
        })

      const result = await axios(`${NOCK_API_URL}${NOCK_API_PATH}`).catch(
        error => error
      )
      expect(result.code).to.equal('404')
      expect(result.message).to.equal('Not found')
    })
  })

  describe('# Unauthorized - 401', () => {
    it('should return status code 401 and an object', async () => {
      nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .replyWithError({
          message: 'Credentials needed',
          code: '401',
        })

      const result = await axios(`${NOCK_API_URL}${NOCK_API_PATH}`).catch(
        error => error
      )

      expect(result.code).to.equal('401')
      expect(result.message).to.equal('Credentials needed')
    })
  })
})

describe('Ckan authz request', () => {
  describe('# OK - 200', () => {
    it('should return status code equal 200 and an object', async () => {
      nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .reply(200, {
          success: true,
          msg: 'Authorized',
        })

      const result = await axios(`${NOCK_API_URL}${NOCK_API_PATH}`).catch(
        error => error
      )

      expect(result.status).to.equal(200)
      expect(typeof result.data).to.equal('object')
      expect(result.data).to.deep.equal({ success: true, msg: 'Authorized' })
    })
  })

  describe('# Not Found - 404', () => {
    it('should return status code 404 and a message', async () => {
      nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .replyWithError({
          code: 404,
          success: false,
          msg: 'Not found',
        })

      const result = await axios(`${NOCK_API_URL}${NOCK_API_PATH}`).catch(
        error => error
      )

      expect(result.code).to.deep.equal(404)
      expect(result.success).to.equal(false)
      expect(result.msg).to.deep.equal('Not found')
    })
  })

  describe('# Unauthorized - 401', () => {
    it('should return status code 401 and a message', async () => {
      nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .replyWithError({
          code: 401,
          success: false,
          msg: 'Not authorized',
        })

      const result = await axios(`${NOCK_API_URL}${NOCK_API_PATH}`).catch(
        error => error
      )

      expect(result.code).to.deep.equal(401)
      expect(result.success).to.equal(false)
      expect(result.msg).to.deep.equal('Not authorized')
    })
  })
})
