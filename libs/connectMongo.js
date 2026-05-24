const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection.asPromise();
  }

  return await mongoose.connect(process.env.MONGO_URI);
};

module.exports = connectToMongoDB;
