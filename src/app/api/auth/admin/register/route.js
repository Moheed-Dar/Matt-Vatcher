import { NextResponse } from 'next/server';
import connectDB from '@/backend/lib/db';
import User from '@/backend/models/user';
import { generateToken } from '@/backend/lib/auth';
import { sendWelcomeEmail } from '@/backend/lib/email';
import { uploadImage } from '@/backend/lib/cloudinary'; 
import ApiError from '@/backend/utils/apierror';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    // Extract Text Fields
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const phone = formData.get('phone');
    const role = formData.get('role');
    
    // Extract File Field
    const avatarFile = formData.get('avatar');

    // Validate required fields
    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email and password are required');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }

    // ✅ STRICT CHECK: Sirf Admin ko hi register hone do
    if (role !== 'admin') {
      throw new ApiError(403, 'This endpoint is strictly for Admin registration only.');
    }

    // ✅ CHECK: Kya Admin pehle se exist karta hai?
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw new ApiError(403, 'Admin account already exists. Only one admin is allowed.');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // ✅ IMAGE COMPRESS & UPLOAD TO CLOUDINARY
    let avatarUrl = '';
    if (avatarFile && avatarFile.size > 0 && avatarFile.name) {
      try {
        const cloudinaryRes = await uploadImage(avatarFile, 'avatars', { 
          maxWidth: 500, 
          maxHeight: 500,
          quality: 80 
        });
        avatarUrl = cloudinaryRes.url;
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new ApiError(500, 'Failed to upload avatar image. Please try again.');
      }
    }

    // Hash password here
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Admin User
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'admin', // ✅ Hardcoded 'admin', koi aur role yahan nahi aa sakta
      avatar: avatarUrl,
    });

    // Generate token
    const token = generateToken(user._id, user.tokenVersion || 0);

    // Send welcome email
    sendWelcomeEmail(user).catch((err) => console.log('Welcome email failed:', err));

    // Remove password from response
    const userObj = user.toJSON();

    return NextResponse.json(
      {
        success: true,
        message: 'Admin registered successfully', // ✅ Message bhi sirf Admin ka
        data: {
          user: userObj, // ✅ Response mein role: "admin" hi aayega
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Full Error in Register:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: statusCode }
    );
  }
}