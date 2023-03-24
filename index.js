const app = require("./src/app");

const server = app.listen(4004, function () {
    console.log('SERVER UP! >> %d', server.address().port)
});