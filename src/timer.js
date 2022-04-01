const uuidv1 = require('uuid/v1');
const TimeUnit = require('timeunit')
const triggers = {}
const intervals = {}
class Timer {
  doTimer({ intervalsValue = 1000 }) {
    if (typeof intervalsValue !== "number") {
      throw "intervalsValue mast be number type."
    }
    if (intervals[intervalsValue]) {
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
    for (const intervalsValue in triggers) {
      if (triggers[intervalsValue][id]) {
        delete triggers[intervalsValue][id]
      }
      if (Object.keys(triggers[intervalsValue]).length === 0) {
        let interval = intervals[intervalsValue]
        clearInterval(interval)
        delete intervals[intervalsValue]
      }
    }
  }

  putTrigger({ trigger, id, timeUnit, interval, priorityExecution }) {
    const uid = id || uuidv1()
    let millis = (timeUnit || TimeUnit.milliseconds).toMillis(interval || 1000);
    if (!triggers[millis]) {
      triggers[millis] = {}
    }
    triggers[millis][uid] = { trigger, id }
    if (trigger && priorityExecution) {
      trigger();
    }
    this.doTimer({ intervalsValue: millis });
    return uid;
  }
}

module.exports = new Timer()
