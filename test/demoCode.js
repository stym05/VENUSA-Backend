// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const dotenv = require("dotenv");

// dotenv.config();

// const users = []; // Temporary storage (use a database in production)

// // Register User
// exports.register = async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Save user
//         users.push({ username, password: hashedPassword });

//         res.status(201).json({ message: "User registered successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Error registering user" });
//     }
// };

// // Login User
// exports.login = async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const user = users.find((u) => u.username === username);

//         if (!user) {
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         // Check password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

//         res.json({ token });
//     } catch (error) {
//         res.status(500).json({ message: "Error logging in" });
//     }
// };
