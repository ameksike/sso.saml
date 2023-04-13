
const multer = require('multer');
const upload = multer();

function format(req) {
    if (req.files) {
        for (let i in req.files) {
            const file = req.files[i];
            if (file && req.body) {
                req.body[file.fieldname] = file.buffer?.toString ? file.buffer.toString("utf8") : file.buffer;
            }
        }
    }
    return req;
}

module.exports = { format, upload };