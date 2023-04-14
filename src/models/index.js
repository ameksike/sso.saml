const LDB = require('../lib/ldb');

const driver = {
    path: __dirname + "/../../db",
    logger: console
};

//.....................................................
class CredentialModel extends LDB {
    constructor(opt) {
        opt = opt || {};
        opt.model = opt.model || {};
        opt.model.name = "credential";
        super(opt);
    }
}
const credentialModel = new CredentialModel({ driver });
//.....................................................

const domainModel = new LDB({
    model: {
        name: "domain",
        key: "idp_issuer"
    },
    driver
});
//.....................................................

credentialModel.has({ model: domainModel, foreignKey: "domainId", type: "OneToOne" });
domainModel.has({ model: credentialModel, foreignKey: "domainId", type: "OneToMany" });
//.....................................................

module.exports = {
    credentialModel,
    domainModel
};