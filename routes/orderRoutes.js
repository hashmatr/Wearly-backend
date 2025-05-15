const express=require('express');
const Order=require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

const router=express.Router();

// @route Get /api/orders/my-orders
// @desc Get all orders of the logged in user
// @access Private

router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
    }       
);

// route Get /api/orders/:id
// desc Get order by id
// access Private

router.get("/:id",protect,async(req,res)=>{
    try {
        const order=await Order.findById(req.params.id).populate(
            "user",
            "name email"
        )

        if(!order){
            return res.status(404).json({message:"Order not Found"})
        }

        res.json(order)

    } catch (error) {
        console.error(error)
            res.status(500).json({message:"Server Error"})
        
    }
})

module.exports=router