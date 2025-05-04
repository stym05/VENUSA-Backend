import dotenv from "dotenv";
dotenv.config();
const config = {
  secret_key: process.env.SECRET_KEY,
//   database_url:
//     process.env.DATABASE_URL ||
//     // `mongodb+srv://pankudev:${process.env.MONGO_PASSWORD}.xnd980u.mongodb.net/acs?retryWrites=true&w=majority&appName=acs`,
//     `mongodb+srv://acspathshala2024:${process.env.MONGO_PASSWORD}@cluster0.lobir.mongodb.net/acs?retryWrites=true&w=majority&appName=Cluster0`,
//   google_client_id: process.env.GOOGLE_CLIENT_ID,
  razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET,
  razorpay_key_id: process.env.RAZORPAY_KEY_ID,
  razorpay_webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
//   zoom_api_secret: process.env.ZOOM_API_SECRET,
//   zoom_api_key: process.env.ZOOM_API_KEY,
//   zoomAccountId: process.env.ZOOM_ACCOUNT_ID,
};

export default config;
