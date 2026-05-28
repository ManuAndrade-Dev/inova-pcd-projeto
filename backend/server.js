const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dbStore = require("./db/store");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dataRoutes = require("./routes/dataRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/data", dataRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

const listenOnPort = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.on("error", (err) => reject(err));
  });
};

const start = async () => {
  await dbStore.connect();
  const basePort = Number(process.env.PORT) || 5000;

  try {
    const server = await listenOnPort(basePort);
    const port = server.address().port;
    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      const fallbackPort = basePort === 5000 ? 5001 : basePort + 1;
      console.log(`Porta ${basePort} ocupada. Tentando ${fallbackPort}...`);
      const server = await listenOnPort(fallbackPort);
      const port = server.address().port;
      console.log(`Servidor rodando em http://localhost:${port}`);
    } else {
      console.error("Erro ao iniciar servidor:", error.message);
      process.exit(1);
    }
  }
};

start();
