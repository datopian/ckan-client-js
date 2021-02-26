<div align="center">

# CKAN Client: Javascript SDK

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/datopian/ckan-client-js/issues)
[![build](https://github.com/datopian/ckan-client-js/workflows/ckan-client-js%20actions/badge.svg)](https://github.com/datopian/ckan-client-js/actions)
[![The MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)

CKAN SDK for interacting with CKAN instances with [CKAN v3 style cloud storage][storage]. It covers the whole action API as well as convenience methods for uploading files, updating the metastore etc. Tutorial on use at https://tech.datopian.com/ckan-client-guide/. API documentation below. 

</div>

[storage]: https://tech.datopian.com/blob-storage/#ckan-v3

## Frictionless Formats

The client uses [Frictionless formats][f11s] by default for describing dataset and resource objects passed to client methods. Internally we then use the [CKAN<=>Frictionless Mapper][c2f] to convert to CKAN formats before calling the API. Thus, you can use Frictionless Formats by default with the client. (As CKAN moves to Frictionless to default this will gradually become unnecessary).

[f11s]: https://specs.frictionlessdata.io/
[c2f]: https://github.com/datopian/frictionless-ckan-mapper-js

## Install

### Node

Prerequisites

- [Node](https://nodejs.org/en/)
- [NPM Package Manager](https://www.npmjs.com/)

Then clone the repo via git:

```bash
$ npm install https://github.com/datopian/ckan-client-js.git
```

or

```bash
$ yarn add https://github.com/datopian/ckan-client-js.git
```

Now you can use the code:

```js
const { Client } = require('ckanClient')
...
```

### Browser

If you want to use it as a script in the browser, then follow the steps below:

```bash
$ git clone git@github.com:datopian/ckan-client-js.git
$ cd ckan-client-js
$ npm install
$ npm run build
```

The last command will create `/dist/index.js` bundle which can be used in the browser like:

```html
<head>
  <script src="./ckan-client-js/dist/index.js"></script>
  <script>
    // Global ckanClient variable is available here...
    const { Client } = ckanClient;
    ...
  </script>
</head>
<body></body>
```

## Examples

### Add a resource to a dataset and save

```js
// pushing some resource to the dataset
dataset.resources.push({
  bytes: 12,
  path: 'https://somecsvonline.com/somecsv.csv',
})

// then saving it, this will return a new dataset with updated fields
const updatedDataset = await client.push(dataset)
console.log(updatedDataset)
```

### Upload resource data and save resource

```js
// to open a file and give a frictionless resource with stream method
// this uses the frictionless js library https://github.com/datopian/data.js
const f11s = require('data.js')

// If it is in Browser you can pass an attached file
const resource = f11s.open('path/to/example.csv')

await client.pushBlob(resource)
// If you are in browser you can also track the progress, in the second argument
// client.pushBlob(resource, (progressEvent) => {
//   let progress = (progressEvent.loaded / progressEvent.total) * 100
//   console.log(progress)
// })

// create a dataset, add resource metadata and save
const dataset = await client.create({
  name: 'dataset-name',
})
dataset.resources.push(resource.descriptor)

const updatedDataset = await client.push(dataset)
```

## API

See API documentation [here](./docs/API.md)

## Developers

### Build

This command will create a bundle in `dist`

```
npm run build
```

### Tests

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

### Documentation

We use JSDoc to document the methods we are creating. Those JSDoc comments are being used to generate API docs for README via [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown).

To generate API markdown docs from JSDoc comments run:

```bash
$ npx jsdoc2md example.js
```

Where `example.js` is the file where you have implemented new methods. Paste the output in [API docs](./docs/API.md). Make sure you paste only your changes.

## Contributing

Please make sure to read the [CONTRIBUTING.md](CONTRIBUTING.md) Guide before making a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](License) file for details
