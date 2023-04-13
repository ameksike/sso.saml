/**
 * @description Allow encode/decode/verify base on different format
 * @module utils/Cryp
 * @requires jsonwebtoken
 * @requires md5 
 */
class Cryp {

    constructor() {
        this.logger = require('../services/log.service');
    }

    /**
     * @description dynamic action execution
     * @param {String|Number|Object} data 
     * @param {String} algorithm String [json | base64 | sha1 | sha256 | md5 | totp | hash | hex | pkce | hash | basic | token | jwt | checksum]
     * @param {Object} options Object config options based on selected algorithm.
     * @param {Object} type Action to excecute [Encode | Decode | Verify]
     * @return {String|Object|Boolean} data
     */
    run(data, algorithm = "json", options = {}, type = "Encode") {
        try {
            options = options || {};
            const action = algorithm + type;
            return this[action] && this[action](data, options);
        }
        catch (error) {
            this.logger?.warn({
                src: "util:Cryp:run:" + algorithm + type,
                error: error?.message || error,
                data: { data, algorithm, options }
            });
            return null;
        }
    }

    /**
     * @description get a string as a result of a character substitution
     * @param {String} data 
     * @param {Array} character 
     * @returns {String} value
     */
    replace(data, character) {
        if (character) {
            for (const i in character) {
                data = data.replace(new RegExp(i, 'g'), character[i]);
            }
        }
        return data;
    }

    /**
     * @description Encoded data from an algorithm
     * @param {String|Number|Object} data 
     * @param {String} algorithm String [json | base64 | sha1 | sha256 | md5 | totp | hash | hex | pkce | hash | basic | token | jwt | checksum]
     * @param {Object} options Object config options based on selected algorithm.
     * @return {String} data
     */
    encode(data, algorithm, options) {
        return this.run(data, algorithm, options);
    }

    /**
     * @description Decoded data from an algorithm
     * @param {String|Number|Object} data String to decode
     * @param {String} algorithm String [json | base64 | hash | totp | checksum | hex | basic | token | jwt | signature ]
     * @param {Object} options Object config options based on selected algorithm
     * @return {String|Object} data
     */
    decode(data, algorithm, options) {
        return this.run(data, algorithm, options, "Decode");
    }

    /**
     * @description Verify data from an algorithm
     * @param {String|Number|Object} data String to decode
     * @param {String} algorithm String [json | base64 | hash | totp | checksum | hex | basic | token | jwt | signature ]
     * @param {Object} options Object config options based on selected algorithm
     * @return {Boolean} data
     */
    verify(data, algorithm, options) {
        return this.run(data, algorithm, options, "Verify");
    }

    /**
     * @description get string encode
     * @param {STRING} data
     * @param {OBJECT} options
     * @returns {STRING}
     */
    getEncoding(data, options) {
        return options && options.encoding
            ? options.encoding
            : /[À-ÿ\u00f1\u00d1]/gi.test(data)
                ? 'latin1'
                : 'ascii'
    }

    respond(value, error, options) {
        const { strict = false, defaultValue = "" } = options || {};
        if (!value || error) {
            return strict ? defaultValue : value;
        }
        function isValid(value, type) {
            const check = typeof (value) === type;
            return type === "string"
                ? (check && isNaN(value) && !value.trim().match(/^(true|false|null)$/ig))
                : check;
        }
        return isValid(value, options.validType) ? null : (strict ? defaultValue : value);
    }

    jsonEncode(value, options) {
        const avoidCCS = () => {
            const seen = new WeakSet()
            return (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return
                    }
                    seen.add(value)
                }
                return value
            }
        }
        try {
            options.validType = "object";
            return this.respond(value, null, options) ?? JSON.stringify(value, avoidCCS());
        }
        catch (error) {
            return this.respond(value, error, options);
        }
    }
    jsonDecode(value, options) {
        try {
            options.validType = "string";
            return this.respond(value, null, options) ?? JSON.parse(value);
        }
        catch (error) {
            return this.respond(value, error, options);
        }
    }

    hexEncode(data, options) {
        options.encoding = this.getEncoding(data, options);
        data = this.encode(data, 'json', { strict: false });
        return Buffer.from(String(data), options.encoding).toString('hex');
    }
    hexDecode(data, options) {
        options.encoding = this.getEncoding(data, options);
        const content = Buffer.from(data, 'hex').toString(options.encoding);
        return this.decode(content, 'json', { strict: false });
    }

    urlEncode(data, options) {
        options.character = options.character || { '/': '_', '\\+': '-', '=': '.' };
        return this.replace(data, options.character);
    }
    urlDecode(data, options) {
        options.character = options.character || { _: '/', '-': '+', '\\.': '=' };
        return this.replace(data, options.character);
    }

    base64Encode(data, options) {
        options.encoding = this.getEncoding(data, options)
        let content = Buffer.from(data, options.encoding).toString('base64');
        content = options.url ? this.urlEncode(content, options) : content;
        return content;
    }
    base64Decode(data, options) {
        data = options.url ? this.urlEncode(data, options) : data;
        options.encoding = this.getEncoding(data, options);
        return Buffer.from(data, 'base64').toString(options.encoding);
    }

    jwtEncode(data, options) {
        options = options || {};
        const jwt = require('jsonwebtoken');
        const AUTH_PRIVATE_KEY = options.privateKey || process.env.AUTH_PRIVATE_KEY;
        const AUTH_PRIVATE_KEY_EXP_TIME = options.privateKeyExpTime || process.env.AUTH_PRIVATE_KEY_EXP_TIME;
        return jwt.sign(data, AUTH_PRIVATE_KEY, {
            expiresIn: AUTH_PRIVATE_KEY_EXP_TIME
        });
    }
    jwtDecode(data, options) {
        const jwt = require('jsonwebtoken');
        const AUTH_PRIVATE_KEY = options.privateKey || process.env.AUTH_PRIVATE_KEY;
        return jwt.verify(data, AUTH_PRIVATE_KEY, options.callback);
    }

    basicEncode(data, options) {
        options.encode = options.encode || 'base64';
        const key = data.key || data.id;
        const code = data.code || data.token;
        const meta = data.data ? ':' + this.encode(data.data, 'hex') : '';
        return this.encode(
            `${key}:${code}${meta}`,
            options.encode,
            options
        );
    }
    basicDecode(data, options) {
        options.encode = options.encode || 'base64';
        const bearer = data.split(' ');
        const code = bearer.length > 1 ? bearer[1] : data;
        const token = this.decode(code, options.encode).split(':');
        const content = {
            key: token[0],
            code: token[1]
        };
        if (token[2]) {
            content.data = this.decode(token[2], 'hex');
        }
        return content;
    }

    md5Encode(data) {
        const md5 = require('md5');
        return md5(data);
    }
    md5Verify(data, options) {
        const md5 = require('md5');
        return data === md5(options?.key);
    }

    pkceEncode(data, options) {
        const method = options.method || 'plain'; // plain / sha256
        if (method !== 'plain') {
            const enco = this.encode(data, method);
            const buff = Buffer.from(enco, 'hex');
            const content = this.encode(buff, 'base64', { url: true });
            return content.replace(/\./g, '');
        } else {
            return data;
        }
    }
    pkceVerify(data, options) {
        const inData = this.encode(data, options);
        return inData === options.secret;
    }
}

const obj = new Cryp();
obj.Cls = Cryp;
module.exports = obj;