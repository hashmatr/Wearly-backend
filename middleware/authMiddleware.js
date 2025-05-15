const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request (optional - can fetch from DB if needed)
            req.user = await User.findById(decoded.user.id).select("-password");

            next();
        } catch (error) {
            console.error("JWT verification failed:", error.message);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

const admin=(req,res,next)=>{
    if(req.user && req.user.role==="admin"){
        next()
    }else{
        res.status(401).json({message:"Not authorized as an admin"})
    }
}


module.exports = {protect,admin};