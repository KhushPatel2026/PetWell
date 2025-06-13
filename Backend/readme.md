PetWell Backend

Installation
Clone the Repository
git clone <repository-url>
cd petwell-backend

Install Dependencies
npm install @google/generative-ai aws-sdk bcryptjs cors dotenv express express-rate-limit express-session helmet jsonwebtoken mongoose multer multer-s3 nodemailer passport passport-google-oauth20 pdfkit winston qrcode @aws-sdk/s3-request-presigner @aws-sdk/client-s3

Set Up Environment Variables
Copy .env.example to .env

Edit .env with your credentials:
MONGO_URL: MongoDB connection string (e.g., mongodb://localhost:27017/petwell)
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET: AWS S3 credentials
NODEMAILER_EMAIL, NODEMAILER_PASSWORD: Gmail credentials for email service
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET: Google OAuth credentials
GEMINI_API_KEY: Gemini API key
RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX: Rate limiting settings
JWT_PUBLIC_KEY, JWT_PRIVATE_KEY: Base64-encoded RSA keys (generated below)

Generate JWT Key Pair
Run the key generation script:node utils/generate-jwt-keys.js
Copy the base64-encoded public and private keys from the console output to JWT_PUBLIC_KEY and JWT_PRIVATE_KEY in .env.


Set Up MongoDB
Ensure MongoDB is running locally or configure a cloud instance.
Update MONGO_URL in .env with the appropriate connection string.


Configure AWS S3
Create an S3 bucket and update AWS_S3_BUCKET in .env.
Ensure the IAM user has permissions for S3 operations.

Starting the Server
Start the Server
npm start

The server runs on http://localhost:3000 by default (or the port specified in PORT in .env).
Logs indicate MongoDB connection and server status.


Verify Setup
Ensure the server logs show "MongoDB connected" and "Server running on port 3000".
Test connectivity using a frontend or API client (e.g., Postman) with the configured CORS origin (http://localhost:5173 or your production domain).



Notes
Production Deployment: Set NODE_ENV=production in .env for secure cookies and CORS restrictions.
Frontend Integration: Configure the frontend to use https://your-frontend-domain.com and update CORS settings in .env.
Breed Database: Predefined dog and cat breeds are included in src/utils/breeds.js.
QR Codes: Generated for user profiles and stored in the User model.
Payment Plans: Restrict pet profiles (2/5/10) and sub-users (5/20/50) based on basic, premium, or enterprise plans.

Troubleshooting

MongoDB Connection Issues: Verify MONGO_URL and ensure MongoDB is running.
AWS S3 Errors: Check AWS credentials and bucket permissions.
Email Failures: Confirm Gmail credentials and enable "Less secure app access" or use an App Password.
JWT Errors: Regenerate keys if authentication fails.

