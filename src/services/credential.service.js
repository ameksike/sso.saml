const LDB = require('../lib/ldb');
const { credentialModel } = require("../models");

class CredentialService {
    constructor() {
        this.dao = credentialModel;
    }

    select(query) {
        return this.dao.select(query);
    }

    create(option) {
        return this.dao.save(option);
    }
}

const obj = new CredentialService();
obj.Cls = CredentialService;
module.exports = obj;