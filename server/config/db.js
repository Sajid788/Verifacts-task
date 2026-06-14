import "dotenv/config";
import mongoose from "mongoose";

const connection = mongoose.connect(process.env.MONGO_URI);
const PORT = process.env.PORT;

export { connection, PORT };