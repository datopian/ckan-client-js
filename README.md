# ckan3-js-sdk

## Prerequisites

- [Node](https://nodejs.org/en/)
- [NPM Package Manager](https://www.npmjs.com/)

## Built with

- [crypto-js](https://cryptojs.gitbook.io/docs/)
- [form-data](https://github.com/form-data/form-data)
- [axios](https://github.com/axios/axios)
- [mocha](https://mochajs.org/)
- [chai](https://www.chaijs.com/)
- [nock](https://github.com/nock/nock)

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
├── bin
│   └── index.js
├── lib
│   ├── create-hash.js
│   └── get-headers.js
├── License
├── mock
│   └── file.csv
├── package.json
├── package-lock.json
├── README.md
└── tests
    └── test.js
```

## Tests

```bash
$ npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](License) file for details
