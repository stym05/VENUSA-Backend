const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const connectToDB = require('./config');
const customerRoutes = require("./routes/customerRoutes");
const addressRoutes = require('./routes/customerAddressRoutes');
const categoryRoutes = require("./routes/categoriesRoutes");
const subCategoryRoutes = require("./routes/subCategoriesRoutes");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishListRoutes");
const cartRoutes = require('./routes/cartRoutes');
const loginRoutes = require('./routes/loginRoutes');
const subscriberRoutes = require("./routes/subsciberRoutes");
const adminRoutes = require("./routes/adminDashboardRoutes");
const path = require("path");
const upload = require("./middlewares/upload");
const app = express();
// const server = http.createServer(app);
const PORT = process.env.PORT || 5000;


const corsOptions = {
  origin: ["*"], // Allow requests only from frontend's port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};


app.set("view engine", "ejs"); // Set EJS as the templating engine
app.set("views", "./views"); // Views folder

// Middleware
app.use(cors({
  origin: ["http://139.59.44.49:8081","https://venusa.co.in", "http://localhost:8082"],
}));
app.use(bodyParser.json());

// Server Static files
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res)=> {
  console.log("Howdy appliation is working fine...")
  res.end("Howdy appliation is working fine...")
})

// Define an upload route
app.post('/upload', upload.single('upload_file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send(`File uploaded: ${req.file.filename}`);
});


app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  res.send(`${req.files.length} files uploaded`);
});

app.get("/index", (req,res) => {
  return res.render("uploadfiles",(err, html) => {
    if (err) {
      console.error("Error rendering page:", err);
      res.status(500).send("Something went wrong!");
    } else {
      res.send(html);
    }
  })
})


// REST - API Routes
app.use("/api/customer", customerRoutes);
app.use('/api/addresses', addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/login',loginRoutes);
app.use("/api/subscriber", subscriberRoutes);
app.use("/api/dashboard", adminRoutes);

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