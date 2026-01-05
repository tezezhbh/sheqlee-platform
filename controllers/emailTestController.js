const sendEmail = require('./../utilities/emails/sendEmail');

exports.sendTestEmail = async (req, res) => {
  await sendEmail({
    to: req.body.email,
    subject: 'Email Test - Sheqlee',
    template: 'test.html',
    variables: {
      NAME: req.body.name || 'User',
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Test email sent successfully',
  });
};
