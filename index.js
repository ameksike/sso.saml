const app = require("./src/app");

const server = app.listen(process?.env?.PORT || 4004, function () {
    const inf = server.address();
    console.log(
        'SERVER UP! >> %s:%d',
        inf.address === "::" ? "localhost" : inf.address,
        inf.port
    );
});