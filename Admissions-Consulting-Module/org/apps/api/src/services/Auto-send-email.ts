import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const SendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> => {
  const mailOptions = {
    from: 'dtphu2101594@student.ctuet.edu.vn',
    to,
    subject,
    text,
    html, // Gửi phần html kèm theo
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
