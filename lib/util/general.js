module.exports.camelToSnakeCaseStr = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
module.exports.camelToSnakeCase = (obj) => {
  const result = {}
  Object.keys(obj).map((key) => {
    const snakeCasePropName = module.exports.camelToSnakeCaseStr(key)
    result[snakeCasePropName] = obj[key]
  })
  return result
}
