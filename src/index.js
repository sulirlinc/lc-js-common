const timer = require("./timer")

const trim = value => {
  if (value == null || typeof value == "undefined") {
    return "";
  }
  return value.replace(/(^\s*)|(\s*$)/g, "");
}

const typeMapNullOrEmpty = {
  "object": (value) => {
    for (const key in value) {
      return false
    }
    return true
  },
  "array": (value) => {
    return value.length <= 0
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

/**
 * 日期格式化
 * @param date
 * @param format
 * @returns {void | string | *}
 */
const dateFormatter = (date, format) => {
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
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
      format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
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
    now: ({ format }) => format ? dateFormatter(new Date(), format) : parseInt((new Date() / 1000) + ''),
    toReplace: (str, regex, callback) => {
      str = trim(str)
      return str === "" ? str : str.replace(regex, callback)
    },
    toDBField: str => {
      return lc.L.toReplace(str, /[A-Z]/g, (word) => "_" + ((word + "").toLowerCase()))
    },
    toLittleHump: str => {
      return lc.L.toReplace(str, /\_[a-z]/g, (word) => word.substring(1).toUpperCase())
    },
    toFirstWordUpperCase: str => {
      str = trim(str)
      return lc.L.toReplace(str, /^[a-z]/, (word) => word.toUpperCase())
    },
    isNullOrEmpty: value => {
      if (typeof value == "undefined" || value == null) {
        return true
      }
      return typeMapNullOrEmpty[typeof value](value)
    }
  }
}
module.exports = lc