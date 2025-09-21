const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());

// Your Google Sheet CSV link
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/19OKJUAk1z3k9RwRapJiTVj1KHW2jJh87gYrhgI-niVg/gviz/tq?tqx=out:csv';

const parseCSV = (csvText) => {
    const lines = csvText.split('\n').slice(1); // skip header row
    return lines.map(line => {
        const [title, price, image, link, source] = line.split(',');
        return { title, price: parseFloat(price), image, link, source };
    });
};

app.get('/search', async (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    try {
        const response = await axios.get(SHEET_CSV_URL);
        const products = parseCSV(response.data);
        const filtered = products.filter(p => p.title.toLowerCase().includes(query));
        filtered.sort((a, b) => a.price - b.price); // cheapest first
        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
