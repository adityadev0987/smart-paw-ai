import multer from "multer";
import path from "path";
import fs from "fs";

// ==========================================
// COMMUNITY UPLOAD DIRECTORY
// ==========================================

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "community",
);

// Create directory if it does not exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// ==========================================
// STORAGE
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const uniqueName =
      `community-${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extension}`;

    cb(null, uniqueName);
  },
});

// ==========================================
// FILE FILTER
// ==========================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only JPG, JPEG, PNG and WebP images are allowed.",
    ),
    false,
  );
};

// ==========================================
// MULTER
// ==========================================

const uploadCommunityImage = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadCommunityImage;