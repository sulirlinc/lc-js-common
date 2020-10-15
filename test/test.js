const { L, TimeUnit, jsonWebToken } = require('../src')
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
    L.array.deleteIndex(deleteIndexArray, 3, 2, 4, 5, 2)
    assert.equal(JSON.stringify(deleteIndexArray),
        JSON.stringify([ 1, 2, 2, 3, 5, 4, 3 ]))
    const deleteLastArray = [ 1, 2, 3 ];
    L.array.deleteLast(deleteLastArray)
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
    const jwt = jsonWebToken("123456");
    const authorization = await jwt.sign(
        { userName: 'chong', roles: [ 'admin', 'manager' ] },
        { expiresIn: '2day' });
    console.log(authorization)
    console.log(await jwt.getUserInfo({ authorization }));
  })
  it("20.mapper", () => {
    const a = {}
    L.mapper(a)({ array: [ 1, 2, 3, 4 ] }, 't')
    console.log(a.t())
  })
  it("21.元转换为分，分转为元", () => {
    const fenToYuan = L.convertAmount(100000001)
    console.log(fenToYuan)
    assert.equal(fenToYuan, "1,000,000.01")
    const yuanToFen = L.convertAmount("1,000,000.01")
    console.log(yuanToFen)
    assert.equal(yuanToFen, 100000001)
  })
  it("22.随机串", () => {
    console.log(L.randomCode(16))
  })
  it("23.随机数", () => {
    console.log(L.randomNumber(16))
  })
  it("24.AES加密", () => {
    const key = L.randomCode(6);
    const { encrypt, decrypt } = L.aes;
    const data = encrypt('absdafadfasdfcdefg', key);
    console.log(data)
    const data1 = decrypt(data, key);
    console.log(data1)
  })
})
