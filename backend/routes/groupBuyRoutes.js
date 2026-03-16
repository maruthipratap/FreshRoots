const express = require('express')
const router = express.Router()
const { protect, farmerOnly, buyerOnly } = require('../middleware/authMiddleware')
const {
  createGroupBuy,
  getGroupBuys,
  joinGroupBuy,
  getMyGroupBuys,
  cancelGroupBuy,
  getFarmerGroupBuys,
  counterGroupBuy
} = require('../controllers/groupBuyController')

router.post('/', protect, buyerOnly, createGroupBuy)
router.get('/', protect, getGroupBuys)
router.get('/my', protect, buyerOnly, getMyGroupBuys)
router.get('/farmer', protect, farmerOnly, getFarmerGroupBuys)
router.post('/:id/join', protect, buyerOnly, joinGroupBuy)
router.patch('/:id/cancel', protect, buyerOnly, cancelGroupBuy)
router.patch('/:id/counter', protect, farmerOnly, counterGroupBuy)

module.exports = router