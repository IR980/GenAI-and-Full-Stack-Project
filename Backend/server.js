require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");
const dns = require("dns")
dns.setServers(["8.8.8.8", "8.8.4.4"])
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI is missing from Backend/.env");
  if (!process.env.JWT_SECRET)
    throw new Error("JWT_SECRET is missing from Backend/.env");

  await connectToDB();
  app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
}

startServer().catch((error) => {
  console.error("Unable to start backend:", error.message);
  process.exit(1);
});
