const ckan = require('../lib/index')

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
  const newDataset = await client.push(dataset)

  console.log(newDataset)
}
test()
