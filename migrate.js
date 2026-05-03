const mongoose = require("mongoose");
const dotenv = require('dotenv');
const Product = require("./models/productModel");
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    "<db_password>",
    process.env.DATABASE_PASSWORD,
);
console.log(DB);

mongoose.connect(DB).then(() => {
    console.log("DB connected succesfully!");
})

const migratePremium = async () => {
  try {
    console.log("Upgrading database with premiumProduct field...");

    const result = await Product.updateMany(
      // 1. The Filter: Only touch documents that don't have this field yet
      { premium: { $exists: false } }, 
      
      // 2. The Update: Just set it to false!
      { $set: { premium: false } }
    );

    console.log(`Migration complete! Successfully updated ${result.modifiedCount} products.`);
  } catch (err) {
    console.error("Migration failed:", err);
  }
};

migratePremium();