const express = require('express')
const router = express.Router()
const { upload } = require('../config/cloudinary')
const { protect } = require('../middleware/authMiddleware')

// @desc   Upload product image
// @route  POST /api/upload
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' })
  }
  res.json({
    url: req.file.path,
    public_id: req.file.filename
  })
})

module.exports = router