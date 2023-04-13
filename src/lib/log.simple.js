const enumLog = require('../../cfg/constant.log');
class SimpleLogger {
  /**
   * @description Set the initial configuration for this lib
   * @param {Object} config [OPTIONAL]
   * @param {Object} config.cases
   * @param {String} config.env
   */
  constructor(config) {
    this.envs = {
      local: enumLog.level.debug,
      dev: enumLog.level.debug,
      pro: enumLog.level.error,
      ...config?.envs,
    };
    this.envs.test = this.envs.test || this.envs.dev;
    this.envs.preprod = this.envs.preprod || this.envs.dev;
    this.env = config?.env || process.env.NODE_ENV;
    this.level = 'info';
  }

  /**
   * @description Define if it is allowed to print data based on the log level in a specific environment
   * @param {String} level
   * @param {String} env
   * @returns
   */
  isAllow(level = enumLog.level.info, env = null) {
    return this.envs[env ?? this.env] >= level;
  }

  /**
   * @description Write data to standard I/O
   * @param {String} level
   * @param  {...any} args
   * @returns {Boolean}
   */
  print(level, ...args) {
    if (this.isAllow(level)) {
      if (process.env.NODE_ENV !== 'local') {
        // eslint-disable-next-line no-console
        console.log(...args.map((a) => JSON.stringify(a)));
      } else {
        // eslint-disable-next-line no-console
        console.log(...args);
      }

      return true;
    }
    return false;
  }

  /**
   * @description Alias for info function
   * @param  {...any} args
   * @returns {Boolean}
   */
  log() {
    return this.info(...arguments);
  }

  /**
   * @description Info level log
   * @param  {...any} args
   * @returns {Boolean}
   */
  info() {
    return this.print(enumLog.level.info, ...arguments);
  }

  /**
   * @description Debug level log
   * @param  {...any} args
   * @returns {Boolean}
   */
  debug() {
    return this.print(enumLog.level.debug, ...arguments);
  }

  /**
   * @description WARN level log
   * @param  {...any} args
   * @returns {Boolean}
   */
  warn() {
    return this.print(enumLog.level.warn, ...arguments);
  }

  /**
   * @description Error level log
   * @param  {...any} args
   * @returns {Boolean}
   */
  error() {
    return this.print(enumLog.level.error, ...arguments);
  }
}

module.exports = SimpleLogger;
