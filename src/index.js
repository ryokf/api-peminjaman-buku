import express from 'express';
import { PORT } from './config/env.js';
import bookRouter from './routes/book.routes.js';
import authRouter from './routes/auth.routes.js';
import loanRouter from './routes/loan.routes.js';
import reservationsRouter from './routes/reservations.routes.js';
import writerRouter from './routes/writer.routes.js';
import categoryRouter from './routes/category.routes.js';
import authorize from './middleware/auth.middleware.js';

const app = express();

// Middleware untuk parsing JSON body
app.use(express.json());
// Middleware untuk parsing URL-encoded bodies (seperti dari form)
app.use(express.urlencoded({ extended: true }));

// Auth route - tanpa middleware authorize
app.use('/api/auth', authRouter);

// Semua route lainnya memerlukan authorization
app.use('/api/books', authorize, bookRouter);
app.use('/api/loans', authorize, loanRouter);
app.use('/api/reservations', authorize, reservationsRouter);
app.use('/api/writers', authorize, writerRouter);
app.use('/api/categories', authorize, categoryRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Book Borrowing API');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
});