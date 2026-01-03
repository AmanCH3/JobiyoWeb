import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";
import http from "http"; 
import { initSocketIO } from "./socket.js"; 

dotenv.config();

const PORT = process.env.PORT || 8000;


const httpServer = http.createServer(app);

const io = initSocketIO(httpServer);

app.set("io", io);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
    process.exit(1);
  });