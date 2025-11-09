import express from 'express';
import { PORT } from './config/env.js';
import bookRouter from './routes/book.routes.js';
import authRouter from './routes/auth.routes.js';

const app = express();

// Middleware untuk parsing JSON body
app.use(express.json());
// Middleware untuk parsing URL-encoded bodies (seperti dari form)
app.use(express.urlencoded({ extended: true }));

app.use('/api/books', bookRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Book Borrowing API');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
});

