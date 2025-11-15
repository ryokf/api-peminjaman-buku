import express from 'express';
import { PORT } from './config/env.js';
import bookRouter from './routes/book.routes.js';
import authRouter from './routes/auth.routes.js';
import loanRouter from './routes/loan.routes.js';
import reservationsRouter from './routes/reservations.routes.js';
import writerRouter from './routes/writer.routes.js';
import categoryRouter from './routes/category.routes.js';

const app = express();

// Middleware untuk parsing JSON body
app.use(express.json());
// Middleware untuk parsing URL-encoded bodies (seperti dari form)
app.use(express.urlencoded({ extended: true }));

app.use('/api/books', bookRouter);
app.use('/api/auth', authRouter);
app.use('/api/loans', loanRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/writers', writerRouter);
app.use('/api/categories', categoryRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Book Borrowing API');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
});