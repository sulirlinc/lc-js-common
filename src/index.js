const { format, unformat } = require('currency-formatter')
const crypto = require('crypto')
const timer = require('./timer')
const uuidv1 = require('uuid/v1')
const jsrsasign = require('jsrsasign')
const CryptoJS = jsrsasign.CryptoJS
const enc = CryptoJS.enc
const trim = value => {
  if (value == null || typeof value == "undefined") {
    return "";
  }
  return value.replace(/(^\s*)|(\s*$)/g, "");
}

function buildRandomCode(length,
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function buildRandomNumber(length) {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const typeMapNullOrEmpty = {
  "object": (value) => {
    for (const key in value) {
      return false
    }
    return true
  },
  "boolean": () => false,
  "number": () => false,
  "function": () => false,
  "string": (value) => {
    return trim(value) === "";
  }
}

const padLeftZero = (str) => {
  return ('00' + str).substr(str.length)
}
const arrayDeleteByIndex = (array, index) => {
  if (!lc.L.array.isArrayType(array) || array.length - 1 < index) {
    return array
  }
  const number = array.length - 1;
  delete array[index]
  for (let i = index; i < number; i++) {
    array[i] = array[i + 1]
  }
  return lc.L.array.deleteLast(array)
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
    randomCode(length) {
      return buildRandomCode(length)
    },
    randomNumber(length) {
      return buildRandomNumber(length)
    },
    /**
     * 替换末尾为0的方法，
     * 如：0.01000可替换成0.01
     */
    replaceNumWith0AtEnd(num, keepDecimalPlaces = 2, thousandCharacter = false) {
      const s = `${ num }`.replace(new RegExp(`(\\d+\\.\\d{${keepDecimalPlaces}}(\\d*[1-9])*)(0*)`), '$1');
      if (thousandCharacter) {
        const split = s.split('.')
        return `${ (split[0]).replace(/\d{1,3}(?=(\d{3})+$)/g,
            '$&,') }.${ (split[1] || '').padEnd(keepDecimalPlaces, '0') }`;
      }
      return s
    },
    replaceNumWith0AtEndEx({ num, keepDecimalPlaces = 2, thousandCharacter = false }) {
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
      return str === "" ? str : str.replace(regex, callback)
    },
    toDBField: str => {
      return lc.L.toReplace(str, /[A-Z]/g,
          (word) => "_" + ((word + "").toLowerCase()))
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
      if (typeof value == "undefined" || value == null) {
        return true
      }
    },
    isNullOrEmpty: value => {
      return lc.L.isNull(value) || typeMapNullOrEmpty[typeof value](value)
    },
    checkIDNumber(value) {
      return !lc.L.isNullOrEmpty(value)
          && /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
              value);
    },
    range(size, callback) {
      if (/^[1-9]\d{0,9}$/.test(size) && typeof callback === 'function') {
        [ ...Array(size).keys() ].map(callback);
      }
    },
    md5(value) {
      return CryptoJS.MD5(value.toString()).toString().toLowerCase();
    },
    hash512(key, value) {
      return CryptoJS.HmacSHA512(key, value.toString()).toString();
    },
    aes: {
      cipherEncoding: 'base64',
      clearEncoding: 'utf8',
      aes128Ecb: 'aes-128-ecb',
      encrypt({ data, key, iv = '' }) {
        const cipherChunks = [];
        const cipher = crypto.createCipheriv(lc.L.aes.aes128Ecb, key, iv);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(data, 'utf8', lc.L.aes.cipherEncoding));
        cipherChunks.push(cipher.final(lc.L.aes.cipherEncoding));
        return cipherChunks.join('');
      },
      decrypt({ data, key, iv = '' }) {
        const cipherChunks = [];
        const decipher = crypto.createDecipheriv(lc.L.aes.aes128Ecb, key, iv);
        decipher.setAutoPadding(true);
        cipherChunks.push(decipher.update(data, lc.L.aes.cipherEncoding, lc.L.aes.clearEncoding));
        cipherChunks.push(decipher.final(lc.L.aes.clearEncoding));
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
          return parseFloat((value || "0").replace(/,/g, '')) * 10 * 10
        }
      } catch (e) {
      }
      return 0
    }
  },
  array: {
    isArrayType(value) {
      return value instanceof Array
    },
    deleteLast(array) {
      if (!lc.L.array.isArrayType(array)) {
        return array
      }
      const number = array.length - 1;
      delete array[number]
      array.length = number
      return array
    },
    deleteIndex(array, ...indexes) {
      let i = 0;
      [ ...new Set(indexes) ].sort().map(index => {
        arrayDeleteByIndex(array, index - i++)
      })
      return array
    }
  },
  jsonWebToken: (key) => {
    const jwt = require('jsonwebtoken');
    const ts = {
      sign(payload, options) {
        return new Promise(
            (resolve, reject) => jwt.sign(payload, key,
                options,
                (err, token) => err ? reject() : resolve(token)));
      },
      getUserInfo({ authorization, check = true }) {
        return new Promise((resolve, reject) => {
          let userInfo = jwt.decode(authorization);
          if (!check) {
            resolve(userInfo);
            return
          }
          jwt.verify(authorization, key, (err, authData) => err ? reject(
              new Error(`无效的授权码。\n${ err.message || '' }\n${ err.stack }`))
              : resolve(authData));
        })
      }
    }
    return ts
  }
}

module.exports = lc