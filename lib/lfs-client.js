const axios = require('axios');

class GitLfsClient {
  transferAdapters = {
    'basic': GitLfsBasicTransfer,
    'multipart-basic': GitLfsMultipartTransfer,
  }

  transferPriority = ['multipart-basic', 'basic'];

  _GIT_REF_NAME = 'refs/heads/master';

  constructor(baseUrl, headers) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  async upload(file, organizationId, datasetId, onProgress) {
    let response;
    response = await this._lfsBatchRequest(file, organizationId, datasetId);
    if (response.status !== 200) {
      throw `'batch' request failed: ${response.status}`;
    }

    const negotiatedTransfer = response.data.transfer;
    const objectSpec = response.data.objects[0];

    if (! objectSpec.actions) {
      // We have nothing to do, the file is already there
      return false;
    }

    const transferClass = this.transferAdapters[negotiatedTransfer];
    if (! transferClass) {
      throw `Unknown negotiated transfer mode: ${negotiatedTransfer}`;
    }

    const transferAdapter = transferClass(objectSpec.actions, file, onProgress);
    await transferAdapter.upload();
    return true;
  }

  async _lfsBatchRequest(file, organizationId, datasetId) {
    const path = `/${organizationId}/${datasetId}/objects/batch`
    const body = {
      operation: 'upload',
      transfers: this.transferPriority,
      ref: { name: this._GIT_REF_NAME },
      objects: [
        {
          oid: await file.hash(),
          size: file.size,
        },
      ],
    }
    const config = {
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        ...this._headers,
      },
    }

    return axios.post(`${this._baseUrl}${path}`, body, config);
  }
}

class GitLfsBasicTransfer {
  constructor(actions, file, onProgress) {
    this._file = file;
    this._onProgress = onProgress;

    this._uploadAction = actions.upload || null;
    this._verifyAction = actions.verify || null;
  }

  /**
   * Upload the file to storage, using the protocol specified by the
   * transfer adapter
   *
   * @returns {Promise<boolean>}
   */
  async upload() {
    let response;
    if (this._uploadAction) {
      response = await this._doUpload();
      if (response.status >= 200 && response.status < 300) {
        throw `'upload' action failed with HTTP ${response.status}`;
      }
    }

    if (this._verifyAction) {
      response = await this._doVerify();
      if (response.status !== 200) {
        if (response.message) {
          throw response.message
        } else {
          throw `'verify' action failed with HTTP ${response.status}`;
        }
      }
    }

    return true;
  }

  async _doUpload() {
    const { href, header } = self._uploadAction;
    const body = self._file.stream();
    const config = {
      headers: header,
    }

    if (self._onProgress) {
      config.onUploadProgress = self._onProgress
    }

    return axios.put(href, body, config);
  }

  async _doVerify() {
    const body = JSON.stringify({
      oid: self._file.hash(),
      size: self._file.size,
    })
    const config = {
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        ...self._verifyAction.header,
      },
    }

    return axios.post(self._verifyAction.href, body, config)
  }
}

class GitLfsMultipartTransfer {
  constructor(actions, file, onProgress) {

  }

  upload() {

  }
}

module.exports = {
  GitLfsClient
};
