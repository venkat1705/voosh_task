import express from "express";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import connectDB from "./config/database.js";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());

// routes
app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
