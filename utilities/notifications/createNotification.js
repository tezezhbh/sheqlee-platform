const Notification = require('../../models/notificationModel');

module.exports = async ({ user, title, message, type = 'system', link }) => {
  await Notification.create({
    user,
    title,
    message,
    type,
    link,
  });
};
