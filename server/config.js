import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const result = await mongoose.connect(
      "mongodb+srv://ptmedenilla:12345@cluster0.mlabjkt.mongodb.net/?appName=Cluster0",
      {
        dbName: "ptmedenilla",
      },
    );

    console.log("Connected to DB name:", result.connection.db.databaseName);
  } catch (err) {
    console.log(err.message);
  }
};
