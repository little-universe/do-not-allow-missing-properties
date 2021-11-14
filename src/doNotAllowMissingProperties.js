const { isFunction, isString } = require('lodash')

const MissingPropertyError = class extends Error { }

const PROXY_TARGET_PROPERTY = '__doNotAllowMissingPropertiesProxyTarget'
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

const getterWithPrivateFieldSupport = {
  get (object, property) {
    const value = getter.get(object, property)

    if (isMethod(object, property)) {
      // we want to bind to object so that if invoked this method has access to the
      // lexical scope it was defined in which will allow private fields to work properly
      return value.bind(object)
    }
    return value
  }
}

const accessors = { ...setter, ...getter }
const accessorsWithPrivateFieldSupport = { ...setter, ...getterWithPrivateFieldSupport }

const throwError = (propertyName) => {
  throw new MissingPropertyError(`Property '${JSON.stringify(propertyName)}' is missing`)
}

const allowMissingProperties = (proxy) => {
  if (proxy === undefined || proxy === null) {
    throw new Error('cannot allowMissingProperties of ' + proxy)
  }

  return proxy[PROXY_TARGET_PROPERTY] || proxy
}

const doNotAllowMissingProperties = (object, supportPrivateFields = true) => {
  if (object === undefined || object === null) {
    throw new Error('cannot doNotAllowMissingProperties of ' + object)
  }

  if (supportPrivateFields && isInstanceOfAClass(object)) {
    return new Proxy(object, accessorsWithPrivateFieldSupport)
  } else {
    return new Proxy(object, accessors)
  }
}

const isClass = (o) => o && isFunction(o) && /^class /.test(o.toString())
const isInstanceOfAClass = (o) => isClass(o.constructor)
const isRegularFunction = (f) => f && isFunction(f) && !isClass(f) && !('prototype' in f)
const isMethod = (object, property) => object && property && isRegularFunction(object[property]) && isInstanceOfAClass(object)

module.exports = {
  doNotAllowMissingProperties,
  allowMissingProperties,
  MissingPropertyError
}
