import express from 'express';
import flat from '@omega0x013/flat-express';

// http://boutglay.com/locallydb/

// Initialise server and constants
const app = express();
const PORT = 8000;

// Describes route mappings
const router = flat({
  /* put route mappings in here */
});

// Set up route listening.
app.use(router);
app.use(express.static("src/www"));

// Allow incoming JSON body payloads to be processed.
app.use(express.json());

// Set the server to await and serve connections.
app.listen(PORT, () => {
  console.log(`Listening on port ${8000}`);
});