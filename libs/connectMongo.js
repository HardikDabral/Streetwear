// libs/MongoConnect.js
const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  if (mongoose.connections[0].readyState) {
    return mongoose.connection.asPromise();
  }

  return await mongoose.connect(process.env.MONGO_URI);
};

module.exports = connectToMongoDB;
