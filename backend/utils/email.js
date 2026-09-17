import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (email, otp, type = "verification") => {
  const isVerification = type === "verification";
  const subject = isVerification ? "Verify your URL Shortener Account" : "Reset your URL Shortener Password";
  const title = isVerification ? "Welcome to URL Shortener!" : "Password Reset Request";
  const description = isVerification 
    ? "Thank you for signing up. Please use the verification code below to activate your account."
    : "We received a request to reset your password. Use the code below to proceed.";

  const mailOptions = {
    from: `"URL Shortener Auth" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0c0e14; padding: 40px 20px; color: #f0f0f8;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12151e; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 40px; text-align: center; box-shadow: 0 8px 40px rgba(0,0,0,0.4);">
          
          <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #f0f0f8;">${title}</h2>
          
          <p style="font-size: 15px; color: #9294a8; line-height: 1.6; margin-bottom: 30px;">
            ${description}
          </p>
          
          <div style="background-color: #171b27; border: 1.5px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 20px; margin: 0 auto 30px auto; display: inline-block;">
            <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; color: #a78bfa; font-weight: 700;">
              ${otp}
            </h1>
          </div>
          
          <p style="font-size: 14px; color: #5a5c6e; margin-bottom: 0;">
            This code will expire in exactly 4 minutes.<br>
            If you did not request this, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 30px 0;">
          
          <p style="font-size: 12px; color: #5a5c6e; margin: 0;">
            &copy; ${new Date().getFullYear()} URL Shortener. Built with React & Node.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
