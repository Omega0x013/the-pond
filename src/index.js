import express from 'express';

// http://boutglay.com/locallydb/

// Initialise server and constants
const app = express();
const PORT = process.env.PORT || 8000;

// Set up route mappings.
app.use(express.static("www"));

// Allow incoming JSON body payloads to be processed.
app.use(express.json());

// Set the server to await and serve connections.
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});