const User = require('./../models/userModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/globalAppError');
const sendEmail = require('./../utilities/emails/sendEmail');

exports.inviteUser = catchAsync(async (req, res, next) => {
  const { email, role } = req.body;

  // 1) Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists', 400));
  }

  // 2) Create invited user
  let user;
  try {
    user = await User({
      email,
      role,
      isInvited: true,
      active: false,
    });

    // 3) Generate invite token
    const inviteToken = user.createInviteToken();
    await user.save({ validateBeforeSave: false });

    // 4) Send email
    const inviteURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/accept-invite/${inviteToken}`;

    console.log('INVITE LINK:', inviteURL);

    await sendEmail({
      to: email,
      subject: 'You are invited to Sheqlee',
      html: `
             <p>You have been invited to Sheqlee.</p>
             <p>Click below to activate your account:</p>
             <a href="${inviteURL}">${inviteURL}</a>
           `,
    });

    res.status(201).json({
      status: 'success',
      message: 'Invite sent successfully',
    });
  } catch (err) {
    // return next(
    //   new AppError('There was an error sending the email. Try again later!'),
    //   500
    // );
    // console.error('EMAIL ERROR 💥', err);

    // throw new AppError(err.message || 'Email service failed', 500);
    // if (user) {
    //   await User.findByIdAndDelete(user._id);
    // }
    return next(new AppError('Invite failed. User was not created.', 500));
  }
});
