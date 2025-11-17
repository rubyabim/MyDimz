const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const barang = [
  { id: 1, kode: "B001", nama: "Ayam Geprek", harga: 25000 },
  { id: 2, kode: "B002", nama: "Nasi Goreng", harga: 20000 },
];

app.get("/api/barang", (req, res) => {
  res.json(barang);
});

app.post("/api/barang", (req, res) => {
  const newBarang = { id: barang.length + 1, ...req.body };
  barang.push(newBarang);
  res.json({ success: true, data: newBarang });
});

app.listen(4000, () => console.log("✅ API running on http://localhost:4000"));
