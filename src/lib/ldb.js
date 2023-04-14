/**
 * @description Light Database
 * @module db/LDB
 * @requires fs 
 * @requires path 
 * @requires cryp 
 */

class LDB {

    #model = {}
    #driver = {} 

    get name() {
        return this.#model.name;
    }

    get key() {
        return this.#model.key;
    }

    get src() {
        return this.path.join(this.#driver.path, this.#model.schema + "." + this.#model.name + "." + this.#driver.ext);
    }

    constructor(options) {

        this.#model.schema = "db";
        this.#model.name = "data";
        this.#model.key = "id";
        this.#model.link = {};
        
        this.#driver.path = "";
        this.#driver.ext = "json";
        this.#driver.format = "json";
        this.#driver.encoding = "utf8";
        this.#driver.db = null;
        this.#driver.mode = "cache";
        this.#driver.busy = null;

        this.configure(options);
        this.cryp = require("./cryp");
        this.fs = require("fs").promises;
        this.path = require("path");
    }

    configure(options) {
        if (!options) {
            return this;
        }
        // model config
        this.#model.schema = options.model?.schema || this.#model.schema;
        this.#model.name = options.model?.name || this.#model.name;
        this.#model.key = options.model?.key || this.#model.key;
        this.#model.link = options.model?.link || this.#model.link;
        // driver config
        this.#driver.path = options.driver?.path || this.#driver.path;
        this.#driver.ext = options.driver?.ext || this.#driver.ext;
        this.#driver.format = options.driver?.encoder || this.#driver.format;
        this.#driver.encoding = options.driver?.encoding || this.#driver.encoding;
        this.#driver.db = options.driver?.db || this.#driver.db;
        this.#driver.mode = options.driver?.mode || this.#driver.mode;
        this.#driver.busy = options.driver?.busy || this.#driver.busy;
        this.#driver.logger = options.driver?.logger || this.#driver.logger;
        return this;
    }

    async select(query) {
        const { where } = query || {};
        const db = await this.#read();
        if (!where) {
            return this.#getList(db, query);
        }
        if (typeof (where) === "function") {
            return this.#getList(Object.values(db).filter(where), query);
        }
        const id = this.#uid(where, false);
        if (id) {
            return this.#getRow(db[id], query);
        }
        return null;
    }

    async #getList(db, query) {
        if (!db) {
            return db;
        }
        db = Array.isArray(db) ? db : Object.values(db);
        return query?.attributes?.length || query?.include?.length ? await Promise.all(db.map(item => this.#getRow(item, query))) : db;
    }

    async #getRow(row, query) {
        const { attributes: attrs } = query || {};
        if (!row) {
            return row;
        }
        let res = {};

        // filter attributes
        if (!attrs) {
            res = row;
        } else {
            for (let attr of attrs) {
                if (row[attr]) {
                    res[attr] = row[attr];
                }
            }
        }

        // get related models
        return await this.include(res, row, query);
    }

    #getDep(item) {
        const name = typeof (item.model) === "string" ? item.model : item.model.name;
        const rel = this.#model.link[name];
        const model = (typeof (item.model) === "string" && rel?.model) || item.model;
        const foreignKey = item.foreignKey || rel?.foreignKey;
        const type = item.type || rel?.type;
        const required = item.required || rel?.required;
        return { name, model, foreignKey, type, required };
    }

    async include(res, row, query) {
        if (!query?.include) {
            return res;
        }
        const depns = Array.isArray(query.include) ? query.include : [query.include];
        const found = await Promise.all(depns.map(item => {
            const dep = this.#getDep(item);
            item.where = dep.type === "OneToMany"
                ? (item) => item[dep.foreignKey] === row[this.key]
                : (!row[dep.foreignKey] ? null : { [dep.model.key]: row[dep.foreignKey] });
            return item.where && dep.model.select && dep.model.select(item);
        }));

        if (found) {
            const linked = found.reduce((map, item, index) => {
                const dep = this.#getDep(depns[index]);
                map[dep.name] = item;
                return map;
            }, res);
            return linked;
        }
        return res;
    }

    async delete(query) {
        try {
            const tmp = this.select(query);
            if (tmp) {
                const db = await this.#read();
                const id = this.#uid(tmp);
                delete db[id];
                await this.#write(db);
                return tmp;
            }
            return null;
        }
        catch (error) {
            this.#log({
                src: "LDB:delete",
                data: {
                    row,
                    path: this.#driver.path,
                    name: this.#model.name,
                    key: this.#model.key,
                },
                error
            });
            this.#driver.busy = false;
            return null;
        }
    }

    async update(query, data) {
        if (!data) {
            return null;
        }
        const tmp = await this.select(query);
        if (!tmp) {
            return null;
        }
        const news = Object.assign(tmp, data);
        return await this.save(news);
    }

    create(data) {
        return this.save(data);
    }

    async save(row) {
        try {
            const db = await this.#read();
            row[this.#model.key] = this.#uid(row);
            db[row[this.#model.key]] = row;
            await this.#write(db);
            return row;
        }
        catch (error) {
            this.#log({
                src: "LDB:write",
                data: {
                    row,
                    path: this.#driver.path,
                    name: this.#model.name,
                    key: this.#model.key,
                },
                error
            });
            this.#driver.busy = false;
            return null;
        }
    }

    async #read() {
        if (this.isBusy()) {
            return null;
        }
        try {
            if (!this.#driver.db || (this.#driver.db && this.#driver.mode !== "cache")) {
                const file = this.src;
                this.#driver.busy = true;
                const tmp = await this.fs.readFile(file, this.#driver.encoding);
                const db = this.cryp.decode(tmp, this.#driver.format);
                this.#driver.busy = false;
                this.#log({ src: "LDB:read", file, mode: this.#driver.mode });
                if (this.#driver.mode === "cache") {
                    this.#driver.db = db;
                }
            }
            return this.#driver.db;
        }
        catch (error) {
            this.#log({
                src: "LDB:read",
                data: {
                    path: this.#driver.path,
                    name: this.#model.name,
                    key: this.#model.key,
                },
                error
            });
            this.#driver.busy = false;
            return {};
        }
    }

    async #write(db) {
        if (this.isBusy()) {
            return null;
        }
        try {
            const content = this.cryp.encode(db, this.#driver.format);
            const file = this.src;
            this.#driver.busy = true;
            await this.fs.writeFile(file, content);
            this.#driver.busy = false;
            this.#log({ src: "LDB:write", file, mode: this.#driver.mode });
            if (this.#driver.mode === "cache") {
                this.#driver.db = db;
            }
            return this.#driver.db;
        }
        catch (error) {
            this.#log({
                src: "LDB:write",
                data: {
                    path: this.#driver.path,
                    name: this.#model.name,
                    key: this.#model.key,
                },
                error
            });
            return null;
        }
    }

    #uid(row, auto = true) {
        if (this.#isUid(row)) {
            return row;
        }
        if (typeof (row) !== "object") {
            return auto && this.#gen();
        }
        return (row && row[this.#model.key]) || (auto && this.#gen());
    }

    #isUid(row) {
        return typeof (row) === "number" || typeof (row) === "string";
    }

    #gen() {
        return String(Date.now()) + String(Math.floor(Math.random() * 100) + 11).slice(-2);
    }

    #log(info) {
        if (!this.#driver.logger) {
            return;
        }
        if (this.#driver.logger?.log) {
            return this.#driver.logger.log(info);
        }
        if (typeof this.#driver.logger === "function") {
            return this.#driver.logger(info);
        }
    }

    isBusy() {
        if (this.#driver.busy) {
            this.#log({
                src: "LDB:isBusy",
                data: {
                    path: this.#driver.path,
                    name: this.#model.name,
                    key: this.#model.key,
                },
                error: "busy resource"
            });
        }
        return this.#driver.busy;
    }

    has(option) {
        this.#model.link[option?.model?.name || "default"] = {
            model: option?.model,
            foreignKey: option.foreignKey,
            type: option.type || "OneToOne",
            required: option.required || false
        };
    }
}

module.exports = LDB;