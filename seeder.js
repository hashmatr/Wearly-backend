const mongoose=require("mongoose")
const dotenv=require("dotenv");
const Product=require("./models/Product");
const User=require("./models/User")
const Cart=require("./models/Cart")
const products=require("./data/products")

dotenv.config();
mongoose.connect(process.env.MONGO_URI)

const importData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        const createdUsers = await User.create({
            name:"Admin User",
            email:"admin@gmail.com",
            password:"123456",
            role:"admin"
        });
        const userId = createdUsers._id;

        const sampleProducts = products.map(product => {
            return { ...product,user:userId };
        });

        await Product.insertMany(sampleProducts);

        console.log("Product Data Imported succesfully");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();

        console.log("Data Destroyed!");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};


if (process.argv[2] === "-d") {
    destroyData();
} else {
    importData();
}
