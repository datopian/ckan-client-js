const expect = require('chai').expect
const nock = require('nock')
let FormData = require('form-data')

const push = require('../lib/upload')
const getHeaders = require('../lib/get-headers')
const createHashFromFile = require('../lib/create-hash')

const HASH = '4f12d29fa262e3a588ced941d56aa3103dd50aa284670c5868ce357fa1f84426'
const API_KEY = 'L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg'
const API_UPLOAD_PATH = 'http://localhost:3001/upload-csv'
const PATH_OF_THE_FILE = 'mock/file.csv'
const FILE_NAME = 'file.csv'
const NOCK_API_URL = 'http://localhost:3000'
const NOCK_API_PATH = '/upload'

describe('Upload file', function() {
  const resource = {
    key: API_KEY,
    path: PATH_OF_THE_FILE,
    fileName: FILE_NAME,
    url: API_UPLOAD_PATH,
  }

  describe('# Get file headers', () => {
    it('should return a object', async () => {
      let data = new FormData()
      const headers = await getHeaders(data, resource.key, HASH)

      expect(typeof headers).to.equal('object')
    })
  })

  describe('# Create sha256 hash', () => {
    it('should return a sha256 hash with char(64)', async () => {
      const hash = await createHashFromFile(resource.path)

      expect(typeof hash).to.equal('string')
      expect(hash).to.have.lengthOf(64)
    })
  })

  describe('# PUT - 200 - Success', () => {
    it.skip('should return success code 200', async () => {
      const upload = await push(resource)
      expect(typeof upload).to.equal('object')
      expect(typeof upload.data).to.equal('object')
      expect(upload.status).to.equal(200)
      expect(upload.statusText).to.equal('OK')
    })
  })
})

describe('Git lfs server request', () => {
  describe('#OK - 200', () => {
    it('should return a object', () => {
      const scope = nock(NOCK_API_URL)
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

      expect(typeof scope).to.equal('object')
    })
  })

  describe('#Not Found - 404', () => {
    it('should return a object', () => {
      const scope = nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .reply(404, {
          results: {
            message: 'Not found',
            documentation_url: 'https://lfs-server.com/docs/errors',
            request_id: '123',
          },
        })

      expect(typeof scope).to.equal('object')
    })
  })

  describe('#Unauthorized - 401', () => {
    it('should return a object', async () => {
      const scope = nock(NOCK_API_URL)
        .get(NOCK_API_PATH)
        .reply(401, {
          results: {
            message: 'Credentials needed',
            documentation_url: 'https://lfs-server.com/docs/errors',
            request_id: '123',
          },
        })
      expect(typeof scope).to.equal('object')
    })
  })
})

describe('Ckan authz request', () => {
  describe('#OK - 200', () => {
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

  describe('#Not Found - 404', () => {
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

  describe('#Unauthorized - 401', () => {
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
