const express = require("express");
const cors = require("cors");
const dotenv=require("dotenv")
const connectDB = require("./config/db.js");
const userRoutes=require("./routes/userRoutes")
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/CartRoutes");
const checkRoutes = require("./routes/checkRoutes");
const orderRoutes = require("./routes/orderRoutes")
const uploadRoutes=require("./routes/uploadRoutes")
const subscriberRoutes=require("./routes/subscriberRoutes")
const adminRoutes=require("./routes/adminRoutes")
const productAdminRoutes=require("./routes/productAdminRotes")
const adminOrderRoutes=require("./routes/adminOrderRoutes")


const app = express();
app.use(express.json());
app.use(cors());
dotenv.config()
connectDB();

 
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("WELCOME TO Wearly");
});
//API Route
app.use("/api/users",userRoutes)
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/upload",uploadRoutes)
app.use("/api",subscriberRoutes)

app.use("/api/admin/users",adminRoutes)

app.use("/api/admin/products",productAdminRoutes)
app.use("/api/admin/orders",adminOrderRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
