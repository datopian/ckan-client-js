<div align="center">

# CKAN Javascript Client

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/datopian/ckan-client-js/issues)
[![build](https://github.com/datopian/ckan-client-js/workflows/ckan-client-js%20actions/badge.svg)](https://github.com/datopian/ckan-client-js/actions)
[![The MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)


`ckan-client-js` is a Javascript client "SDK" for interacting with the CKAN data management system (DMS). It covers the whole action API as well as convenience methods for uploading files, accessing the action API, updating the metastore etc.

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
$ git clone git@github.com:datopian/ckan-client-js.git
```

And then install dependencies with npm.

```bash
$ cd ckan-client-js
```

```bash
$ npm install
```

It will create a directory called `ckan-client-js`.<br>
Inside that directory, it will generate the initial project structure.

```bash
ckan-client-js
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
const { Client } = require('./lib/index')
const f11s = require('data.js')

const client = new Client('key', 'organization-name', 'dataset-name', 'apiUrl')
const resource = f11s.open(file_path)

client.pushBlob(resource)
```

Upload file from **web applications**

```js
import { Client } from "ckanClient";
import f11s from "data.js"

const client = new Client('key', 'organization-name', 'dataset-name', 'api')
const resource = f11s.open(file)

client.pushBlob(resource, onUploadProgress)

const onUploadProgress = progressEvent => {
  let progress = (progressEvent.loaded / progressEvent.total) * 100
  console.log(progress)
}
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
