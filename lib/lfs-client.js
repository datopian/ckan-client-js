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
    const { href, header } = this._uploadAction;
    const body = this._file.stream();
    const config = {
      headers: header,
    }

    if (this._onProgress) {
      config.onUploadProgress = this._onProgress
    }

    return axios.put(href, body, config);
  }

  async _doVerify() {
    const body = JSON.stringify({
      oid: this._file.hash(),
      size: this._file.size,
    })
    const config = {
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        ...this._verifyAction.header,
      },
    }

    return axios.post(this._verifyAction.href, body, config)
  }
}

class GitLfsMultipartTransfer {
  constructor(actions, file, onProgress) {
    this._file = file;
    this._onProgress = onProgress;
    this._actions = actions;
  }

  async upload() {
    let response;

    if (this._actions.init) {
      response = await this._doInit(this._actions.init);
      if (response.status >= 200 && response.status < 300) {
        throw `'init' action failed with HTTP ${response.status}`;
      }
    }

    const parts = this._actions.parts || [];
    for (let i = 0; i < parts.length; i++) {
      response = await this._uploadPart(parts[i], i);
      if (response.status >= 200 && response.status < 300) {
        throw `'part upload failed for part ${i + 1}/${parts.length} with HTTP ${response.status}`;
      }
    }

    if (this._actions.commit) {
      response = await this._doCommit(this._actions.commit);
      if (response.status >= 200 && response.status < 300) {
        throw `'commit' action failed with HTTP ${response.status}`;
      }
    }

    if (this._actions.verify) {
      response = await this._doVerify();
      if (response.status !== 200) {
        if (response.message) {
          throw response.message
        } else {
          throw `'verify' action failed with HTTP ${response.status}`;
        }
      }
    }
  }

  async _doInit(initAction) {
    const config = {
      method: initAction.method || 'POST',
      url: initAction.href,
      headers: initAction.headers || {},
      data: initAction.body || null
    }

    return axios.request(config);
  }

  async _uploadPart(partAction) {
    const startPos = partAction.pos || 0;
    const partSize = partAction.size || null;
    const part = await this._readChunk(startPos, partSize);
    const headers = partAction.header || {}

    if (partAction.want_digest) {
      // TODO: implement chunk digest calculation, update headers with 'Content-MD5' or 'Digest'
    }

    const config = {
      method: partAction.method || 'PUT',
      url: partAction.href,
      headers: headers,
      data: part
    }

    return axios.request(config);
  }

  async _doCommit(commitAction) {
    const config = {
      method: commitAction.method || 'POST',
      url: commitAction.href,
      headers: commitAction.headers || {},
      data: commitAction.body || null
    }

    return axios.request(config);
  }

  async _doVerify() {
    const body = JSON.stringify({
      oid: this._file.hash(),
      size: this._file.size,
    })
    const config = {
      headers: {
        Accept: 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        ...this._verifyAction.header,
      },
    }

    return axios.post(this._verifyAction.href, body, config)
  }

  async _readChunk(start, size) {
    // read `size` bytes from file starting from pos `start`
    // if `size` is null read to end of file
    // may be best to return a generator / arraybuffer / whatever JS mechanism
    // is available and accepted by axios to do buffered IO
  }
}

module.exports = {
  GitLfsClient
};
