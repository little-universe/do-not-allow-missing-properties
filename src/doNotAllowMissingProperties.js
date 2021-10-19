const throwIfPropertyMissing = {
  get (object, property) {
    if (property in object) {
      return object[property]
    }

    throw new Error(`Property '${JSON.stringify(property)}' is missing`)
  }
}

const doNotAllowMissingProperties = (object) => {
  return new Proxy(object, throwIfPropertyMissing)
}

module.exports = doNotAllowMissingProperties
