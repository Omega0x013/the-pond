import express from 'express';
import flat from '@omega0x013/flat-express';

const app = express();
const PORT = 8000;

const router = flat({
  /* put route mappings in here */
});

app.use(router);
app.use(express.static("src/www"));

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Listening on port ${8000}`);
});