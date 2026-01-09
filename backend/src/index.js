import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";
import http from "http"; 
import { initSocketIO } from "./socket.js"; 
import https from 'https'
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();

const PORT = process.env.PORT || 8080;

 // Load ssl certificate
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const sslOptions = {
  key: fs.readFileSync(path.join("E:/Cyber Security/JobiyoWeb/certs/localhost+2-key.pem")),
  cert: fs.readFileSync(path.join("E:/Cyber Security/JobiyoWeb/certs/localhost+2.pem")),
};



// const httpServer = http.createServer(app);
const httpsServer = https.createServer(sslOptions, app);


const io = initSocketIO(httpsServer);

app.set("io", io);

connectDB()
  .then(() => {
    httpsServer.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
    process.exit(1);
  });