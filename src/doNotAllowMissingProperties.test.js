const { doNotAllowMissingProperties, allowMissingProperties, MissingPropertyError } = require('./doNotAllowMissingProperties')

describe('doNotAllowMissingProperties()', () => {
  describe('classes', () => {
    let Klass
    let instance

    beforeEach(() => {
      Klass = class {
        #privateField = 'private field'

        exists = 'exists'

        getPrivateField () {
          return this.#privateField
        }

        getNonExistentField () {
          return this.doesNotExist
        }

        get getsetForExistingField () {
          return this.exists
        }

        set getsetForExistingField (value) {
          this.exists = value
        }

        get getsetForNonExistentField () {
          return this.doesNotExist
        }

        set getsetForNonExistentField (value) {
          this.doesNotExist = value
        }
      }

      instance = doNotAllowMissingProperties(new Klass())
    })

    describe('instance is still like an instance of the class', () => {
      it('has the expected constructor', () => {
        expect(instance.constructor).toEqual(Klass)
      })
    })

    describe('read existing public field', () => {
      it('returns property value', () => {
        expect(instance.exists).toEqual('exists')
      })
    })

    describe('read non-existing public field', () => {
      it('throws MissingPropertyError', () => {
        expect(() => instance.doesNotExist).toThrowError(MissingPropertyError)
      })
    })

    describe('write existing public field', () => {
      it('sets property value', () => {
        instance.exists = 'new value'
        expect(instance.exists).toEqual('new value')
      })
    })

    describe('write non-existing public field', () => {
      it('throws MissingPropertyError', () => {
        expect(() => { instance.doesNotExist = 'new value' }).toThrowError(MissingPropertyError)
      })
    })

    describe('public method that accesses non-existent field', () => {
      it('throws MissingPropertyError', () => {
        expect(() => instance.getNonExistentField()).toThrowError(MissingPropertyError)
      })
    })

    describe('public getter that accesses non-existent field', () => {
      it('throws MissingPropertyError', () => {
        expect(() => instance.getsetForNonExistentField).toThrowError(MissingPropertyError)
      })
    })

    describe('public setter that sets non-existent field', () => {
      it('throws MissingPropertyError', () => {
        expect(() => { instance.getsetForNonExistentField = 'foo' }).toThrowError(MissingPropertyError)
      })
    })

    describe('public getter that accesses existing field', () => {
      it('returns property value', () => {
        expect(instance.getsetForExistingField).toEqual('exists')
      })
    })

    describe('public setter that sets existing field', () => {
      it('sets property', () => {
        expect(() => { instance.getsetForExistingField = 'foo' }).not.toThrowError()
        expect(instance.exists).toEqual('foo')
        expect(instance.getsetForExistingField).toEqual('foo')
      })
    })

    describe('public method that accesses private field', () => {
      it('cannot access private fields, unfortunately', () => {
        // There doesn't seem to be a solution to this.
        // you could bind the getPrivateField method to the proxy
        // target in doNotAllowMissingProperties but then getPrivateField
        // will execute without protection. Not worth it, better to avoid
        // private field usage and use _ prefixed properties convention.
        expect(() => instance.getPrivateField()).toThrowError(TypeError)
      })
    })

    describe('allowMissingProperties()', () => {
      describe('read existing public field', () => {
        it('returns property value', () => {
          expect(allowMissingProperties(instance).exists).toEqual('exists')
        })
      })

      describe('read non-existing public field', () => {
        it('returns property value', () => {
          expect(allowMissingProperties(instance).doesNotExist).toEqual(undefined)
        })
      })

      describe('write existing public field', () => {
        it('sets property value and returns property value', () => {
          const returnValue = allowMissingProperties(instance).exists = 'new value'
          expect(instance.exists).toEqual('new value')
          expect(returnValue).toEqual('new value')
          expect(allowMissingProperties(instance).exists).toEqual('new value')
        })
      })

      describe('write non-existing public field', () => {
        it('sets property value and returns property value', () => {
          const returnValue = allowMissingProperties(instance).doesNotExist = 'new value'
          expect(instance.doesNotExist).toEqual('new value')
          expect(returnValue).toEqual('new value')
          expect(allowMissingProperties(instance).doesNotExist).toEqual('new value')
        })
      })
    })
  })
})
