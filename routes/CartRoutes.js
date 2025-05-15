const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper function to get a cart by user ID or guest ID
const getCart = async (userId, guestId) => {
    if (userId) {
        return await Cart.findOne({ user: userId });
    } else if (guestId) {
        return await Cart.findOne({ guestId });
    }
    return null;
};

// @route   POST /api/cart
// @desc    Add a product to the cart for a guest or logged-in user
// @access  Public
router.post("/", async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await getCart(userId, guestId);

        if (cart) {
            // Check if product with same id, size, and color exists
            const productIndex = cart.products.findIndex(
                (p) =>
                    p.productId.toString() === productId &&
                    p.size === size &&
                    p.color === color
            );

            if (productIndex > -1) {
                // If it exists, update quantity
                cart.products[productIndex].quantity += quantity;
            } else {
                // Else, push new product entry
                cart.products.push({
                    productId,
                    name: product.name,
                    price: product.price,
                    image: product.images[0]?.url || product.images[0],
                    size,
                    color,
                    quantity,
                });
            }

            // Update total price
            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + (Number(item.price) * item.quantity),
                0
            );

            await cart.save();
            return res.status(200).json(cart);
        } else {
            // Create new cart
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {
                        productId,
                        name: product.name,
                        image: product.images[0]?.url || product.images[0],
                        price: product.price,
                        size,
                        color,
                        quantity,
                    },
                ],
                totalPrice: product.price * quantity,
            });

            return res.status(201).json(newCart);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// @route   PUT /api/cart
// @desc    Update cart item quantity for a guest or logged-in user
// @access  Public
router.put("/", async (req, res) => {
    const { userId, quantity, size, color, productId, guestId } = req.body;

    try {
        let cart = await getCart(userId, guestId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(
            (p) =>
                p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        );

        if (productIndex > -1) {

            if(quantity > 0) {
                cart.products[productIndex].quantity = quantity;
            }
            else {

                cart.products.splice(productIndex, 1);
            }

            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + (Number(item.price) * item.quantity),
                0
            );

            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Product not found in cart" });
        }


    }



    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});


// @route   DELETE /api/cart
// @desc    Remove a product from the cart
// @access  Public
router.delete("/", async (req, res) => {
    const { productId, size, color, guestId, userId } = req.body;

    try {
        let cart = await getCart(userId, guestId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(
            (p) =>
                p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);

            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + (Number(item.price) * item.quantity),
                0
            );

            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});


// @route   GET /api/cart
// @desc    Get logged-in user's or guest user's cart
// @access  Public
router.get("/", async (req, res) => {
    const { userId, guestId } = req.query;

    try {
        const cart = await getCart(userId, guestId);

        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ message: "Cart not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});



router.post("/merge", protect, async (req, res) => {
    const { guestId } = req.body;

    try {
        const guestCart = await Cart.findOne({ guestId });
        const userCart = await Cart.findOne({ user: req.user._id });

        if (guestCart && guestCart.products.length > 0) {
            if (userCart) {
                // Merge guest products into user cart
                guestCart.products.forEach((guestProduct) => {
                    const index = userCart.products.findIndex(
                        (p) =>
                            p.productId.toString() === guestProduct.productId.toString() &&
                            p.size === guestProduct.size &&
                            p.color === guestProduct.color
                    );

                    if (index > -1) {
                        userCart.products[index].quantity += guestProduct.quantity;
                    } else {
                        userCart.products.push(guestProduct);
                    }
                });

                userCart.totalPrice = userCart.products.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );

                await userCart.save();

                // Delete guest cart
                try {
                    await Cart.findOneAndDelete({ guestId });
                } catch (deleteError) {
                    console.error("Error deleting guest cart:", deleteError);
                }

                return res.status(200).json(userCart);
            } else {
                // No user cart exists, assign guest cart to user
                guestCart.user = req.user._id;
                guestCart.guestId = undefined;

                await guestCart.save();
                return res.status(200).json(guestCart);
            }

        } else {
            // 👇 Here's your ELSE block for when guest cart is empty/missing
            if (userCart) {
                return res.status(200).json(userCart);
            } else {
                return res.status(404).json({ message: "No cart found" });
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



module.exports = router;
