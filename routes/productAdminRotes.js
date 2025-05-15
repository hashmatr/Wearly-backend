const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const Product=require("../models/Product")

const router = express.Router();

// Route to get all products (Admin only)
router.get('/', protect, admin,async(req,res)=>{
    try {
        const products=await Product.find({})
        res.json(products)
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Server Error"})

    }
});

// @route   POST /api/admin/products
// @desc    Create a new product
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      sku,
      category,
      brand,
      sizes,
      colors,
      collections,
      gender,
      material,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      sku,
      category,
      brand,
      sizes,
      colors,
      collections,
      gender,
      material,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put("/:id", protect, admin, async(req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      sku,
      category,
      brand,
      sizes,
      colors,
      collections,
      gender,
      material,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if(product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.discountPrice = discountPrice || product.discountPrice;
      product.countInStock = countInStock || product.countInStock;
      product.sku = sku || product.sku;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      product.collections = collections || product.collections;
      product.gender = gender || product.gender;
      product.material = material || product.material;
      product.images = images || product.images;
      product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;
      product.tags = tags || product.tags;
      product.dimensions = dimensions || product.dimensions;
      product.weight = weight || product.weight;

      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({message: "Product not found"});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete("/:id", protect, admin, async(req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if(product) {
      await product.deleteOne();
      res.json({message: "Product deleted successfully"});
    } else {
      res.status(404).json({message: "Product not found"});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
