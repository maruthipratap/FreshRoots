const Harvest = require('../models/Harvest')

// @desc   Farmer creates a harvest listing
// @route  POST /api/harvest
const createHarvest = async (req, res) => {
  const {
    productName, category, description,
    estimatedQuantity, unit, pricePerUnit, expectedHarvestDate
  } = req.body

  if (!productName || !category || !estimatedQuantity || !unit || !pricePerUnit || !expectedHarvestDate) {
    return res.status(400).json({ message: 'Please fill all required fields' })
  }

  const harvest = await Harvest.create({
    farmerId: req.user._id,
    productName,
    category,
    description,
    estimatedQuantity,
    unit,
    pricePerUnit,
    expectedHarvestDate: new Date(expectedHarvestDate)
  })

  res.status(201).json(harvest)
}

// @desc   Get all upcoming harvests (buyers browse)
// @route  GET /api/harvest
const getHarvests = async (req, res) => {
  const { category } = req.query
  const query = { status: { $in: ['upcoming', 'ready'] } }
  if (category) query.category = category

  const harvests = await Harvest.find(query)
    .populate('farmerId', 'name location isVerified')
    .populate('prebookings.buyerId', 'name phoneNumber')
    .sort({ expectedHarvestDate: 1 })

  res.json(harvests)
}

// @desc   Get farmer's own harvests
// @route  GET /api/harvest/farmer/:farmerId
const getFarmerHarvests = async (req, res) => {
  const harvests = await Harvest.find({ farmerId: req.params.farmerId })
    .populate('prebookings.buyerId', 'name phoneNumber location')
    .sort({ expectedHarvestDate: 1 })

  res.json(harvests)
}

// @desc   Buyer pre-books a harvest
// @route  POST /api/harvest/:id/prebook
const prebookHarvest = async (req, res) => {
  const { quantity, notes } = req.body
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Enter a valid quantity' })
  }

  const harvest = await Harvest.findById(req.params.id)
  if (!harvest) return res.status(404).json({ message: 'Harvest not found' })
  if (harvest.status === 'cancelled') {
    return res.status(400).json({ message: 'This harvest has been cancelled' })
  }

  // Check if already pre-booked
  const alreadyBooked = harvest.prebookings.find(
    p => p.buyerId.toString() === req.user._id.toString()
  )
  if (alreadyBooked) {
    return res.status(400).json({ message: 'You have already pre-booked this harvest' })
  }

  // Check if enough quantity
  const totalBooked = harvest.prebookings.reduce((sum, p) => sum + p.quantity, 0)
  if (totalBooked + quantity > harvest.estimatedQuantity) {
    return res.status(400).json({
      message: `Only ${harvest.estimatedQuantity - totalBooked} ${harvest.unit} available for pre-booking`
    })
  }

  harvest.prebookings.push({
    buyerId: req.user._id,
    quantity,
    notes: notes || ''
  })

  await harvest.save()
  res.json({ message: 'Pre-booking confirmed! Farmer will contact you on harvest day. 🌱', harvest })
}

// @desc   Farmer updates harvest status
// @route  PATCH /api/harvest/:id/status
const updateHarvestStatus = async (req, res) => {
  const { status } = req.body
  const harvest = await Harvest.findById(req.params.id)
  if (!harvest) return res.status(404).json({ message: 'Harvest not found' })

  if (harvest.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  harvest.status = status
  await harvest.save()
  res.json({ message: `Harvest marked as ${status}`, harvest })
}

// @desc   Farmer deletes a harvest
// @route  DELETE /api/harvest/:id
const deleteHarvest = async (req, res) => {
  const harvest = await Harvest.findById(req.params.id)
  if (!harvest) return res.status(404).json({ message: 'Harvest not found' })

  if (harvest.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  await harvest.deleteOne()
  res.json({ message: 'Harvest deleted' })
}

module.exports = {
  createHarvest,
  getHarvests,
  getFarmerHarvests,
  prebookHarvest,
  updateHarvestStatus,
  deleteHarvest
}