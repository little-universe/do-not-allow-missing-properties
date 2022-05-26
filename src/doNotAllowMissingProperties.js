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
  set (target, property, value) {
    const descriptor = Object.getOwnPropertyDescriptor(target.constructor?.prototype, property)

    if (descriptor && descriptor.set) {
      descriptor.set.apply(doNotAllowMissingProperties(target), [value])
      return true
    }

    if (property in target) {
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

    if (property in target || allowedMethods.includes(property) || !isString(property)) {
      return target[property]
    }

    throwError(target, property)
  }
}

const accessors = { ...setter, ...getter }

const throwError = (target, propertyName) => {
  throw new MissingPropertyError(`Property ${JSON.stringify(propertyName)} is missing on ${target}`)
}

const allowMissingProperties = (proxy) => {
  if (proxy === undefined || proxy === null) {
    return proxy
  }

  return proxy[PROXY_TARGET_PROPERTY] || proxy
}

const doNotAllowMissingProperties = (target) => {
  if (target === undefined || target === null) {
    return target
  }

  return new Proxy(target, accessors)
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
