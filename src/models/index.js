const LDB = require('../lib/ldb');

const credentialModel = new LDB({
    path: __dirname + "/../../db",
    name: "credential"
});

const domainModel = new LDB({
    path: __dirname + "/../../db",
    name: "domain",
    key: "idp_issuer"
});

credentialModel.has({ model: domainModel, foreignKey: "domainId", type: "OneToOne" });
domainModel.has({ model: credentialModel, foreignKey: "domainId", type: "OneToMany" });

module.exports = {
    credentialModel,
    domainModel
};