# lc-js-common
项目中，用到的一些公共函数方法集合。

## 使用方法

例如：

```javascript
import { L } from 'lc-js-common';
const { assert } = require('chai');
it("1.驼峰命名转换数据库命名", () => {
  assert.equal(L.toDBField("tMyTable"), "t_my_table")
  assert.equal(L.toDBField("userName"), "user_name")
  assert.equal(L.toDBField(" id "), "id")
  assert.equal(L.toDBField(), "")
})

it("2.首字母大写", () => {
  assert.equal(L.toFirstWordUpperCase("linc"), "Linc")
  assert.equal(L.toFirstWordUpperCase("Linc"), "Linc")
  assert.equal(L.toFirstWordUpperCase(" linc"), "Linc")
  assert.equal(L.toFirstWordUpperCase(" 123linc"), "123linc")
  assert.equal(L.toFirstWordUpperCase(), "")
})

it("3.获取当前秒的时间戳", () => {
  assert.equal(L.now(), "")
})

it("4.数据库字端转小驼峰", () => {
  assert.equal(L.toLittleHump("user_name"), "userName")
  assert.equal(L.toLittleHump(" user_name "), "userName")
  assert.equal(L.toLittleHump(), "")
})

it("5.判断是否为空", () => {
  assert.equal(L.isNullOrEmpty(""), true)
  assert.equal(L.isNullOrEmpty(), true)
  assert.equal(L.isNullOrEmpty(null), true)
  assert.equal(L.isNullOrEmpty(undefined), true)
  assert.equal(L.isNullOrEmpty(() => {}), false)
  assert.equal(L.isNullOrEmpty([]), true)
  assert.equal(L.isNullOrEmpty({}), true)
  assert.equal(L.isNullOrEmpty(123), false)
  assert.equal(L.isNullOrEmpty("123"), false)
})
  
it("6.去掉左右两边空格", () => {
  assert.equal(L.trim(" 　linc  "), 'linc')
  assert.equal(L.trim("linc  "), 'linc')
  assert.equal(L.trim("  linc"), 'linc')
  assert.equal(L.trim("  l inc"), 'l inc')
})

```

更多事例与覆盖请查看单元测试``test\test.js``