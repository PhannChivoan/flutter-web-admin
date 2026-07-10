const path = require("path");
const fs = require("fs");
const multer = require("multer");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
ensureDir(path.join(UPLOADS_ROOT, "posters"));
ensureDir(path.join(UPLOADS_ROOT, "trailers"));
ensureDir(path.join(UPLOADS_ROOT, "theaters"));
ensureDir(path.join(UPLOADS_ROOT, "actors"));

function makeStorage(subfolder) {
    return multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(UPLOADS_ROOT, subfolder)),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
        },
    });
}

const uploadPoster = multer({
    storage: makeStorage("posters"),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) return cb(new Error("Poster must be an image file"));
        cb(null, true);
    },
});

const uploadTrailer = multer({
    storage: makeStorage("trailers"),
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("video/")) return cb(new Error("Trailer must be a video file"));
        cb(null, true);
    },
});

const uploadTheaterImage = multer({
    storage: makeStorage("theaters"),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) return cb(new Error("Branch image must be an image file"));
        cb(null, true);
    },
});

const uploadActorPhoto = multer({
    storage: makeStorage("actors"),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) return cb(new Error("Actor photo must be an image file"));
        cb(null, true);
    },
});

function publicUrl(subfolder, filename) {
    return `/uploads/${subfolder}/${filename}`;
}

module.exports = { UPLOADS_ROOT, uploadPoster, uploadTrailer, uploadTheaterImage, uploadActorPhoto, publicUrl };
