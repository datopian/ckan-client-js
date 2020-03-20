
const getHeaders = (data, key, hash) => {
    return new Promise((resolve, reject) => {
      data.getLength((err, length) => {
        if (err) {
          reject(err);
        }
        let headers = Object.assign(
          {
            "Content-Length": length,
            Authorization: `Bearer ${key}`,
            hash: hash
          },
          data.getHeaders()
        );
        resolve(headers);
      });
    });
  };

  module.exports = getHeaders;