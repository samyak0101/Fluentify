import 'dotenv/config';
import express from 'express';
import translateRoute from './routes/translateRoute';
import dictionaryRoute from './routes/dictionaryRoute';
import cors from 'cors'; // Import the cors middleware

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// allow CORS
app.use(cors());

const PORT = 8080;

app.use('/translate', translateRoute);
app.use('/dictionary', dictionaryRoute);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});