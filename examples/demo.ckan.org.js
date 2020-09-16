const ckan = require('../lib/index')
// import f11s from "data.js"

const client = new ckan.Client(
  '8e87c120-fff8-4b5b-bd61-a66fd8b954bf', //API Key
  'karlen-organization', // Organization
  'karlen-dataset', // Dataste id
  'https://demo.ckan.org' // API
)

const test = async () => {
  const dataset = await client.retrieve('karlen-dataset')
  dataset.resources.push({
    bytes: 12,
    path: 'https://somecsvonline.com/somecsv.csv',
  })
  const a = await client.push(dataset)

  console.log(a)
}
test()
