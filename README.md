# Ckan3-js-sdk

Ckan3-js-sdk is a "SDK" in javascript for uploading files and updating metastore.<br> This SDK will communicate with Ckanext-authz-service, giftless service and uploading to Blob storage.

## Prerequisites

- [Node](https://nodejs.org/en/)
- [NPM Package Manager](https://www.npmjs.com/)

## Built with

- [crypto-js](https://cryptojs.gitbook.io/docs/)
- [form-data](https://github.com/form-data/form-data)
- [node-fetch](https://www.npmjs.com/package/node-fetch)
- [ava](https://github.com/avajs/ava)
- [nock](https://github.com/nock/nock)
- [data.js](https://www.npmjs.com/package/data.js)

## Install

First, clone the repo via git:

```bash
$ git clone git@gitlab.com:datopian/experiments/ckan3-js-sdk.git
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
├── lib
│   ├── form-data.js
│   ├── hash.js
│   ├── index.js
│   └── util
│       ├── ckan-auth-api.js
│       └── ckan-upload-api.js
├── License
├── package.json
├── README.md
├── test
│   ├── fixtures
│   │   ├── dp-test
│   │   │   ├── datapackage.json
│   │   │   ├── second-resource.csv
│   │   │   └── second-resource-non-tabular.json
│   │   └── sample.csv
|   └── upload.test.js
└── webpack.config.js
```

## Use

Create a new javascript file like the code below.

```bash
const { DataHub } = require('./lib/index')

const datahub = new DataHub(
  authToken,
  organizationId,
  datasetId,
  api
)

const resources = {
  basePath: 'test/fixtures',
  path: 'sample.csv',
}

await datahub.push(resources)
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

## License

This project is licensed under the MIT License - see the [LICENSE](License) file for details
