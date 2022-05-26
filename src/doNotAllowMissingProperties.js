const { isString } = require('lodash')

const MissingPropertyError = class extends Error { }

const PROXY_TARGET_PROPERTY = '__doNotAllowMissingPropertiesProxyTarget'
// there is code in the runtime that calls these without checking first. async/await maybe?
const promiseMethods = ['then', 'catch', 'finally']
const jestMatcherMethods = ['asymmetricMatch', 'nodeType', 'tagName', 'hasAttribute', '_isMockFunction']
const lodashMethods = ['length']
const standardLibraryMethods = ['toJSON']
const prismaMethods = ['toStringTag'] // would be nice to configure these from outside instead of in this repository

const allowedMethods = [
  ...jestMatcherMethods,
  ...lodashMethods,
  ...prismaMethods,
  ...promiseMethods,
  ...standardLibraryMethods
]

const setter = {
  set (object, property, value) {
    const descriptor = Object.getOwnPropertyDescriptor(object.constructor?.prototype, property)

    if (descriptor && descriptor.set) {
      descriptor.set.apply(doNotAllowMissingProperties(object), [value])
      return true
    }

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

    const descriptor = Object.getOwnPropertyDescriptor(object.constructor?.prototype, property)

    if (descriptor && descriptor.get) {
      const value = descriptor.get.apply(doNotAllowMissingProperties(object))
      return value
    }

    if (property in object || allowedMethods.includes(property) || !isString(property)) {
      return object[property]
    }

    throwError(property)
  }
}

const accessors = { ...setter, ...getter }

const throwError = (propertyName) => {
  throw new MissingPropertyError(`Property ${JSON.stringify(propertyName)} is missing`)
}

const allowMissingProperties = (proxy) => {
  if (proxy === undefined || proxy === null) {
    return proxy
  }

  return proxy[PROXY_TARGET_PROPERTY] || proxy
}

const doNotAllowMissingProperties = (object) => {
  if (object === undefined || object === null) {
    return object
  }

  return new Proxy(object, accessors)
}

const allowsMissingProperties = (object) => {
  return !object[PROXY_TARGET_PROPERTY]
}

module.exports = {
  doNotAllowMissingProperties,
  allowMissingProperties,
  allowsMissingProperties,
  MissingPropertyError
}
