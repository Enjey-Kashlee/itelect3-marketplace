const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxLength: [50, 'Title must be less than or equal to 50 characters'],
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0 // Price cannot be negative
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'Discount price {{VALUE}} should be below regular price'
    }
  },
  currency: {
    type: String,
    required: true,
    default: 'PHP',
    uppercase: true,
    trim: true
  },
  condition: {
    type: String,
    required: true,
    // Enums restrict this field to only these exact strings
    enum: ['Brand New', 'Used', 'Good', 'Acceptable'],
    default: 'Brand New'
  },
  seller: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  genres: {
    type: [String], // Defines an array of strings
    required: true,
    default: []
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0 // Stock cannot be negative
  },
  slug: String,
  // Add this somewhere in your productSchema
  premium: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('daysPosted').get(function () {
  const today = Date.now();

  const differenceInMs = today - this.createdAt.getTime();

  const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

  return Math.floor(differenceInDays);
})

productSchema.pre('save', function () {
  this.slug = slugify(this.title, { lower: true });
})

productSchema.pre(/^find/, function () {
  this.find({ premium: { $ne: true } });
  this.start = Date.now();
});

productSchema.post(/^find/, function (docs) {
  console.log(`Query took ${Date.now() -
    this.start} milliseconds!`);
  console.log(docs);
});

productSchema.post('save', function (doc) {
  console.log(doc);
})

productSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { premium: { $ne: true } } });
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;