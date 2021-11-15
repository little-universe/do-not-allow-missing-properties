const { isString } = require('lodash')

const MissingPropertyError = class extends Error { }

const PROXY_TARGET_PROPERTY = '__doNotAllowMissingPropertiesProxyTarget'
// there is code in the runtime that calls these without checking first. async/await maybe?
const promiseMethods = ['then', 'catch', 'finally']

const setter = {
  set (object, property, value) {
    if (property in object) {
      object[property] = value
      return true
    }

    throwError(property)
  }
}

const getter = {
  get (object, property) {
    if (property === PROXY_TARGET_PROPERTY) {
      // a way to expose the proxy target to make allowMissingProperties function work
      return object
    }

    if (property in object || promiseMethods.includes(property) || !isString(property)) {
      return object[property]
    }

    throwError(property)
  }
}

const accessors = { ...setter, ...getter }

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

  return new Proxy(object, accessors)
}

module.exports = {
  doNotAllowMissingProperties,
  allowMissingProperties,
  MissingPropertyError
}
