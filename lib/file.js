const fs = require('fs')
var CryptoJS = require("crypto-js");
const crypto = require('crypto')
const path = require('path');


class NodeFileSystemFile {
    constructor(filePath) {
        this.filePath = filePath;
    }

    sha256() {
      return new Promise(resolve => {
        const hash = crypto.createHash('sha256')
        fs.createReadStream(this.filePath)
          .on('data', data => hash.update(data))
          .on('end', () => resolve(hash.digest('hex')))
      })
    }

    content() {
      return new Promise((resolve, reject) => {
        const formData = {
          file: fs.createReadStream(this.filePath)
        };
        resolve(formData)
      })
    }

    size() {
      var stats = fs.statSync(this.filePath)
      var fileSizeInBytes = stats["size"]
      return fileSizeInBytes
    }

    name() {
      return path.basename( this.filePath)
    }
}

class HTML5File {
    /**
     * @type {File} file
     */
    constructor(file) {
        // Take a HTML5 file upload input element
        this.file = file
        this._sha256 = null;
    }

    async sha256() {
        if (this._sha256 !== null) {
          return this._sha256;
        }

        const content = await this.content()
        const wordArray = CryptoJS.lib.WordArray.create(content);

        this._sha256 = CryptoJS.SHA256(wordArray).toString()
        return this._sha256;
    }

    async content() {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = event => {
                resolve(event.target.result)
            };
            reader.onerror = reject

            reader.readAsArrayBuffer(this.file)
        });
    }

    size() {
        return this.file.size
    }

    name() {
        return this.file.name
    }
}

module.exports = {
  NodeFileSystemFile,
  HTML5File,
}
