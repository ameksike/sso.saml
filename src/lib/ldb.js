/**
 * @description Light Database
 * @module db/LDB
 * @requires fs 
 * @requires path 
 * @requires cryp 
 */

class LDB {

    #path = "";
    #schema = "db";
    #name = "data";
    #key = "id";
    #ext = "json";
    #format = "json";
    #encoding = "utf8";
    #db = null;
    #mode = "cache";
    #logger = console;
    #busy = null;
    #link = {};

    get name() {
        return this.#name;
    }

    get key() {
        return this.#key;
    }

    get src() {
        return this.path.join(this.#path, this.#schema + "." + this.#name + "." + this.#ext);
    }

    constructor(options) {
        this.configure(options);
        this.cryp = require("./cryp");
        this.fs = require("fs").promises;
        this.path = require("path");
    }

    configure(options) {
        // model config
        this.#path = options.path || this.#path;
        this.#schema = options.schema || this.#schema;
        this.#name = options.name || this.#name;
        this.#key = options.key || this.#key;
        // system config
        this.#ext = options.ext || this.#ext;
        this.#format = options.encoder || this.#format;
        this.#encoding = options.encoding || this.#encoding;
        this.#db = options.db || this.#db;
        this.#mode = options.mode || this.#mode;
        this.#logger = options.logger || this.#logger;
        this.#busy = options.busy || this.#busy;
        // links
        this.#link = options.link || this.#link;
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
        const rel = this.#link[name];
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
                : (!row[dep.foreignKey] ? null : { [dep.model.key] : row[dep.foreignKey] });
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
            this.#logger?.log({
                src: "LDB:delete",
                data: {
                    row,
                    path: this.#path,
                    name: this.#name,
                    key: this.#key,
                },
                error
            });
            this.#busy = false;
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
            row[this.#key] = this.#uid(row);
            db[row[this.#key]] = row;
            await this.#write(db);
            return row;
        }
        catch (error) {
            this.#logger?.log({
                src: "LDB:write",
                data: {
                    row,
                    path: this.#path,
                    name: this.#name,
                    key: this.#key,
                },
                error
            });
            this.#busy = false;
            return null;
        }
    }

    async #read() {
        if (this.isBusy()) {
            return null;
        }
        try {
            if (!this.#db || (this.#db && this.#mode !== "cache")) {
                const file = this.src;
                this.#busy = true;
                const tmp = await this.fs.readFile(file, this.#encoding);
                const db = this.cryp.decode(tmp, this.#format);
                this.#busy = false;
                this.#logger?.log({ src: "LDB:read", file, mode: this.#mode });
                if (this.#mode === "cache") {
                    this.#db = db;
                }
            }
            return this.#db;
        }
        catch (error) {
            this.#logger?.log({
                src: "LDB:read",
                data: {
                    path: this.#path,
                    name: this.#name,
                    key: this.#key,
                },
                error
            });
            this.#busy = false;
            return {};
        }
    }

    async #write(db) {
        if (this.isBusy()) {
            return null;
        }
        try {
            const content = this.cryp.encode(db, this.#format);
            const file = this.src;
            this.#busy = true;
            await this.fs.writeFile(file, content);
            this.#busy = false;
            this.#logger?.log({ src: "LDB:write", file, mode: this.#mode });
            if (this.#mode === "cache") {
                this.#db = db;
            }
            return this.#db;
        }
        catch (error) {
            this.#logger?.log({
                src: "LDB:write",
                data: {
                    path: this.#path,
                    name: this.#name,
                    key: this.#key,
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
        return (row && row[this.#key]) || (auto && this.#gen());
    }

    #isUid(row) {
        return typeof (row) === "number" || typeof (row) === "string";
    }

    #gen() {
        return String(Date.now()) + String(Math.floor(Math.random() * 100) + 11).slice(-2);
    }

    isBusy() {
        if (this.#busy) {
            this.#logger.log({
                src: "LDB:isBusy",
                data: {
                    path: this.#path,
                    name: this.#name,
                    key: this.#key,
                },
                error: "busy resource"
            });
        }
        return this.#busy;
    }

    has(option) {
        this.#link[option?.model?.name || "default"] = {
            model: option?.model,
            foreignKey: option.foreignKey,
            type: option.type || "OneToOne",
            required: option.required || false
        };
    }
}

module.exports = LDB;