const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();
    const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // حد أقصى 50MB لكل ملف
    },
    fileFilter: function (req, file, cb) {
        // ✅ فلترة أنواع الملفات (صور فقط)
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('فقط الملفات من نوع jpeg، jpg، png، webp مسموح بها'));
    }
});


module.exports=upload;