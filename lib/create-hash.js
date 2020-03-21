const crypto = require('crypto')
const fs = require('fs')

const createHashFromFile = filePath =>
  new Promise(resolve => {
    const hash = crypto.createHash('sha1')
    fs.createReadStream(filePath)
      .on('data', data => hash.update(data))
      .on('end', () => resolve(hash.digest('hex')))
  })

module.exports = createHashFromFile
