const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { createToken, hashToken } = require('../utilities/token');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: String,
    photo: {
      url: String,
      publicId: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super-admin'],
      default: 'user',
    },
    accountType: {
      type: String,
      enum: ['professional', 'employer'],
      default: 'professional',
      required: function () {
        return this.role === 'user';
      },
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    // passwordConfirm: {
    //   type: String,
    //   required: [true, 'Please confirm your password'],
    //   validate: {
    //     // This only works on CREATE and SAVE!!!
    //     validator: function (el) {
    //       return el === this.password;
    //     },
    //     message: 'Passwords are not the same!',
    //   },
    // },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    inviteToken: String,
    inviteExpires: Date,
    isInvited: {
      type: Boolean,
      default: false,
      select: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'deleted'],
      default: 'active',
    },
    deletedAt: {
      type: Date,
    },
    deleteReason: {
      type: String,
      trim: true,
    },
    // isActive: {
    //   type: Boolean,
    //   default: true,
    //   select: false,
    // },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

userSchema.virtual('profile', {
  ref: 'FreelancerProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

userSchema.pre('save', async function () {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return;

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field from the DB
  this.passwordConfirm = undefined;
  // next();
});

//some methods
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means password is NOT changed
  return false;
};

userSchema.methods.comparePasswordForLogin = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = createToken();

  this.passwordResetToken = hashToken(resetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

userSchema.methods.createInviteToken = function () {
  const inviteToken = createToken();

  this.inviteToken = hashToken(inviteToken);
  this.inviteExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  this.isInvited = true;
  this.isActive = false;

  return inviteToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
