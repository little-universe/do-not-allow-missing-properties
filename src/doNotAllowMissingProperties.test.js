const { doNotAllowMissingProperties, allowMissingProperties, MissingPropertyError } = require('./doNotAllowMissingProperties')

describe('doNotAllowMissingProperties()', () => {
  describe('classes', () => {
    let Klass
    let instance

    beforeEach(() => {
      Klass = class {
        exists = 'exists'
      }

      instance = doNotAllowMissingProperties(new Klass())
    })

    describe('instance is still like an instance of the class', () => {
      it('has the expected constructor', () => {
        expect(instance.constructor).toEqual(Klass)
      })
    })

    describe('read existing property', () => {
      it('returns property value', () => {
        expect(instance.exists).toEqual('exists')
      })
    })

    describe('read non-existing property', () => {
      it('throws MissingPropertyError', () => {
        expect(() => instance.doesNotExist).toThrowError(MissingPropertyError)
      })
    })

    describe('write existing property', () => {
      it('sets property value', () => {
        instance.exists = 'new value'
        expect(instance.exists).toEqual('new value')
      })
    })

    describe('write non-existing property', () => {
      it('throws MissingPropertyError', () => {
        expect(() => { instance.doesNotExist = 'new value' }).toThrowError(MissingPropertyError)
      })
    })

    describe('allowMissingProperties()', () => {
      describe('read existing property', () => {
        it('returns property value', () => {
          expect(allowMissingProperties(instance).exists).toEqual('exists')
        })
      })

      describe('read non-existing property', () => {
        it('returns property value', () => {
          expect(allowMissingProperties(instance).doesNotExist).toEqual(undefined)
        })
      })

      describe('write existing property', () => {
        it('sets property value and returns property value', () => {
          const returnValue = allowMissingProperties(instance).exists = 'new value'
          expect(instance.exists).toEqual('new value')
          expect(returnValue).toEqual('new value')
          expect(allowMissingProperties(instance).exists).toEqual('new value')
        })
      })

      describe('write non-existing property', () => {
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
