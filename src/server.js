import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/weather/:city", async(req, res) => {
    const city = req.params.city;

    try {
        const response = await fetch(`https://api.meteo.lt/v1/places/${city}/forecasts/long-term`);
        
        if (!response.ok) {
        throw new Error(`API klaida: ${response.status}`);
        }
        const data = await response.json();
        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
});

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));