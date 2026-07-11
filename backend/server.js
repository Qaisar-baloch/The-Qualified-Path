require("dotenv").config();
const express = require("express");
const cors = require("cors");

const contactRoutes = require("./routes/contact");
const contentRoutes = require("./routes/content");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/contact", contactRoutes);
app.use("/api/content", contentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
