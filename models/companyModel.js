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
    logo: {
      type: String,
    },
    companySize: {
      type: String,
      enum: ['less than 10', '10–50', '50–200', '200+'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // admins: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    deletedAt: String,
    deleteReason: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'deleted'],
      default: 'active',
    },
  },
  { timestamps: true },
);

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
