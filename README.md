<div align="center">

# Ckan3-js-sdk

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/datopian/ckan3-js-sdk/issues)
![build](https://github.com/datopian/ckan3-js-sdk/workflows/ckan3-js-sdk%20actions/badge.svg)
[![The MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)


Ckan3-js-sdk is a "SDK" in javascript for uploading files and updating metastore.<br> This SDK will communicate with [Ckanext-authz-service](https://github.com/datopian/ckanext-authz-service)(Use CKAN to provide authorization tokens for other related systems
), [giftless service](https://github.com/datopian/giftless)(A highly customizable and extensible Git LFS server implemented in Python
) and uploading to Blob storage.

</div>

## Prerequisites

- [Node](https://nodejs.org/en/)
- [NPM Package Manager](https://www.npmjs.com/)

## Built with

- [crypto-js](https://cryptojs.gitbook.io/docs/)
- [axios](https://github.com/axios/axios)
- [ava](https://github.com/avajs/ava)
- [nock](https://github.com/nock/nock)
- [webpack](https://webpack.js.org/)

## Install

First, clone the repo via git:

```bash
$ git clone git@github.com:datopian/ckan3-js-sdk.git
```

And then install dependencies with npm.

```bash
$ cd ckan3-js-sdk
```

```bash
$ npm install
```

It will create a directory called `ckan3-js-sdk`.<br>
Inside that directory, it will generate the initial project structure.

```bash
ckan3-js-sdk
.
├── CHANGELOG.md
├── CONTRIBUTING.md
├── lib
│   ├── file.js
│   ├── index.js
│   └── util
│       ├── ckan-auth-api.js
│       └── ckan-upload-api.js
├── License
├── package.json
├── package-lock.json
├── README.md
├── test
│   ├── fixtures
│   │   └── sample.csv
│   └── upload.test.js
└── webpack.config.js
```

## Use

Upload file from **NodeJS**

```js
const ckanUploader = require('./lib/index')

const file = new ckanUploader.FileAPI.NodeFileSystemFile('file.csv')

const uploader = new ckanUploader.Uploader('key', 'organization-name', 'dataset-name', 'api')

uploader
  .ckanAuthz()
  .then(response => uploader.push(file, response.result.token))
  .then(response => console.log(response))
```

Upload file from **web applications**

```js
const file = new ckanUploader.FileAPI.HTML5File(event.target.files[0])

const uploader = new ckanUploader.Uploader('key', 'organization-name', 'dataset-name', 'api')

const onUploadProgress = progressEvent => {
  let progress = (progressEvent.loaded / progressEvent.total) * 100
  console.log(progress)
}

uploader
  .ckanAuthz()
  .then(response => uploader.push(file, response.result.token, onUploadProgress))
  .then(response => console.log(response))
```

## Build

This command will create a bundle in `dist`

```
npm run build
```

## Tests

```bash
$ npm test
```

or

```bash
$ yarn test
```

watch the test

```bash
$ npm run test:watch
```

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Please make sure to read the [CONTRIBUTING.md](CONTRIBUTING.md) Guide before making a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](License) file for details
