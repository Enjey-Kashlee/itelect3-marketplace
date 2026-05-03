const APIFeatures = require('./../utils/apiFeatures');
const Product = require("./../models/productModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError")

// const fs = require('fs');

// const products = JSON.parse(
//     fs.readFileSync('data/products.json')
// );

// exports.checkID = (req, res, next, val) => {
//     console.log(`Product id is: ${val}`);
//     if (val * 1 >= products.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         });
//     }
//     next();
// };

// exports.checkBody = (req, res, next) => {
//     if (!req.body.title || !req.body.price) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Missing title or price'
//         });
//     }
//     next();
// };

exports.aliasTopProducts = (req, res, next) => {
    req.query.limit = '3';
    req.query.sort = 'price';
    req.query.fields = 'title,author,price,condition,seller';
    console.log(req.query.limit, req.query.sort, req.query.fields)
    next();
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Product.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const products = await features.query;
    res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        results: products.length,
        data: {
            products,
        },
    });
});

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError("No product found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            product,
        },
    });
});


exports.createProduct = catchAsync(async (req, res, next) => {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            product: newProduct,
        },
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await
        Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, //return updated data instead of old one
            runValidators: true
        });

    if (!product) {
        return next(new AppError("No product found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            product,
        },
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(new AppError("No product found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

exports.getProductGenres = catchAsync(async (req, res, next) => {
    const genres = await Product.aggregate([
        {
            $match: {
                price: { $lt: 1000 }
            }
        },
        {
            $unwind: '$genres'
        },
        {
            $group: {
                _id: { $toUpper: '$genres' },
                numProducts: { $sum: 1 },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }
    ]);
    res.status(200).json({
        status: "success",
        data: {
            genres
        }
    });
})
