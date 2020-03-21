const expect = require('chai').expect
const nock = require('nock')
let FormData = require('form-data')

const getHeaders = require('../lib/get-headers')

const HASH = '4f12d29fa262e3a588ced941d56aa3103dd50aa284670c5868ce357fa1f84426'
const API_KEY = 'L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg'
const API_URL = 'http://localhost:3000'
const API_UPLOAD_PATH = '/upload-csv'

describe('Upload file - PUT - 200 - Success', function() {
  it('should return success code 200', () => {
    const scope = nock(API_URL)
      .get(API_UPLOAD_PATH)
      .reply(200, {
        fieldname: 'file',
        originalname: 'file.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        destination: '/datopian/upload-test/upload-api/tmp',
        filename: 'b8eb092c7ba837f4fa05ff4d51badde9-file.csv',
        path:
          '/datopian/upload-test/upload-api/tmp/b8eb092c7ba837f4fa05ff4d51badde9-file.csv',
        size: 175593,
      })
    expect(typeof scope).to.equal('object')
  })
})

describe('Upload file - PUT - 500 - Failed', function() {
  it('should return error code 500', () => {
    const scope = nock(API_URL)
      .get(API_UPLOAD_PATH)
      .reply(500, 'Something was wrong!')

    expect(typeof scope).to.equal('object')
  })
})

describe('Get file headers', () => {
  it('should return a object with headers', async () => {
    let data = new FormData()
    const headers = await getHeaders(data, API_KEY, HASH)

    expect(typeof headers).to.equal('object')
  })

  it('hash should to have char(64)', async () => {
    let data = new FormData()
    const headers = await getHeaders(data, API_KEY, HASH)

    expect(headers.hash).to.have.lengthOf(64)
  })
})

describe('Git lfs server request', () => {
  describe('#OK - 200', () => {
    it('should return a object', () => {
      const scope = nock(API_URL)
        .get(API_UPLOAD_PATH)
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
      const scope = nock(API_URL)
        .get(API_UPLOAD_PATH)
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
      const scope = nock(API_URL)
        .get(API_UPLOAD_PATH)
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
      const scope = nock(API_URL)
        .get(API_UPLOAD_PATH)
        .reply(200, {
          success: true,
          msg: 'Authorized',
        })

      expect(typeof scope).to.equal('object')
    })
  })

  describe('#Not Found - 404', () => {
    it('should return a object', () => {
      const scope = nock(API_URL)
        .get(API_UPLOAD_PATH)
        .reply(404, {
          success: false,
          msg: 'Not found',
        })

      expect(typeof scope).to.equal('object')
    })
  })

  describe('#Unauthorized - 401', () => {
    it('should return a object', () => {
      const scope = nock(API_URL)
        .get(API_UPLOAD_PATH)
        .reply(401, {
          success: false,
          msg: 'Not authorized',
        })

      expect(typeof scope).to.equal('object')
    })
  })
})
