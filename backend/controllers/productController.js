const Product = require('../models/Product')

// @desc   Add a new product
// @route  POST /api/products
const addProduct = async (req, res) => {
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
}

// @desc   Get all products
// @route  GET /api/products
const getProducts = async (req, res) => {
  const { category, search } = req.query

  const query = { isActive: true }

  if (category) query.category = category
  if (search) query.name = { $regex: search, $options: 'i' }

  const products = await Product.find(query)
    .populate('farmerId', 'name location phoneNumber')
    .sort({ createdAt: -1 })

  res.json(products)
}

// @desc   Get single product
// @route  GET /api/products/:id
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('farmerId', 'name location phoneNumber')

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  res.json(product)
}

// @desc   Get all products by a farmer
// @route  GET /api/products/farmer/:farmerId
const getProductsByFarmer = async (req, res) => {
  const products = await Product.find({ farmerId: req.params.farmerId })
    .sort({ createdAt: -1 })

  res.json(products)
}

// @desc   Update a product
// @route  PATCH /api/products/:id
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  if (product.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this product' })
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  res.json(updated)
}

// @desc   Delete a product
// @route  DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  if (product.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this product' })
  }

  await product.deleteOne()

  res.json({ message: 'Product deleted successfully' })
}

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  getProductsByFarmer,
  updateProduct,
  deleteProduct
}