const MissingPropertyError = class extends Error {}

const PROXY_TARGET_PROPERTY = '__doNotAllowMissingPropertiesProxyTarget'
const promiseMethods = ['then', 'catch', 'finally']

const throwIfPropertyMissing = {
  set (object, property, value) {
    if (property in object) {
      object[property] = value
      return true
    }

    throwError(property)
  },

  get (object, property) {
    if (property === PROXY_TARGET_PROPERTY) {
      // makes allowMissingProperties function to work
      return object
    }

    if (promiseMethods.includes(property)) {
      // allows code that is interested in if this is a promise via duck typing to work (maybe async/await?)
      return object
    }

    if (property in object) {
      return object[property]
    }

    throwError(property)
  }
}

const throwError = (propertyName) => {
  throw new MissingPropertyError(`Property '${JSON.stringify(propertyName)}' is missing`)
}

const allowMissingProperties = (proxy) => {
  if (proxy === undefined || proxy === null) {
    throw new Error('cannot allowMissingProperties of ' + proxy)
  }

  return proxy[PROXY_TARGET_PROPERTY] || proxy
}

const doNotAllowMissingProperties = (object) => {
  if (object === undefined || object === null) {
    throw new Error('cannot doNotAllowMissingProperties of ' + object)
  }

  return new Proxy(object, throwIfPropertyMissing)
}

module.exports = {
  doNotAllowMissingProperties,
  allowMissingProperties,
  MissingPropertyError
}
