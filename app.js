const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError.js')
const globalErrorHandler = require('./controllers/errorController')
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes.js');
const app = express();

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`./public`));
app.use((req, res, next) => {
    console.log('Hello from the middleware!');
    next();
});
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})

app.use(globalErrorHandler);

module.exports = app;