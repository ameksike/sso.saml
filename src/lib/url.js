/**
 * @description Utility for url manipulation 
 * @module utils/Url 
 */
const _url = require("url");
class UrlUtil {

    /**
     * @description Convert an url string to an object 
     * @param {String} url 
     * @returns {Object}
     */
    parse(url) {
        return url && new _url.URL(url);
    }

    /**
     * @description Get a formatted URL string derived fromurlObject
     * @param {Object} req 
     * @returns {String}
     */
    format(req) {
        const host = ((req.get && req.get('host')) || "").split(":");
        return _url.format({
            ...req,
            host: req.host || host[0],
            port: req.port || host[1],
            pathname: req.pathname,
            protocol: req.protocol || "http",
        });
    }

    /**
     * @description Get a formatted URL string derived req
     * @param {Object} req 
     * @returns {String}
     */
    str(req) {
        return `${req.protocol}://${(req.get && req.get('host') || req.host)}`;
    }
    /**
     * @description Add parameters to an url
     * @param {String} url 
     * @param {Object} params 
     * @returns {String}
     */
    add(url, params) {
        const tmp = this.parse(url);
        if (!tmp || !params) {
            return "";
        }
        for (let i in params) {
            tmp.searchParams.append(i, params[i]);
        }
        return tmp.href;
    }
}

const obj = new UrlUtil();
obj.Cls = UrlUtil;
module.exports = obj;