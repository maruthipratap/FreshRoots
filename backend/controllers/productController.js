const Product = require('../models/Product')
const { sendRestockNotifications } = require('./notificationController')
const { asyncHandler } = require('../middleware/errorMiddleware')

// Helper function to escape RegExp special characters to prevent ReDoS
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// @desc   Add a new product
// @route  POST /api/products
const addProduct = asyncHandler(async (req, res) => {
  const { category, name, description, quantityAvailable, unit, pricePerUnit, images } = req.body

  if (!category || !name || !quantityAvailable || !unit || !pricePerUnit) {
    return res.status(400).json({ message: 'Please fill all required fields' })
  }

  const product = await Product.create({
    farmerId: req.user._id,
    category,
    name,
    description: description || '',
    quantityAvailable,
    unit,
    pricePerUnit,
    images: images || []
  })

  res.status(201).json(product)
})

// @desc   Get all products
// @route  GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query

  const query = { isActive: true }

  if (category) query.category = category
  if (search) {
    const escapedSearch = escapeRegExp(search)
    query.name = { $regex: escapedSearch, $options: 'i' }
  }

  const products = await Product.find(query)
    .populate('farmerId', 'name location phoneNumber isVerified coordinates')
    .sort({ createdAt: -1 })

  res.json(products)
})

// @desc   Get single product
// @route  GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('farmerId', 'name location phoneNumber isVerified coordinates')

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  res.json(product)
})

// @desc   Get all products by a farmer
// @route  GET /api/products/farmer/:farmerId
const getProductsByFarmer = asyncHandler(async (req, res) => {
  const products = await Product.find({ farmerId: req.params.farmerId })
    .sort({ createdAt: -1 })

  res.json(products)
})

// @desc   Update a product
// @route  PATCH /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  if (product.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this product' })
  }

  const wasOutOfStock = product.quantityAvailable === 0

  // Whitelist request fields to prevent NoSQL injection via req.body
  const whitelist = ['category', 'name', 'description', 'images', 'quantityAvailable', 'unit', 'pricePerUnit', 'isActive']
  const updates = {}
  Object.keys(req.body).forEach((key) => {
    if (whitelist.includes(key)) {
      updates[key] = req.body[key]
    }
  })

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  )

  // Send restock notifications if product was out of stock and now has stock
  if (wasOutOfStock && updated.quantityAvailable > 0) {
    await sendRestockNotifications(updated)
  }

  res.json(updated)
})

// @desc   Delete a product
// @route  DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  if (product.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this product' })
  }

  await product.deleteOne()

  res.json({ message: 'Product deleted successfully' })
})

// @desc   Set or remove seasonal deal on a product
// @route  PATCH /api/products/:id/seasonal
const setSeasonalDeal = asyncHandler(async (req, res) => {
  const { isSeasonal, seasonalPrice, seasonEnd } = req.body

  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  if (product.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  product.isSeasonal = isSeasonal
  product.seasonalPrice = isSeasonal ? seasonalPrice : null
  product.seasonEnd = isSeasonal ? new Date(seasonEnd) : null
  await product.save()

  res.json({ message: isSeasonal ? 'Seasonal deal set!' : 'Seasonal deal removed', product })
})

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  getProductsByFarmer,
  updateProduct,
  deleteProduct,
  setSeasonalDeal
}