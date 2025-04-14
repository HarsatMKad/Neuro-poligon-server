import mongoose from "mongoose";
import app from "./app";
import "dotenv/config";
import config from "./utils/config";

const port = config.port
const dbUrl = config.mongoURL

const connectDB = async (retryCount = 0) => {
  const maxRetries = 5;

  try{
    await mongoose.connect(dbUrl!);
    app.listen(port, () => {
      console.log(`Сервер запущен на: http://localhost:${port}`);
    });
  }catch (error) {
    console.error("Ошибка подключения к базе данных:", error);
    if(retryCount < maxRetries){
      setTimeout(() => connectDB(retryCount + 1), 5000);
    } else {
      console.error("Превышено максимальное количество подключений.")
      process.exit(1);
    }
  }
}

connectDB();