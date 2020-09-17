<div align="center">

# CKAN Javascript Client

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/datopian/ckan-client-js/issues)
[![build](https://github.com/datopian/ckan-client-js/workflows/ckan-client-js%20actions/badge.svg)](https://github.com/datopian/ckan-client-js/actions)
[![The MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)

`ckan-client-js` is a Javascript client "SDK" for interacting with the CKAN data management system (DMS). It covers the whole action API as well as convenience methods for uploading files, updating the metastore etc.

</div>

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
$ git clone git@github.com:datopian/ckan-client-js.git
```

And then install dependencies with npm.

```bash
$ cd ckan-client-js
```

```bash
$ npm install
```

Now you can use the code:

```js
const { Client } = require('./lib/index')
...
```

### Browser

TODO

```js
import { Client } from "ckanClient";
...
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

client.pushBlob(resource)
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

### `Client`

```js
const client = new Client(
  'my-api-key',
  'my-organization-id',
  'my-dataset-id',
  'api-url'
)
```

### `create`

Create a dataset

```js
const dataset = await client.create({
  name: 'market',
})
console.log(dataset)
```

### `retrieve`

By id or by name

```js
const dataset = await client.retrieve('03de2e7a-6e52-4410-b6b1-49491f0f4d5a')
const dataset = await client.retrieve('market')
```

### `push`

```js
await client.push(dataset)
```

### `pushBlob`

TODO

### `action`

`action` gives you direct access to the [CKAN Action API][ckan-api].

Note: it uses the CKAN dataset and resource formats rather than [Frictionless][f11s]. If you want to have frictionless data you have to use [CKAN<=>Frictionless Mapper][c2f].

[ckan-api]: https://docs.ckan.org/en/2.8/api/

```js
// Update the the dataset name
const response = await client.action('package_update', {
  id: '03de2e7a-6e52-4410-b6b1-49491f0f4d5a',
  title: 'New title',
})
console.log(response.result)
```

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

## Contributing

Please make sure to read the [CONTRIBUTING.md](CONTRIBUTING.md) Guide before making a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](License) file for details
