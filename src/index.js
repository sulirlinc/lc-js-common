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
const lc = {
  TimeUnit: require('timeunit'),
  L: {
    timer,
    trim,
    now: () => parseInt((new Date() / 1000) + ''),
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