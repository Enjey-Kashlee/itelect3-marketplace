const express = require('express');
const productController = require('./../controllers/productController');
const router = express.Router();
const authController = require("./../controllers/authController");

// router
//     .param('id', productController.checkID);
router
    .route("/product-genres")
    .get(productController.getProductGenres)
router
    .route("/top-3-cheap")
    .get(productController.aliasTopProducts, productController.getAllProducts);
router
    .route('/')
    .get(authController.protect, productController.getAllProducts)
    .post(productController.createProduct);
router
    .route('/:id')
    .get(productController.getProduct)
    .patch(productController.updateProduct)
    .delete(authController.protect, authController.restrictTo('admin'), productController.deleteProduct);

module.exports = router;
