const sendEmail = require('./../utilities/emails/sendEmail');
const { createToken, hashToken, verifyToken } = require('./../utilities/token'); // token utilities

exports.sendTestEmail = async (req, res) => {
  await sendEmail({
    to: req.body.email,
    subject: 'Email Test - Sheqlee',
    template: 'test',
    variables: {
      NAME: req.body.name || 'User',
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Test email sent successfully',
  });
};

const raw = createToken();
const hashed = hashToken(raw);

// console.log(verifyToken(raw, hashed)); // true
// console.log(verifyToken('fake', hashed)); // false
