const uuidv1 = require('uuid/v1');
const triggers = {}
const starter = {
  isStarted: false
}

class Timer {
  doTimer() {
    if (starter.isStarted) {
      return;
    }
    starter.isStarted = true;
    this.interval = setInterval(() => {
      starter.isStarted = true;
      try {
        for (const key in triggers) {
          if (triggers.hasOwnProperty(key)) {
            const element = triggers[key];
            element.trigger()
          }
        }
      } catch (error) {

      }
    }, 1000)
  }

  deleteTrigger({ id }) {
    delete triggers[id];
    if (Object.keys(triggers).length === 0) {
      clearInterval(this.interval)
      starter.isStarted = false;
    }
  }

  putTrigger({ trigger, id }) {
    const uid = id || uuidv1()
    triggers[uid] = {
      trigger, id
    }
    this.doTimer();
    return uid;
  }
}

module.exports = new Timer()
