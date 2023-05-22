const { L, TimeUnit, jsonWebToken, array, doConsoleConfig } = require('../src')
const { assert } = require('chai');
describe('公共库测试', () => {

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
    assert.equal(L.now(), parseInt(new Date() / 1000))
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
    assert.equal(L.isNullOrEmpty(() => {
    }), false)
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

  it("7.TimeUnit", () => {
    assert.equal(TimeUnit.days.toSeconds(1), 24 * 60 * 60) //1天=24小时*60分钟*60秒
    assert.equal(TimeUnit.days.toMinutes(1), 24 * 60) //1天=24小时*60分钟
    assert.equal(TimeUnit.days.toMillis(1), 24 * 60 * 60 * 1000) //1天=24*60*60*1000毫秒
    assert.equal(TimeUnit.seconds.toMillis(1), 1000) //1天=24*60*60*1000毫秒
    assert.equal(TimeUnit.microseconds.toMillis(1000), 1) //1000毫秒=1微秒
    assert.equal(TimeUnit.milliseconds.toMillis(1), 1) //1毫秒=1毫秒
  })

  it("8.全局间隔执行", (done) => {
    let i = 1;
    const id = 1234;
    const priorityExecution = true; //put之前先执行一次。
    L.timer.putTrigger({
      id,
      priorityExecution,
      timeUnit: TimeUnit.seconds, interval: 2, trigger: () => {
        console.log(`当前方法被触发了：${ i }次`);
        if (i++ === 10) {
          done();
        }
      }
    });
    L.timer.deleteTrigger({ id });
  }).timeout(100000)

  it("9.日期格式化", () => {
    const format = 'yyyy-MM-dd hh:mm:ss';
    assert.equal(L.dateFormatter(new Date(), format), L.now({ format }))
  })

  it("10.身份证号校验", () => {
    assert.equal(L.checkIDNumber("110101199003074530"), true);
  })

  it("11.删除数组元素", () => {
    const deleteIndexArray = [ 1, 2, 3, 4, 5, 9, 2, 3, 5, 4, 3 ];
    //删除下标
    array.deleteIndex(deleteIndexArray, 3, 2, 4, 5, 2)
    assert.equal(JSON.stringify(deleteIndexArray),
        JSON.stringify([ 1, 2, 2, 3, 5, 4, 3 ]))
    const deleteLastArray = [ 1, 2, 3 ];
    array.deleteLast(deleteLastArray)
    assert.equal(JSON.stringify(deleteLastArray), JSON.stringify([ 1, 2 ]))
  })

  it("12.获取当天日期", () => {
    console.log(L.now())
    console.log(L.getCurrentDay())
  })
  it("13.range", () => {
    L.range(1001, (i) => {
      console.log(i);
    });
  })

  it("14.获取当前日期的之前N天", () => {
    console.log(L.getCurrentDay() - (TimeUnit.days.toSeconds(60)))
  })

  it("15.md5", () => {
    console.log(L.md5(123456))
  })

  it("16.hash512", () => {
    console.log(L.hash512("666", 123456))
    console.log(L.hash512NoSalt("xdak3@@#Fsg2x"))
  })

  it("17.base64", () => {
    const base64 = L.base64;
    const message = base64.encrypt(1);
    console.log(message)
    console.log(base64.decrypt(message))
  })

  it("18.uuid", () => {
    console.log(L.uuid())
  })

  it("19.jwt", async () => {
    const jwt = jsonWebToken("bd82oGov07WK^f.@");
    const authorization = await jwt.sign(
        {
          name: 'Linc',
          age: 32
        },
        {
          expiresIn: '2day', header: {
            userId: 1001, name: "Linc"
          }
        });
    console.log("verify", await jwt.verify(authorization, { complete: true }))
    console.log(authorization)
    console.log(await jwt.getUserInfo({ authorization }));
  })
  it("20.mapper", () => {
    const a = {}
    const array = [ 1, 2, 3, 4 ];
    const map = {
      'a': 1,
      'b': 2
    };
    L.mapper(a)({ array, map }, 't')
    assert.equal(a.t(), array)
    assert.equal(a.t('map'), map)
    console.log(a.t())
    console.log(a.t('map'))
  })
  it("21.元转换为分，分转为元", () => {
    const fenToYuan = L.convertAmount(100000001)
    console.log(fenToYuan)
    assert.equal(fenToYuan, "1,000,000.01")
    const yuanToFen = L.convertAmount("1,000,000.01")
    console.log(yuanToFen)
    assert.equal(yuanToFen, 100000001)
  })
  it("22.随机串(包含符号)", () => {
    console.log(L.randomSymbolCode(16))
  })
  it("22.字母+数字随机串", () => {
    console.log(L.randomCode(32))
  })
  it("23.随机数", () => {
    console.log(L.randomNumber(16))
  })
  it("23.2.随机指定大小的数", () => {
    console.log(L.randomNumberValue(2))
  })
  it("24.AES加密", () => {
    const key = "bUuL9inPj2isXZMS"//L.randomCode(16);
    console.log(key)
    const { encrypt, decrypt } = L.aes;
    const data = encrypt({
      data: 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAIKT6ARpR9oedF5g0PPbAdODjgRr881smKW/N3klOFPwTyEE4YBBQdotH5h2YgM9OAGnshesD6Nvo7nsueOtJ/ra/nfbTUTxP8joAC0WG9j4w0K+flwd+TLONsP8/K+VPrJe/uvND66zmX9RR2m27ImjDVdXrFRo7vJSvHmT9J9LAgMBAAECgYB8095a0TaSKsj+LDm01SnixQGv8m9Ic0deM/VZB57Yh4Ntwle8nyXP55Er1AgQpqZy1phnDuKIUEJJjCeMoszzHhI8k4n7Y7G3jh9FjFVOotZDdGTjaxniZ2O7PBbm1ILwqS7v3uz9ya9aghUde9wWXRD5u0j2CbonSvyMYkd4YQJBANYpPeX4cKxLmdERbofJ3bBR6fu9PlMiKFXsuudv2rgiIEP+/2KjtUq1j8uhnlv+kiPL3qkAeI8WULTlE/teAlsCQQCcFnFD1frOlApZB89dIcxO6mSaj9J02aykoZ1woR2IqAeRokcDjuMmWvnbseIFY2KFNCnpt5WsSPzMRdCVdonRAkBOcXrHsnFq2qIzrwPiXvGBtO9UkyOyBa/qkTSAszrU+UMCRPO8aKRuAgTynHdJ0Pwsem9LTe3a01yqdcIU74FDAkEAjwgFvMrdrOV94f3FKKurA/nIPNZkXY2GpcovcqFBZhPL88lH19vdDS263nZQDu32vueBLNl9P0YW2b10GTJpsQJAMof3zQNPdXLIxLCPNhAnNs+IZdt6ph0zdxt6I+HaTEGKZ7LYO2bynio9W/J56Xta69n4DYVsZEeSqSCoLdUwKA==',
      key
    });
    console.log(data)
    const data1 = decrypt({ data, key });
    console.log(data1)
  })
  it("25.替换末尾为0的方法", () => {
    assert.equal(L.replaceNumWith0AtEnd("0.000128800", 2), "0.0001288")
    assert.equal(L.replaceNumWith0AtEnd("12340.8000", 2), "12340.80")
    assert.equal(L.replaceNumWith0AtEnd("0.80000", 3), "0.800")
    assert.equal(L.replaceNumWith0AtEnd("12340.8000", 3, true), "12,340.800")
    assert.equal(L.replaceNumWith0AtEnd("12340", 3, true), "12,340.000")
    assert.equal(
        L.replaceNumWith0AtEndEx({ num: "12340", thousandCharacter: true }),
        "12,340.00")
  })
  it("26.rsa", () => {
    console.log(L.rsa.createKey())
  })
  it("27.数组去重", () => {
    let values = [
      { id: 1, name: 'a', b: 1 },
      { id: 1, name: 'a', b: 2 },
      { id: 1, name: 'a', b: 3 },
      { id: 2, name: 'b', b: 3 } ]
    const primaryKeys = [ 'id' ]; //去重主键
    const targetKeys = [ 'id', 'name' ]; // 返回对象。
    console.log(array.deDuplication(values, primaryKeys, targetKeys))
  })
  it("28.时间段内只被执行一次。", () => {
    const key = L.uuid();
    const fun = function () {
      console.log('被执行了。')
    };
    const lockTime = 3;
    const timeUnit = TimeUnit.seconds;
    // lockTime= 3 与TimeUnit.seconds ，3秒内，只能被执行一次。
    L.defineExecution(fun, {
      key, lockTime, timeUnit
    })
    setTimeout(() => L.defineExecution(fun, {
      key, lockTime, timeUnit
    }), 2000);
    setTimeout(() => L.defineExecution(fun, {
      key, lockTime, timeUnit
    }), 2000);
    //方法在4秒内被执行了，3次，开始执行一次，睡2秒后被执行一次，第4秒又被执行了一次，
    //最后结果会出现两次被执行了。分别是开始调用与第三次调用。
  }).timeout(100000)
  it("29.signMd5", () => {
    const signSalt = "Bmt0p4A5PfZvfKdt";
    /*console.log(L.signMd5(signSalt, {
      "sign": "b950fca93c66b8dc7f3e97e5a93ff46a",
      "message": "这个是已经通过签名的，不在线时，上线时推送。",
      "userId": 1001,
      "type": "simple"
    }))*/
    const m = {
      title: "提示",
      message: "userId:433测试。",
      duration: 2000,
      userId: 433,
      type: "success",
      biz: JSON.stringify({
        code: "paymentOrder",
        path: "",
        objectId: "1234567L"
      })
    };
    m['sign'] = L.signMd5(signSalt, m)
    console.log(JSON.stringify(m))
  })
  it("30.add console.log time add code line", () => {
    doConsoleConfig()
    console.log("hello world.", "4466", "7788", "15458")
  })
  it("39.includeSlash = false value = https://127.0.0.1:8080/ => https://127.0.0.1:8080 value = https://127.0.0.1:8080 => https://127.0.0.1:8080 includeSlash = true value = https://127.0.0.1:8080/ => https://127.0.0.1:8080/ value = https://127.0.0.1:8080 => https://127.0.0.1:8080/", () => {
    assert.equal(L.replacePathLastSlash({ value:'https://127.0.0.1:8080/', includeSlash: true }), 'https://127.0.0.1:8080/')
    assert.equal(L.replacePathLastSlash({ value:'https://127.0.0.1:8080/', includeSlash: false }), 'https://127.0.0.1:8080')
    assert.equal(L.replacePathLastSlash({ value:'https://127.0.0.1:8080', includeSlash: true }), 'https://127.0.0.1:8080/')
    assert.equal(L.removeLashSlash('https://127.0.0.1:8080/'), 'https://127.0.0.1:8080')
    assert.equal(L.removeLashSlash('https://127.0.0.1:8080'), 'https://127.0.0.1:8080')
    assert.equal(L.addLashSlash('https://127.0.0.1:8080'), 'https://127.0.0.1:8080/')
    assert.equal(L.addLashSlash('https://127.0.0.1:8080/'), 'https://127.0.0.1:8080/')
  })
  it("40.includeSlash = false value = /abc/efg => abc/efg value = abc/efg => abc/efg includeSlash = true value = /abc/efg => /abc/efg value = abc/efg => /abc/efg", () => {
    assert.equal(L.replacePathFirstSlash({ value:'/abc/efg', includeSlash: true }), '/abc/efg')
    assert.equal(L.replacePathFirstSlash({ value:'abc/efg', includeSlash: true }), '/abc/efg')
    assert.equal(L.replacePathFirstSlash({ value:'abc/efg', includeSlash: false }), 'abc/efg')
    assert.equal(L.replacePathFirstSlash({ value:'/abc/efg', includeSlash: false }), 'abc/efg')
    assert.equal(L.removeFirstSlash('/abc/efg'), 'abc/efg')
    assert.equal(L.removeFirstSlash('abc/efg'), 'abc/efg')
    assert.equal(L.addFirstSlash('/abc/efg'), '/abc/efg')
    assert.equal(L.addFirstSlash('abc/efg'), '/abc/efg')
  })

})
