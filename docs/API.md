## Classes

<dl>
<dt><a href="#Client">Client</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#PushBlobResult">PushBlobResult</a> : <code>Object</code></dt>
<dd><p>The result of push blob method</p>
</dd>
</dl>

<a name="Client"></a>

## Client

**Kind**: global class

- [Client](#Client)
  - [new Client(apiKey, organizationId, datasetId, api)](#new_Client_new)
  - [.action(actionName, payload, useHttpGet)](#Client+action)
  - [.create(datasetNameOrMetadata)](#Client+create) ⇒ <code>Promise.&lt;Object&gt;</code>
  - [.push(datasetMetadata)](#Client+push) ⇒ <code>Promise.&lt;Object&gt;</code>
  - [.retrieve(nameOrId)](#Client+retrieve) ⇒ <code>Promise.&lt;Object&gt;</code>
  - [.pushBlob(resource, onProgress)](#Client+pushBlob) ⇒ [<code>Promise.&lt;PushBlobResult&gt;</code>](#PushBlobResult)

<a name="new_Client_new"></a>

### new Client(apiKey, organizationId, datasetId, api)

| Param          | Type                |
| -------------- | ------------------- |
| apiKey         | <code>string</code> |
| organizationId | <code>string</code> |
| datasetId      | <code>string</code> |
| api            | <code>string</code> |

<a name="Client+action"></a>

### client.action(actionName, payload, useHttpGet)

`action` gives you direct access to the [CKAN Action API][ckan-api].
Note: it uses the CKAN dataset and resource formats rather than [Frictionless][f11s].
If you want to have frictionless data you have to use [CKAN<=>Frictionless Mapper][c2f].
[ckan-api]: https://docs.ckan.org/en/2.8/api/

**Kind**: instance method of [<code>Client</code>](#Client)

| Param      | Type                | Default            | Description                                                                                                                                                                                                                 |
| ---------- | ------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| actionName | <code>string</code> |                    | The action name, e.g. site_read, package_show ...                                                                                                                                                                           |
| payload    | <code>object</code> |                    | The payload being sent to CKAN                                                                                                                                                                                              |
| useHttpGet | <code>object</code> | <code>false</code> | Optional, if `true` will make `GET` request, otherwise `POST`. Note that if the payload is provided during the `GET`, then it will be converted to params, where each property will be snake case converted from camel case |

**Example**

```js
const response = await client.action('package_update', {
  id: '03de2e7a-6e52-4410-b6b1-49491f0f4d5a',
  title: 'New title',
})
console.log(response.result)
```

<a name="Client+create"></a>

### client.create(datasetNameOrMetadata) ⇒ <code>Promise.&lt;Object&gt;</code>

Creates a new dataset

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - The frictionless dataset

| Param                 | Type                                       | Description                                                                                          |
| --------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| datasetNameOrMetadata | <code>string</code> \| <code>Object</code> | It is either a string being a valid dataset name or metadata for the dataset in frictionless format. |

**Example**

```js
const dataset = await client.create({
  name: 'market',
})
console.log(dataset)
```

<a name="Client+push"></a>

### client.push(datasetMetadata) ⇒ <code>Promise.&lt;Object&gt;</code>

Updates the dataset

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - The frictionless dataset

| Param           | Type                |
| --------------- | ------------------- |
| datasetMetadata | <code>Object</code> |

<a name="Client+retrieve"></a>

### client.retrieve(nameOrId) ⇒ <code>Promise.&lt;Object&gt;</code>

Retrieves the dataset

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - The frictionless dataset

| Param    | Type                | Description               |
| -------- | ------------------- | ------------------------- |
| nameOrId | <code>string</code> | Id or name of the dataset |

**Example**

```js
const dataset = await client.retrieve('03de2e7a-6e52-4410-b6b1-49491f0f4d5a')
const dataset = await client.retrieve('market')
```

<a name="Client+pushBlob"></a>

### client.pushBlob(resource, onProgress) ⇒ [<code>Promise.&lt;PushBlobResult&gt;</code>](#PushBlobResult)

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: [<code>Promise.&lt;PushBlobResult&gt;</code>](#PushBlobResult) - request result

| Param      | Type                  | Description                                                            |
| ---------- | --------------------- | ---------------------------------------------------------------------- |
| resource   | <code>Object</code>   | This datajs resource. Please check https://github.com/datopian/data.js |
| onProgress | <code>function</code> | a callback function to track the progress                              |

<a name="PushBlobResult"></a>

## PushBlobResult : <code>Object</code>

The result of push blob method

**Kind**: global typedef  
**Properties**

| Name       | Type                 | Description                                         |
| ---------- | -------------------- | --------------------------------------------------- |
| oid        | <code>string</code>  | oid                                                 |
| size       | <code>number</code>  | size of the file                                    |
| name       | <code>string</code>  | resource name                                       |
| success    | <code>boolean</code> | Indicates whether the request was successful or not |
| fileExists | <code>boolean</code> | Indicates whether the resource exists or not        |
