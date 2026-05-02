const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/ashwani-tripathi-associates";

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri);

  console.log("Connected to MongoDB.");
}

module.exports = connectDatabase;
