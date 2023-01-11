const { format } = require('currency-formatter')
const crypto = require('crypto')
const timer = require('./timer')
const uuidv1 = require('uuid/v1')
const jsrsasign = require('jsrsasign')
const NodeRSA = require('node-rsa')
const CryptoJS = jsrsasign.CryptoJS
const enc = CryptoJS.enc
const timeoutMap = {}
const errors = {
  true(errorCodeMessage = { message: '逻辑错误', code: -10000 }) {
    throw errorCodeMessage
  },
  false() {
  }
}
const trim = value => {
  if (value == null || typeof value == 'undefined') {
    return ''
  }
  return value.replace(/(^\s*)|(\s*$)/g, '')
}

function buildRandomCode(length,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function buildRandomSymbolCode(length) {
  return buildRandomCode(length,
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*.,')
}

function buildRandomNumber(length) {
  let result = ''
  const characters = '0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const typeMapNullOrEmpty = {
  'object': (value) => {
    for (const key in value) {
      return false
    }
    return true
  },
  'boolean': () => false,
  'number': () => false,
  'function': () => false,
  'string': (value) => {
    return trim(value) === ''
  }
}

const padLeftZero = (str) => {
  return ('00' + str).substr(str.length)
}
const arrayDeleteByIndex = (array, index) => {
  if (!lc.array.isArrayType(array) || array.length - 1 < index) {
    return array
  }
  const number = array.length - 1
  delete array[index]
  for (let i = index; i < number; i++) {
    array[i] = array[i + 1]
  }
  return lc.array.deleteLast(array)
}
/**
 * 日期格式化
 * @param date
 * @param format
 * @returns {void | string | *}
 */
const dateFormatter = (date, format) => {
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  var o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (var k in o) {
    if (new RegExp(`(${ k })`).test(format)) {
      var str = o[k] + ''
      format = format.replace(RegExp.$1,
        (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return format
}

const lc = {
  TimeUnit: require('timeunit'),
  L: {
    dateFormatter,
    timer,
    trim,
    replacePathLastSlash({ value = '', includeSlash = true }) {
      value = value.replace(/^([^|]+)(\/)$/g, '$1')
      return value + (includeSlash ? '/' : '')
    },
    removeLashSlash(value = '') {
      return lc.L.replacePathLastSlash({ value, includeSlash: false })
    },
    addLashSlash(value = '') {
      return lc.L.replacePathLastSlash({ value, includeSlash: true })
    },
    replacePathFirstSlash({ value = '', includeSlash = true }) {
      value = value.replace(/^(\/)([^|]+)$/g, '$2')
      return (includeSlash ? '/' : '') + value
    },
    removeFirstSlash(value = '') {
      return lc.L.replacePathFirstSlash({ value, includeSlash: false })
    },
    addFirstSlash(value = '') {
      return lc.L.replacePathFirstSlash({ value, includeSlash: true })
    },
    randomCode(length) {
      return buildRandomCode(length)
    },
    randomSymbolCode(length) {
      return buildRandomSymbolCode(length)
    },
    randomNumber(length) {
      return buildRandomNumber(length)
    },
    /**
     * 替换末尾为0的方法，
     * 如：0.01000可替换成0.01
     */
    replaceNumWith0AtEnd(num, keepDecimalPlaces = 2,
      thousandCharacter = false) {
      const s = `${ num }`.replace(
        new RegExp(`(\\d+\\.\\d{${keepDecimalPlaces}}(\\d*[1-9])*)(0*)`),
        '$1')
      if (thousandCharacter) {
        const split = s.split('.')
        return `${ (split[0]).replace(/\d{1,3}(?=(\d{3})+$)/g,
          '$&,') }.${ (split[1] || '').padEnd(keepDecimalPlaces, '0') }`
      }
      return s
    },
    replaceNumWith0AtEndEx({
      num,
      keepDecimalPlaces = 2,
      thousandCharacter = false
    }) {
      return lc.L.replaceNumWith0AtEnd(num, keepDecimalPlaces,
        thousandCharacter)
    },
    getCurrentDay: (arg = {}) => arg.format ? dateFormatter(
      new Date(new Date().toLocaleDateString()), arg.format) : parseInt(
      (new Date(new Date().toLocaleDateString()) / 1000) + ''),
    now: (arg = {}) => arg.format ? dateFormatter(new Date(), arg.format)
      : parseInt((new Date() / 1000) + ''),
    toReplace: (str, regex, callback) => {
      str = trim(str)
      return str === '' ? str : str.replace(regex, callback)
    },
    toDBField: str => {
      return lc.L.toReplace(str, /[A-Z]/g,
        (word) => '_' + ((word + '').toLowerCase()))
    },
    uuid: () => {
      return uuidv1()
    },
    toLittleHump: str => {
      return lc.L.toReplace(str, /\_[a-z]/g,
        (word) => word.substring(1).toUpperCase())
    },
    toFirstWordUpperCase: str => {
      str = trim(str)
      return lc.L.toReplace(str, /^[a-z]/, (word) => word.toUpperCase())
    },
    isNull: value => {
      if (typeof value == 'undefined' || value == null) {
        return true
      }
    },
    isFunction(val) {
      return typeof val === 'function'
    },
    isObject(val) {
      return val !== null && typeof val === 'object'
    },
    isPromise(val) {
      lc.L.isObject(val) && lc.L.isFunction(val.then) && lc.L.isFunction(
        val.catch)
    },
    isNullOrEmpty: value => {
      return lc.L.isNull(value) || typeMapNullOrEmpty[typeof value](value)
    },
    checkIDNumber(value) {
      return !lc.L.isNullOrEmpty(value)
        && /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
          value)
    },
    range(size, callback) {
      if (/^[1-9]\d{0,9}$/.test(size) && typeof callback === 'function') {
        [...Array(size).keys()].map(callback)
      }
    },
    md5(value) {
      return CryptoJS.MD5(value.toString()).toString().toLowerCase()
    },
    signMd5(signSalt, map, {
      symbol = '|',
      includeKey = false,
      joiner = '',
      signKeySymbol = '|'
    } = {}) {
      const arr = []
      for (const k in map) {
        arr.push(k)
      }
      arr.sort()
      let value = ''
      for (const k of arr) {
        value += symbol + (includeKey ? k + joiner : '') + map[k]
      }
      const content = value.substring(1) + signKeySymbol + signSalt
      return lc.L.md5(content)
    },
    hash512(key, value) {
      return CryptoJS.HmacSHA512(key, value.toString()).toString()
    },
    hash512NoSalt(value) {
      return CryptoJS.SHA512(value.toString()).toString()
    },
    aes: {
      cipherEncoding: 'base64',
      clearEncoding: 'utf8',
      aes128Ecb: 'aes-128-ecb',
      encrypt({ data, key, iv = '' }) {
        const cipherChunks = []
        const cipher = crypto.createCipheriv(lc.L.aes.aes128Ecb, key, iv)
        cipher.setAutoPadding(true)
        cipherChunks.push(cipher.update(data, 'utf8', lc.L.aes.cipherEncoding))
        cipherChunks.push(cipher.final(lc.L.aes.cipherEncoding))
        return cipherChunks.join('')
      },
      decrypt({ data, key, iv = '' }) {
        const cipherChunks = []
        const decipher = crypto.createDecipheriv(lc.L.aes.aes128Ecb, key, iv)
        decipher.setAutoPadding(true)
        cipherChunks.push(decipher.update(data, lc.L.aes.cipherEncoding,
          lc.L.aes.clearEncoding))
        cipherChunks.push(decipher.final(lc.L.aes.clearEncoding))
        return cipherChunks.join('')
      }
    },
    base64: {
      decrypt: (value) => enc.Base64.parse(value).toString(enc.Utf8),
      encrypt: (value) => enc.Base64.stringify(enc.Utf8.parse(value))
    },
    mapper(obj) {
      return (data = {}, target) => {
        //const { array = [], map, enums, values } = data
        obj[target] = (name) => (data)[name || 'array']
      }
    },
    /**
     * 元转为分，分转为元。
     * String为元->Integer为分
     * @param value
     * @returns {number | string}
     */
    convertAmount(value) {
      try {
        if (typeof (value) === 'number') {
          return format(((value || 0) / 10.0 / 10.0), {
            code: 'USD',
            symbol: ''
          })
          //    return ((value || 0) / 10.0 / 10.0).toFixed(2)
        } else if (typeof (value) === 'string') {
          return parseFloat((value || '0').replace(/,/g, '')) * 10 * 10
        }
      } catch (e) {
      }
      return 0
    },
    rsa: {
      createKey() {
        const key = new NodeRSA({ b: 2048 }) //生成2048位的密钥
        const publicPEM = key.exportKey('pkcs8-public-pem')  //公钥
        const privatePEM = key.exportKey('pkcs8-private-pem')//私钥
        return {
          privatePEM,
          publicPEM,
          publicKey: publicPEM.replace('-----BEGIN PUBLIC KEY-----\n',
            '').replace('\n-----END PUBLIC KEY-----', ''),
          privateKey: privatePEM.replace('-----BEGIN PRIVATE KEY-----\n',
            '').replace('\n-----END PRIVATE KEY-----', '')
        }
      }
    },
    defineExecution(fun,
      { key, lockTime = 1, timeUnit = lc.TimeUnit.minutes }) {
      errors[!key]({ message: 'Key 不能为空', code: -10001 })
      errors[!(fun instanceof Function)]({ message: '必须是方法', code: -10002 })
      const now = new Date() + 0
      const timeout = timeoutMap[key] || 0
      if (now >= timeout) {
        timeoutMap[key] = now + timeUnit.toMillis(lockTime)
        fun()
      }
    }
  },
  array: {
    /**
     * 去重
     * @param array
     * @param primaryKeys
     * @param targetKeys
     */
    deDuplication(array, primaryKeys = [], targetKeys = []) {
      const keys = []
      return array.map(value => {
        const pk = {}
        targetKeys = targetKeys.length < 1 ? primaryKeys : targetKeys
        if (primaryKeys.length > 0) {
          for (let primaryKey of primaryKeys) {
            pk[primaryKey] = value[primaryKey]
          }
          const searchElement = JSON.stringify(pk)
          if (keys.includes(searchElement)) {
            return
          }
          keys.push(searchElement)
          const v = {}
          for (let targetKey of targetKeys) {
            v[targetKey] = value[targetKey]
          }
          return v
        }
        return value
      }).filter(value => !!value)
      //  return [ ...new Set(array.map(value=>JSON.stringify(value))) ].map(value => JSON.parse(value));
    },
    isArrayType(value) {
      return value instanceof Array
    },
    deleteLast(array) {
      if (!lc.array.isArrayType(array)) {
        return array
      }
      const number = array.length - 1
      delete array[number]
      array.length = number
      return array
    },
    deleteIndex(array, ...indexes) {
      let i = 0;
      [...new Set(indexes)].sort().map(index => {
        arrayDeleteByIndex(array, index - i++)
      })
      return array
    }
  },
  jsonWebToken: (key) => {
    const jwt = require('jsonwebtoken')
    const ts = {
      sign(payload, options) {
        return new Promise(
          (resolve, reject) => jwt.sign(payload, key,
            options,
            (err, token) => err ? reject() : resolve(token)))
      },
      verify(authorization, options) {
        return new Promise((resolve, reject) =>
          jwt.verify(authorization, key, options,
            (err, authData) => err ? reject(
              new Error(
                `无效的授权码。\n${ err.message || '' }\n${ err.stack }`))
              : resolve(authData)))
      },
      getUserInfo({ authorization, check = true, options = {} }) {
        return new Promise((resolve, reject) => {
          if (!check) {
            resolve(jwt.decode(authorization, options))
          } else {
            ts.verify(authorization, options).then(
              (info) => resolve(info)).catch(
              e => reject(e))
          }
        })
      }
    }
    return ts
  },
  doConsoleConfig({ padEndNumber = 40, address = process.cwd() + '/' } = {}) {
    const getStackTrace = function() {
      const obj = {}
      Error.captureStackTrace(obj, getStackTrace)
      return obj.stack
    }
    const log = console.log
    console.log = function() {
      const stack = getStackTrace() || ''
      const matchResult = stack.match(/\(.*?\)/g) || []
      const line = matchResult[1] || ''
      const i = arguments.length - 1
      if (typeof arguments[i] == 'object') {
        arguments[i] = JSON.stringify(arguments[i])
      }
      arguments[0] = lc.L.now({ format: 'yyyy-MM-dd hh:mm:ssss' })
        + ' ['
        + line.replace('(', '').replace(')', '').replace(address, '').replace(
          '/snapshot/service/src/', '').padEnd(
          padEndNumber, ' ')
        + '] '
        + arguments[0]
      /*arguments[i] += "[" + lc.L.now({ format: 'yyyy-MM-dd hh:mm:sss' })
          + "]["
          + line.replace("(", "").replace(")", "") + "]"*/
      log.apply(console, arguments)
    }

  }
}

module.exports = lc
