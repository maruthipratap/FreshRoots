const express = require('express')
const router = express.Router()
const { protect, farmerOnly, buyerOnly } = require('../middleware/authMiddleware')
const {
  createHarvest,
  getHarvests,
  getFarmerHarvests,
  prebookHarvest,
  updateHarvestStatus,
  deleteHarvest
} = require('../controllers/harvestController')

router.post('/', protect, farmerOnly, createHarvest)
router.get('/', protect, getHarvests)
router.get('/farmer/:farmerId', protect, getFarmerHarvests)
router.post('/:id/prebook', protect, buyerOnly, prebookHarvest)
router.patch('/:id/status', protect, farmerOnly, updateHarvestStatus)
router.delete('/:id', protect, farmerOnly, deleteHarvest)

module.exports = router