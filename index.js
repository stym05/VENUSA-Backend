const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const connectToDB = require('./config');
const http = require("http")
const customerRoutes = require("./routes/customerRoutes");
const addressRoutes = require('./routes/customerAddressRoutes');
const categoryRoutes = require("./routes/categoriesRoutes");
const subCategoryRoutes = require("./routes/subCategoriesRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
// const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

//http://139.59.44.49:8081
const corsOptions = {
  origin: ["*"], // Allow requests only from frontend's port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

// Middleware
app.use(cors({
  origin: ["http://139.59.44.49:8081", "http://venusa.co.in"],
}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));


app.get("/", (req, res)=> {
  console.log("Howdy appliation is working fine...")
  res.end("Howdy appliation is working fine...")
})

// Use Routes
app.use("/api/customer", customerRoutes);
app.use('/api/addresses', addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);


// Start the server
const startServer = async () => {
  try {
    await connectToDB();

    app.listen(PORT, () => { // Use httpServer instead of app
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();