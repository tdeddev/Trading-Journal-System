const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for memory storage (we'll process and save manually)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Please upload JPEG, PNG, GIF, or WebP files.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Image processing middleware
const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'trades');
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Process each uploaded file
    const processedFiles = await Promise.all(req.files.map(async (file, index) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const filename = `trade_${timestamp}_${randomString}.webp`;
      const filepath = path.join(uploadDir, filename);

      // Process image with Sharp
      await sharp(file.buffer)
        .resize(1200, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 85 })
        .toFile(filepath);

      // Create thumbnail
      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join(uploadDir, thumbnailFilename);
      
      await sharp(file.buffer)
        .resize(300, 200, { 
          fit: 'cover',
          position: 'center' 
        })
        .webp({ quality: 75 })
        .toFile(thumbnailPath);

      return {
        originalName: file.originalname,
        filename: filename,
        thumbnailFilename: thumbnailFilename,
        filepath: `/uploads/trades/${filename}`,
        thumbnailPath: `/uploads/trades/${thumbnailFilename}`,
        size: file.size,
        mimetype: 'image/webp'
      };
    }));

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process uploaded images'
    });
  }
};

// Delete image file
const deleteImage = async (filename) => {
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'trades');
    const imagePath = path.join(uploadDir, filename);
    const thumbnailPath = path.join(uploadDir, `thumb_${filename}`);
    
    // Delete main image
    try {
      await fs.unlink(imagePath);
    } catch (err) {
      console.warn(`Could not delete image: ${imagePath}`);
    }
    
    // Delete thumbnail
    try {
      await fs.unlink(thumbnailPath);
    } catch (err) {
      console.warn(`Could not delete thumbnail: ${thumbnailPath}`);
    }
  } catch (error) {
    console.error('Delete image error:', error);
  }
};

module.exports = {
  upload: upload.array('images', 5), // Allow up to 5 images
  processImages,
  deleteImage
};