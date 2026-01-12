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
      // match: [/^https?:\/\/.+/i, 'Please provide a valid URL starting with http:// or https://'],
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
    companySize: {
      type: Number,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
