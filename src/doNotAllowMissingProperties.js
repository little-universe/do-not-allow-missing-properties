const throwOnUndefined = {
  get(object, property) {
    if (property in object) {
      return object[property]
    }

    throw new Error(`Property '${property}' is not defined`)
  }
}

const doNotAllowMissingProperties = (object) => {
  return new Proxy(object, throwOnUndefined)
}

module.exports = doNotAllowMissingProperties
