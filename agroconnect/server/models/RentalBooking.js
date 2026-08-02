const mongoose = require('mongoose');

const rentalBookingSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  rentalType: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  days: {
    type: Number,
    default: 1
  },
  hours: {
    type: Number,
    default: 0
  },
  baseRental: {
    type: Number,
    required: true
  },
  distanceCharge: {
    type: Number,
    default: 0
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  operatorCharge: {
    type: Number,
    default: 0
  },
  fuelCharge: {
    type: Number,
    default: 0
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'In Transit', 'Active', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  renterVillage: {
    type: String,
    default: ''
  },
  renterDistrict: {
    type: String,
    default: ''
  },
  farmSize: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RentalBooking', rentalBookingSchema);
