const config = {};
const enumLog = require('../../cfg/constant.log');
const LoggerSimple = require('../lib/log.simple');

/**
 * @description Create a simple logger instance
 * @returns {Object} Winston Logger
 */
function createLoggerSimple(cfg) {
  return new LoggerSimple(cfg?.logs);
}

/**
 * @description Intercept logger functions calls and format the parameters
 * @param {Object} obj
 * @returns {Object}
 */
function createLogger(obj, skip = ["track"]) {
  // define logs format
  function format(logItem, prop) {
    if (typeof logItem === 'object') {
      const time = Date.now();
      return {
        flow: String(time) + "00",
        level: enumLog.level[prop] ?? enumLog.level.info,
        ...logItem,
        date: logItem.date || time,
      }
    }
    return logItem;
  }
  // add extra actions
  Reflect.set(obj, "track", () => {
    return (req, res, next) => {
      req.flow = String(Date.now()) + String(Math.floor(Math.random() * 100) + 11).slice(-2);
      obj.info({
        flow: req.flow,
        level: enumLog.level.info,
        src: "Logger:Track:Request",
        data: {
          method: req.method,
          path: req.path,
          query: req.query,
          headers: req.headers,
          body: req.body && Object.keys(req.body)
        }
      });
      next();
    }
  });
  // create target
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const method = Reflect.get(target, prop, receiver);
      if (skip.includes(prop)) {
        return typeof method === 'function' ? method.bind(target) : method;
      }
      return method instanceof Function
        ? (...args) =>
          method.apply(
            target,
            args.map((item) => format(typeof item === 'object' && !Array.isArray(item) ? item : { message: item }, prop)),
          )
        : method;
    }
  });
}

module.exports = createLogger(createLoggerSimple(config));
