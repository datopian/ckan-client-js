const fs = require('fs')
var CryptoJS = require("crypto-js");

class NodeFileSystemFile {
    constructor(filePath) {
        this.filePath = filePath;
    }

    sha256() {
        fs.createReadStream(filePath)
            .on('data', data => hash.update(data))
            .on('end', () => resolve(hash.digest('hex')))
    }

    content() {

    }

    size() {

    }
}

class HTML5File {
    /**
     * @type {File} file
     */
    constructor(file) {
        // Take a HTML5 file upload input element
        this.file = file
    }

    async sha256() {
        const content = await this.content()
        const wordArray = CryptoJS.lib.WordArray.create(content);
        return CryptoJS.SHA256(wordArray).toString()
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
}

module.exports = {
  NodeFileSystemFile,
  HTML5File,
}
