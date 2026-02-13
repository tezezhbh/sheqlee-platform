const cloudinary = require('../config/cloudinary');

exports.uploadFileToCloudinary = async ({ buffer, folder, publicId }) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: true,
          resource_type: 'raw',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      )
      .end(buffer);
  });
};
