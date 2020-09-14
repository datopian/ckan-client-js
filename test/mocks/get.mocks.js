const nock = require('nock')

/**
 * Mock get package
 */
module.exports.getGetPackageMock = (config) => {
  return nock(config.api)
    .persist()
    .get('/api/3/action/package_create')
    .query({
      package_show: config.datasetId,
      include_tracking: config.includeTracking,
      use_default_schema: config.useDefaultSchema,
    })
    .reply(200, {
      help: 'http://ckan:5000/api/3/action/help_show?name=package_show',
      success: true,
      result: {
        license_title: null,
        maintainer: null,
        relationships_as_object: [],
        private: false,
        maintainer_email: null,
        num_tags: 0,
        id: '9e6c3083-8ab8-4c60-bf10-2710478f8d17',
        metadata_created: '2020-08-25T06:02:29.802722',
        metadata_modified: '2020-08-25T06:03:31.987352',
        author: null,
        author_email: null,
        state: 'active',
        version: null,
        creator_user_id: '14dba012-3c1a-4460-9122-63f712879684',
        type: 'dataset',
        resources: [
          {
            mimetype: 'text/csv',
            cache_url: null,
            hash: '',
            description: 'This is the best resource ever!',
            name: 'brand-new-resource',
            format: 'CSV',
            url:
              'https://raw.githubusercontent.com/frictionlessdata/test-data/master/files/csv/100kb.csv',
            datastore_active: false,
            cache_last_updated: null,
            package_id: '9e6c3083-8ab8-4c60-bf10-2710478f8d17',
            created: '2020-08-25T06:03:32.006090',
            state: 'active',
            mimetype_inner: null,
            last_modified: null,
            position: 0,
            revision_id: '62ea1274-0aac-4c17-a2d0-63e1ab180d05',
            url_type: null,
            id: '19f72e68-66ab-45e8-83b5-752161bf5ba4',
            resource_type: null,
            size: null,
          },
        ],
        num_resources: 1,
        tags: [],
        groups: [],
        license_id: null,
        relationships_as_subject: [],
        organization: {
          description: 'This is my awesome organization',
          created: '2020-08-25T05:58:26.081242',
          title: 'Demo Organization',
          name: 'demo-organization',
          is_organization: true,
          state: 'active',
          image_url: '',
          revision_id: '9784c3ff-c3fd-421b-9143-0cbc5e33a84d',
          type: 'organization',
          id: 'f19a6fe0-583e-4751-8495-8109a0892bc8',
          approval_status: 'approved',
        },
        name: 'my-first-dataset',
        isopen: false,
        url: null,
        notes: null,
        owner_org: 'f19a6fe0-583e-4751-8495-8109a0892bc8',
        extras: [],
        title: 'My First Dataset',
        revision_id: 'b9d17642-7ecc-4e72-b30d-cd22a0b98b40',
      },
    })
}
