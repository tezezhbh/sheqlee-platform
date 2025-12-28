const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A company must have a name!'],
      trim: true,
    },

    domain: {
      type: String,
      required: [true, 'A company must have a Domain.'],
      unique: [true, 'A company Domain must have to be unique'],
    },

    description: {
      type: String,
    },

    website: {
      type: String,
    },

    location: {
      type: String,
    },

    logo_url: {
      type: String,
    },

    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
