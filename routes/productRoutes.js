const express = require("express");
const Product = require("../models/Product");
const { protect,admin } = require("../middleware/authMiddleware.js");

const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post("/", protect,admin, async (req, res) => {
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
        user: req.user._id, // Assuming req.user is set by the protect middleware
    });
    const createdProduct=await product.save();
    res.status(201).json({ message: "Product created successfully",createdProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
// @royte Put?api?products/:id
// Desc Upadate an existing product Id

router.put("/:id",protect,admin,async(req,res)=>{
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

    const product=await Product.findById(req.params.id)
if(product){
  product.name=name||product.name
  product.description=description||product.description
  product.price=price||product.price        
  product.discountPrice=discountPrice||product.discountPrice
  product.countInStock=countInStock||product.countInStock
  product.sku=sku||product.sku
  product.category=category||product.category
  product.brand=brand||product.brand
  product.sizes=sizes||product.sizes
  product.colors=colors||product.colors
  product.collections=collections||product.collections
  product.gender=gender||product.gender
  product.material=material||product.material
  product.images=images||product.images
  product.isFeatured=isFeatured !== undefined ? isFeatured:product.isFeatured
  product.isPublished=isPublished !== undefined ? isPublished:product.isPublished
  product.tags=tags||product.tags
  product.dimensions=dimensions||product.dimensions
  product.weight=weight||product.weight
const updatedProduct=await product.save()
  res.status(201).json({ message: "Product updated successfully",updatedProduct });
  }
  else{
    res.status(404).json({message:"Product not found"})
  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
})

//@route Delete /api/product/:id
//@desc Delete a product by id
//@access Private/Admin

router.delete("/:id",protect,admin,async(req,res)=>{
try {
  const product =await Product.findById(req.params.id)
  if(product){

  await product.deleteOne();
  res.json({message:"Product Deleted"})
  }
  else{
    res.status(404).json({message:"Product not found"})

  }

} catch (error) {
  console.error(error);
  res.status(500).json({ message: "Server Error", error: error.message });
}
})

// @route get/api/products
// @desc    Get all products query filter
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { collections, size, color, gender, category, brand, minPrice, maxPrice, sortBy, material, search,limit } = req.query;

    let query = {};

    if (collections && collections.toLocaleLowerCase() !== "all"){
      query.collections = collections;
    } 
    if (category && category.toLocaleLowerCase()!== "all"){
      query.category = category;
    }
    if (material) {
      query.material = { $in: material.split(",") };
    }
    
    if (brand) {
      query.brand = { $in: brand.split(",") };
    }
    
    if (size) {
      query.sizes = req.query.size ? req.query.size.split(',') : [];
    }
    if (color) {
      query.colors = { $in: [color]};
    }
    if (gender) query.gender = gender;
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (search){
      query.$or=[
        {name : { $regex: search, $options: "i" } },
         {description:{$regex: search, $options: "i"}}
      ]
    }
    let sort={}
    // Sort Logic
if (sortBy) {
  switch (sortBy) {
    case "priceAsc":
      sort = { price: 1 };
      break;
    case "priceDesc":
      sort = { price: -1 };
      break;
    case "popularity":
      sort = { rating: -1 };
      break;
    default:
      break;
  }
}

    const products = await Product.find(query).sort(sort).limit(Number(limit) || 0);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


router.get("/best-seller", async (req, res) => {
  try {
    const bestSeller = await Product.findOne().sort({ rating: -1 });
    if (bestSeller) {
      res.json(bestSeller);
    } else {
      res.status(404).json({ message: "No best seller found" });
    }
  } catch (error) {
    // It's a good practice to log and send an error response
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
 
// @route GET /api/products/new-arrivals
// @desc Retrieve latest 8 products – Creation date
// @access Public
router.get("/new-arrivals", async (req, res) => {
  try {
    // Fetch latest 8 products
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
    res.json(newArrivals);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});




// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/products/similar/:id
// @desc Get similar products
// @access Public
router.get("/similar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: id }, // Exclude the current product ID
      gender: product.gender,
      category: product.category,
    }).limit(4);

    res.json(similarProducts)
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});





module.exports = router;
