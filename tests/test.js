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

describe('Upload', function() {
  const ckan = new Upload(API_KEY, PATH_OF_THE_FILE, FILE_NAME, API_UPLOAD_PATH)

  before(function() {
    nock.cleanAll()
  })

  afterEach(function() {
    nock.cleanAll()
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

  describe('# Upload file', () => {
    it('should return - 200 - OK', async () => {
      nock(NOCK_API_URL)
        .put(NOCK_API_PATH)
        .reply(200, {})

      const result = await ckan.push()

      expect(typeof result.data).to.equal('object')
      expect(result.status).to.equal(200)
    })
  })
})

describe('Git lfs server request', () => {
  describe('# OK - 200', () => {
    it('should return a object', async () => {
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
    it('should return a object', async () => {
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
    it('should return a object', async () => {
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
    it('should return a object', () => {
      const scope = nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .reply(200, {
          success: true,
          msg: 'Authorized',
        })

      expect(typeof scope).to.equal('object')
    })
  })

  describe('# Not Found - 404', () => {
    it('should return a object', () => {
      const scope = nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .reply(404, {
          success: false,
          msg: 'Not found',
        })

      expect(typeof scope).to.equal('object')
    })
  })

  describe('# Unauthorized - 401', () => {
    it('should return a object', () => {
      const scope = nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .reply(401, {
          success: false,
          msg: 'Not authorized',
        })

      expect(typeof scope).to.equal('object')
    })
  })
})
