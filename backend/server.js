const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.json({
        message: "Food Ordering Backend Running"
    });
});

app.get('/menu', (req, res) => {
    res.json([
        { id: 1, item: "Pizza", price: 250 },
        { id: 2, item: "Burger", price: 150 },
        { id: 3, item: "Fried Rice", price: 200 }
    ]);
});

app.listen(5000, () => {
    console.log("Server Started on Port 5000");
});
