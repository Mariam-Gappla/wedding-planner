const multer = require('multer');
const path = require('path');
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/');
        },
        filename: function (req, file, cb) {
            let originalName = path.basename(file.originalname, path.extname(file.originalname));
            originalName = originalName.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
            const finalName = Date.now() + '_' + originalName + path.extname(file.originalname);
    
            cb(null, finalName);
        }
    });

const upload = multer({ storage: storage });
module.exports=upload;