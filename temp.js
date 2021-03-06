const express = require("express");

const app = express();

// Port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));
