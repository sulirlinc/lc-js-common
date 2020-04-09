const uuidv1 = require('uuid/v1');
const TimeUnit = require('timeunit')
const triggers = {}
const intervals = {}

class Timer {
  doTimer({ intervalsValue = 1000 }) {
    if (typeof intervalsValue !== "number") {
      throw "intervalsValue mast be number type."
    }
    if (!intervals[intervalsValue]) {
      return
    }
    intervals[intervalsValue] = setInterval(() => {
      try {
        const intervalsTrigger = triggers[intervalsValue];
        for (const key in intervalsTrigger) {
          if (intervalsTrigger.hasOwnProperty(key)) {
            const element = intervalsTrigger[key];
            element.trigger()
          }
        }
      } catch (error) {

      }
    }, intervalsValue)
  }

  deleteTrigger({ id }) {
    delete triggers[id];
    if (Object.keys(triggers).length === 0) {
      clearInterval(this.interval)
      starter.isStarted = false;
    }
  }

  putTrigger({ trigger, id, timeUnit, interval }) {
    const uid = id || uuidv1()
    let millis = (timeUnit || TimeUnit.milliseconds).toMillis(interval || 1000);
    triggers[millis][uid] = {
      trigger, id
    }
    this.doTimer({ intervalsValue: millis });
    return uid;
  }
}

module.exports = new Timer()
