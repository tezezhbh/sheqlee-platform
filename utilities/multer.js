const multer = require('multer');
const AppError = require('./globalAppError');

const storage = multer.memoryStorage();

// IMAGE FILTER
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

// CV FILTER
const cvFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF or Word files are allowed', 400), false);
  }
};

exports.uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

exports.uploadCV = multer({
  storage,
  fileFilter: cvFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for CV
});
