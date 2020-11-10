const axios = require('axios');

class GitLfsClient {

  /**
   * Create a new LFS Client instance
   *
   * @param {String} baseUrl Base URL of Git LFS server
   * @param {Object <String, String>} headers Headers to set on all requests
   * @param {Array <String>} transferModePriority List of supported transfer
   *                         modes by priority
   */
  constructor(baseUrl, headers, transferModePriority) {
    this._baseUrl = baseUrl;
    this._headers = headers;

    this._transferPriority = transferModePriority || ['multipart-basic', 'basic'];

    // TODO: these could be configured / injected one day
    this._git_ref_name = 'refs/heads/master';
    this._transferAdapters = {
      'basic': GitLfsBasicTransfer,
      'multipart-basic': GitLfsMultipartTransfer,
    }
  }

  /**
   * Upload a file using Git LFS server
   *
   * @param {File} file
   * @param {String} organizationId
   * @param {String} datasetId
   * @param {CallableFunction} onProgress
   * @returns {Promise<boolean>}
   */
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

    const transferClass = this._transferAdapters[negotiatedTransfer];
    if (! transferClass) {
      throw `Unknown negotiated transfer mode: ${negotiatedTransfer}`;
    }

    const transferAdapter = new transferClass(objectSpec.actions, file, onProgress);
    await transferAdapter.upload();
    return true;
  }

  /**
   *
   * @param {File} file
   * @param {String} organizationId
   * @param {String} datasetId
   * @returns {Promise<AxiosResponse<any>>}
   * @private
   */
  async _lfsBatchRequest(file, organizationId, datasetId) {
    const path = `/${organizationId}/${datasetId}/objects/batch`
    const body = {
      operation: 'upload',
      transfers: this._transferPriority,
      ref: { name: this._git_ref_name },
      objects: [
        {
          oid: await _getFileHash(file, 'sha256'),
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

/**
 * @typedef {Object} BasicLfsAction An LFS basic transfer mode action descriptor
 * @property {String} href
 * @property {Object<String, String>} header
 * @property {Number} expires_in
 */

class GitLfsBasicTransfer {

  /**
   * Create a new 'basic' transfer adapter
   *
   * @param {Object} actions
   * @param {BasicLfsAction} actions.upload
   * @param {BasicLfsAction} actions.verify
   * @param {File} file
   * @param {CallableFunction} onProgress
   */
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
      if (! (response.status >= 200 && response.status < 300)) {
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
    const body = this._file.descriptor;
    const config = {
      headers: {
        "Content-type": this._file.descriptor.type || 'application/octet-stream',
        ...header
      },
    }

    if (this._onProgress) {
      config.onUploadProgress = this._onProgress
    }

    return axios.put(href, body, config);
  }

  async _doVerify() {
    const body = JSON.stringify({
      oid: await _getFileHash(this._file, 'sha256'),
      size: this._file.size,
    })
    const config = {
      headers: {
        'Accept': 'application/vnd.git-lfs+json',
        'Content-Type': 'application/vnd.git-lfs+json',
        ...this._verifyAction.header,
      },
    }

    return axios.post(this._verifyAction.href, body, config)
  }
}

/**
 * @typedef {"POST" | "GET" | "PUT" | "DELETE"} HttpMethod
 */

/**
 * @typedef {Object} MultipartLfsAction
 * @property {String} href
 * @property {Object<String, String>} header
 * @property {HttpMethod} method
 * @property {String} body
 * @property {Number} expires_in
 */

/**
 * @typedef {Object} MultipartLfsPartAction
 * @property {String} href
 * @property {Object<String, String>} header
 * @property {HttpMethod} method
 * @property {Number} pos
 * @property {Number} size
 * @property {Number} expires_in
 * @property {String} want_digest
 */

/**
 * @typedef {Object} MultipartLfsActions
 * @property {MultipartLfsAction} init
 * @property {MultipartLfsAction} commit
 * @property {BasicLfsAction} verify
 * @property {Array<MultipartLfsPartAction>} parts
 */

class GitLfsMultipartTransfer {

  /**
   * Create a new LFS multipart-basic transfer adapter
   *
   * @param {MultipartLfsActions} actions
   * @param {File} file
   * @param {CallableFunction} onProgress
   */
  constructor(actions, file, onProgress) {
    this._file = file;
    this._onProgress = onProgress;
    this._actions = actions;
  }

  /**
   * Upload a file using multipart-basic transfer mode
   *
   * @returns {Promise<void>}
   */
  async upload() {
    let response;

    if (this._actions.init) {
      response = await this._doInit(this._actions.init);
      if (! (response.status >= 200 && response.status < 300)) {
        throw `'init' action failed with HTTP ${response.status}`;
      }
    }

    const parts = this._actions.parts || [];
    for (let i = 0; i < parts.length; i++) {
      response = await this._uploadPart(parts[i]);
      if (! (response.status >= 200 && response.status < 300)) {
        throw `'part upload failed for part ${i + 1}/${parts.length} with HTTP ${response.status}`;
      }
    }

    if (this._actions.commit) {
      response = await this._doCommit(this._actions.commit);
      if (! (response.status >= 200 && response.status < 300)) {
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

  /**
   *
   * @param {MultipartLfsAction} initAction
   * @returns {Promise<AxiosResponse<any>>}
   * @private
   */
  async _doInit(initAction) {
    const config = {
      method: initAction.method || 'POST',
      url: initAction.href,
      headers: initAction.header || {},
      data: initAction.body || null
    }

    return axios.request(config);
  }

  /**
   * Upload a single part
   *
   * @param {MultipartLfsPartAction} partAction
   * @returns {Promise<AxiosResponse<any>>}
   * @private
   */
  async _uploadPart(partAction) {
    const startPos = partAction.pos || 0;
    const partSize = partAction.size || null;
    const part = await this._readChunk(startPos, partSize);
    const headers = partAction.header || {};

    if (partAction.want_digest) {
      await this._setContentDigestHeaders(part, partAction.want_digest, headers)
    }

    const config = {
      method: partAction.method || 'PUT',
      url: partAction.href,
      headers: headers,
      data: part
    }

    return axios.request(config);
  }

  /**
   * Send the 'commit' action
   *
   * @param {MultipartLfsAction} commitAction
   * @returns {Promise<AxiosResponse<any>>}
   * @private
   */
  async _doCommit(commitAction) {
    const config = {
      method: commitAction.method || 'POST',
      url: commitAction.href,
      headers: commitAction.headers || {},
      data: commitAction.body || null
    }

    return axios.request(config);
  }

   /**
    * Send the 'verify' action
    *
    * @returns {Promise<AxiosResponse<any>>}
    * @private
    */
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

  /**
   * Read a chunk of a file
   *
   * @param {Number} start
   * @param {Number | null} size
   * @returns {Promise<Blob>}
   * @private
   */
  async _readChunk(start, size) {
    if (size === null) {
      return this._file.slice(start);
    } else {
      return this._file.slice(start, start + size);
    }
  }

  async _setContentDigestHeaders(part, wantDigest, headers) {
    // TODO: implement chunk digest calculation, update headers with 'Content-MD5' or 'Digest'
  }
}

/**
 * Wrapper around File.hash that logs progress to console
 *
 * @param {File} file
 * @param {String} algorithm
 * @returns {Promise<*>}
 * @private
 */
async function _getFileHash(file, algorithm) {
  return file.hash(algorithm, (progressPct) => {
    if (progressPct % 25 === 0) {
      console.log('Calculating hash is ' + progressPct + '% done')
    }
  });
}

module.exports = {
  GitLfsClient
};
