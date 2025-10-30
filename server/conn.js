const mongoose = require("mongoose");

// Validate that the MONGODB_URL env var is set and provide a helpful message
const mongoUrl = process.env.MONGODB_URL;
if (!mongoUrl) {
  console.error(
    'MONGODB_URL is not set. Create a file named server/.env (or set the env var) with MONGODB_URL and try again.'
  );
  // Exit so the developer notices the missing config instead of silently continuing
  process.exit(1);
}

// connection
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.error('MongoDB connection error:', err);
    process.exit(1);
})
