const { program } = require("commander");
const axios = require("axios");
const filename = process.argv[3];
const crypto = require("crypto");
const fs = require("fs");
const input = fs.createReadStream(filename);
let FormData = require("form-data");

const getHeaders = require("../src/headers");

const createHashFromFile = filePath =>
  new Promise(resolve => {
    const hash = crypto.createHash("sha1");
    fs.createReadStream(filePath)
      .on("data", data => hash.update(data))
      .on("end", () => resolve(hash.digest("hex")));
  });

async function uploadFile(key, previous) {
  let data = new FormData();
  data.append("file", input, filename);
  await createHashFromFile(filename)
    .then(response => getHeaders(data, key, response))
    .then(headers => {
      return axios.put("http://localhost:3001/upload-csv", data, {
        headers: headers
      });
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(e => {
      console.log(e);
    });
}

program.option("-k, --apikey <key>", "api key", uploadFile);

program.parse(process.argv);

module.exports = "test";
