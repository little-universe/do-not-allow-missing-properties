const { isString, some } = require('lodash')

const MissingPropertyError = class extends Error { }

const PROXY_TARGET_PROPERTY = '__doNotAllowMissingPropertiesProxyTarget'
// there is code in the runtime that calls these without checking first. async/await maybe?
const promiseMethods = ['then', 'catch', 'finally']
const jestMatcherMethods = ['asymmetricMatch', 'nodeType', 'tagName', 'hasAttribute', '_isMockFunction']
const lodashMethods = ['length']
const standardLibraryMethods = ['toJSON']
const prismaMethods = ['toStringTag'] // would be nice to configure these from outside instead of in this repository

const allowedPrefixes = [
  '$$',
  '@@'
]

const allowedMethods = [
  ...jestMatcherMethods,
  ...lodashMethods,
  ...prismaMethods,
  ...promiseMethods,
  ...standardLibraryMethods
]

function propertyAllowedToBeMissing (propertyName) {
  return !isString(propertyName) ||
    allowedMethods.includes(propertyName) ||
    some(allowedPrefixes, (allowedPrefix) => propertyName.startsWith(allowedPrefix))
}

const setter = {
  set (target, property, value) {
    const descriptor = Object.getOwnPropertyDescriptor(target.constructor?.prototype, property)

    if (descriptor && descriptor.set) {
      descriptor.set.apply(doNotAllowMissingProperties(target), [value])
      return true
    }

    if (property in target || propertyAllowedToBeMissing(property)) {
      target[property] = value
      return true
    }

    throwError(target, property)
  }
}

const getter = {
  get (target, property) {
    if (property === PROXY_TARGET_PROPERTY) {
      // a way to expose the proxy target to make allowMissingProperties function work
      return target
    }

    const descriptor = Object.getOwnPropertyDescriptor(target.constructor?.prototype, property)

    if (descriptor && descriptor.get) {
      const value = descriptor.get.apply(doNotAllowMissingProperties(target))
      return value
    }

    if (property in target || propertyAllowedToBeMissing(property)) {
      return target[property]
    }

    throwError(target, property)
  }
}

const accessors = { ...setter, ...getter }

const throwError = (target, propertyName) => {
  let errorTarget

  try {
    errorTarget = JSON.stringify(target)
  } catch (err) {
    try {
      errorTarget = target.constructor.name
    } catch (err) {
      errorTarget = target
    }
  }

  throw new MissingPropertyError(`Property ${JSON.stringify(propertyName)} is missing on ${errorTarget}`)
}

const allowMissingProperties = (proxy) => {
  if (proxy === undefined || proxy === null) {
    return proxy
  }

  return proxy[PROXY_TARGET_PROPERTY] || proxy
}

const doNotAllowMissingProperties = (target) => {
  if (doesNotAllowMissingProperties(target)) {
    return target
  }

  return new Proxy(target, accessors)
}

const allowsMissingProperties = (object) => {
  return !doesNotAllowMissingProperties(object)
}

const doesNotAllowMissingProperties = (object) => {
  return object ? !!object[PROXY_TARGET_PROPERTY] : true
}

module.exports = {
  doNotAllowMissingProperties,
  allowMissingProperties,
  doesNotAllowMissingProperties,
  allowsMissingProperties,
  MissingPropertyError
}
