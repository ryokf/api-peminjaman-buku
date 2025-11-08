import express from 'express';
import { PORT } from './config/env.js';
import bookRouter from './routes/book.routes.js';

const app = express();

app.use('/api/books', bookRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Book Borrowing API');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
});