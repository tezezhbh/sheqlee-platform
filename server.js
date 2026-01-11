const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subscription = require('./models/subscriptionModel');

dotenv.config({ path: './config.env' });
const app = require('./app');

const L_DB = process.env.LOCAL_DATABASE;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// mongoose.connection.once('open', async () => {
//   await mongoose.connection.db.collection('subscriptions').dropIndexes();
//   await Subscription.syncIndexes();
//   console.log('Subscription indexes synced');
// });

mongoose
  .connect(DB)
  .then(() => console.log('MongoDB atlas is connected successfully!'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`Server is listening on ${port}`)
);
