const express = require('express')
const router = express.Router()
const {
  addProduct,
  getProducts,
  getProductById,
  getProductsByFarmer,
  updateProduct,
  deleteProduct
} = require('../controllers/productController')
const { protect, farmerOnly } = require('../middleware/authMiddleware')

router.get('/', getProducts)
router.get('/farmer/:farmerId', getProductsByFarmer)
router.get('/:id', getProductById)
router.post('/', protect, farmerOnly, addProduct)
router.patch('/:id', protect, farmerOnly, updateProduct)
router.delete('/:id', protect, farmerOnly, deleteProduct)

module.exports = router