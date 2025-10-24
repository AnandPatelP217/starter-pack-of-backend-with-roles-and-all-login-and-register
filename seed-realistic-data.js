/**
 * =========================================
 * REALISTIC DATABASE SEEDING SCRIPT
 * =========================================
 * Populates the database with fake but realistic data
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import { User } from './src/models/user.model.js';
import Package from './src/models/package.model.js';
import Project from './src/models/project.model.js';
import Payment from './src/models/payment.model.js';
import Payout from './src/models/payout.model.js';
import Message from './src/models/message.model.js';
import Notification from './src/models/notification.model.js';
import { Upload } from './src/models/upload.model.js';

// Random data generators
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const names = ['John Smith', 'Sarah Johnson', 'Michael Williams', 'Emily Brown', 'David Jones', 'Jessica Garcia', 'Daniel Miller', 'Ashley Davis', 'Chris Rodriguez', 'Amanda Martinez'];
const projects = ['Wedding Video', 'Corporate Training', 'Product Launch', 'Birthday Party', 'Real Estate Tour', 'YouTube Intro', 'Event Recap', 'Travel Vlog', 'Music Video', 'Social Media Ad'];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Database Seeding...\n');
    console.log('='.repeat(60));
    
    await connectDB();

    // Clear existing test data
    console.log('\n🗑️  Clearing existing test data...');
    await User.deleteMany({ email: { $regex: /@videoedit\.com|@testcustomer\.com/ } });
    await Package.deleteMany({});
    await Project.deleteMany({});
    await Payment.deleteMany({});
    await Payout.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Upload.deleteMany({});
    console.log('✅ Test data cleared\n');

    // 1. Create Admin
    console.log('📌 Creating Admin...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@videoedit.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      is_verified: true
    });
    console.log(`✅ Admin: ${admin.email}\n`);

    // 2. Create Packages
    console.log('📌 Creating Packages...');
    const packagesData = await Package.insertMany([
      {
        name: 'basic',
        display_name: 'Basic Editing',
        description: 'Perfect for simple video edits',
        base_price: 1999,
        max_video_length: 10,
        max_file_size: 500,
        max_revisions: 2,
        estimated_delivery_days: 3,
        features: [
          { name: 'Video trimming', included: true },
          { name: 'Basic transitions', included: true }
        ],
        editing_options: { transitions: true },
        is_active: true
      },
      {
        name: 'advanced',
        display_name: 'Advanced Editing',
        description: 'Professional video editing',
        base_price: 4999,
        max_video_length: 30,
        max_file_size: 2000,
        max_revisions: 4,
        estimated_delivery_days: 5,
        features: [
          { name: 'Color grading', included: true },
          { name: 'Motion graphics', included: true },
          { name: 'Sound design', included: true }
        ],
        editing_options: { color_grading: true, transitions: true, sound_design: true, motion_graphics: true },
        is_active: true,
        is_popular: true
      },
      {
        name: 'custom',
        display_name: 'Premium Custom',
        description: 'Complete video production',
        base_price: 9999,
        max_video_length: 60,
        max_file_size: 5000,
        max_revisions: -1,
        estimated_delivery_days: 7,
        features: [
          { name: 'Cinema-quality grading', included: true },
          { name: 'Advanced VFX', included: true },
          { name: 'Professional sound design', included: true },
          { name: 'Unlimited revisions', included: true }
        ],
        editing_options: { color_grading: true, transitions: true, sound_design: true, motion_graphics: true, subtitles: true, custom_effects: true },
        is_active: true
      }
    ]);
    console.log(`✅ Created ${packagesData.length} packages\n`);

    // 3. Create Editors
    console.log('📌 Creating Editors...');
    const editors = [];
    for (let i = 1; i <= 8; i++) {
      const editor = await User.create({
        name: `Editor ${randomElement(names)}`,
        email: `editor${i}@videoedit.com`,
        password: hashedPassword,
        role: 'editor',
        phone: `+1${randomNumber(2000000000, 9999999999)}`,
        is_verified: true,
        skills: [randomElement(['color_grading', 'motion_graphics', 'sound_design', 'video_effects'])],
        software_expertise: ['Adobe Premiere Pro', 'After Effects'],
        portfolio_url: `https://portfolio.example.com/editor${i}`,
        bio: `Professional video editor with ${randomNumber(3, 10)} years of experience.`,
        hourly_rate: randomNumber(500, 2000),
        application_status: 'approved',
        isAvailable: i <= 5,
        completed_projects: randomNumber(10, 50),
        total_earnings: randomNumber(50000, 200000),
        average_rating: (4 + Math.random()).toFixed(1)
      });
      editors.push(editor);
    }
    console.log(`✅ Created ${editors.length} editors\n`);

    // 4. Create Customers
    console.log('📌 Creating Customers...');
    const customers = [];
    for (let i = 1; i <= 15; i++) {
      const customer = await User.create({
        name: randomElement(names),
        email: `customer${i}@testcustomer.com`,
        password: hashedPassword,
        role: 'customer',
        phone: `+1${randomNumber(2000000000, 9999999999)}`,
        is_verified: true
      });
      customers.push(customer);
    }
    console.log(`✅ Created ${customers.length} customers\n`);

    // 5. Create Uploads & Projects
    console.log('📌 Creating Projects with Uploads...');
    const allProjects = [];
    const statuses = ['completed', 'completed', 'ready_for_review', 'in_progress', 'assigned', 'pending_assignment'];
    
    for (let i = 0; i < 12; i++) {
      const customer = customers[i % customers.length];
      const pkg = packagesData[i % packagesData.length];
      const editor = i < 10 ? editors[i % editors.length] : null;
      const status = randomElement(statuses);
      
      // Create upload
      const upload = await Upload.create({
        uploaded_by: customer._id,
        resource_type: 'video',
        original_filename: `raw_footage_${randomNumber(1000, 9999)}.mp4`,
        url: `https://res.cloudinary.com/demo/video/upload/sample_${i}.mp4`,
        public_id: `uploads/sample_${randomNumber(10000, 99999)}`,
        file_size: randomNumber(50000000, 500000000),
        mime_type: 'video/mp4',
        status: 'active'
      });

      // Create project
      const createdAt = randomDate(new Date(2024, 0, 1), new Date());
      const project = await Project.create({
        user_id: customer._id,
        editor_id: editor?._id,
        title: `${randomElement(projects)} - ${i + 1}`,
        description: 'Professional video editing with attention to detail.',
        package_type: pkg.name,
        editing_instructions: 'Please add smooth transitions and enhance colors.',
        special_requirements: [],
        status: status,
        raw_footage: [{
          upload_id: upload._id,
          filename: upload.original_filename,
          size: upload.file_size,
          uploaded_at: createdAt
        }],
        deadline: new Date(createdAt.getTime() + pkg.estimated_delivery_days * 24 * 60 * 60 * 1000),
        estimated_delivery: new Date(createdAt.getTime() + pkg.estimated_delivery_days * 24 * 60 * 60 * 1000),
        actual_delivery: status === 'completed' ? new Date(createdAt.getTime() + (pkg.estimated_delivery_days - 1) * 24 * 60 * 60 * 1000) : undefined,
        payment_status: status === 'completed' ? 'completed' : (Math.random() > 0.5 ? 'completed' : 'pending'),
        total_amount: pkg.base_price,
        paid_amount: status === 'completed' ? pkg.base_price : (Math.random() > 0.5 ? pkg.base_price : 0),
        editor_fee: Math.floor(pkg.base_price * 0.7),
        editor_payment_status: status === 'completed' ? 'paid' : 'pending',
        revisions_used: status === 'completed' ? randomNumber(0, 2) : 0,
        rating: status === 'completed' ? randomNumber(4, 5) : undefined,
        review_comment: status === 'completed' ? 'Excellent work! Very professional.' : undefined
      });

      // Add edited video for completed projects
      if (status === 'completed' || status === 'ready_for_review') {
        project.edited_video = {
          upload_id: upload._id,
          filename: `edited_${upload.original_filename}`,
          size: upload.file_size,
          uploaded_at: new Date(),
          version: 1
        };
        await project.save();
      }

      allProjects.push(project);
    }
    console.log(`✅ Created ${allProjects.length} projects\n`);

    // 6. Create Payments
    console.log('📌 Creating Payments...');
    const payments = [];
    for (const project of allProjects.filter(p => p.paid_amount > 0)) {
      const payment = await Payment.create({
        user_id: project.user_id,
        project_id: project._id,
        amount: project.total_amount,
        currency: 'INR',
        payment_type: 'full',
        payment_gateway: randomElement(['razorpay', 'stripe', 'paypal']),
        transaction_id: `TXN${randomNumber(100000, 999999)}`,
        gateway_order_id: `ORDER${randomNumber(100000, 999999)}`,
        gateway_payment_id: `PAY${randomNumber(100000, 999999)}`,
        status: 'completed',
        paid_at: project.actual_delivery || new Date()
      });
      payments.push(payment);
    }
    console.log(`✅ Created ${payments.length} payments\n`);

    // 7. Create Payouts
    console.log('📌 Creating Payouts...');
    const payouts = [];
    for (const project of allProjects.filter(p => p.status === 'completed' && p.editor_id).slice(0, 5)) {
      const periodStart = new Date(project.actual_delivery);
      periodStart.setDate(1);
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0);
      
      const payout = await Payout.create({
        editor_id: project.editor_id,
        projects: [{
          project_id: project._id,
          amount: project.editor_fee,
          completed_at: project.actual_delivery
        }],
        total_amount: project.editor_fee,
        currency: 'INR',
        period_start: periodStart,
        period_end: periodEnd,
        payment_method: 'bank_transfer',
        account_details: {
          account_number: `${randomNumber(100000000000, 999999999999)}`,
          ifsc_code: `SBIN0001234`,
          account_holder_name: 'Editor Account'
        },
        status: randomElement(['pending', 'processing', 'completed']),
        processed_at: Math.random() > 0.5 ? new Date() : undefined
      });
      payouts.push(payout);
    }
    console.log(`✅ Created ${payouts.length} payouts\n`);

    // 8. Create Messages
    console.log('📌 Creating Messages...');
    const messages = [];
    for (const project of allProjects.filter(p => p.editor_id).slice(0, 8)) {
      const msg = await Message.create({
        project_id: project._id,
        sender_id: project.user_id,
        receiver_id: project.editor_id,
        content: 'Looking forward to seeing the draft!',
        is_read: Math.random() > 0.5
      });
      messages.push(msg);
    }
    console.log(`✅ Created ${messages.length} messages\n`);

    // 9. Create Notifications
    console.log('📌 Creating Notifications...');
    const notifications = [];
    for (const project of allProjects.slice(0, 10)) {
      const notif = await Notification.create({
        user_id: project.user_id,
        type: 'project_assigned',
        title: 'Project Update',
        message: 'Your project has been assigned to an editor!',
        related_project_id: project._id,
        is_read: Math.random() > 0.5
      });
      notifications.push(notif);
    }
    console.log(`✅ Created ${notifications.length} notifications\n`);

    // Summary
    console.log('='.repeat(60));
    console.log('\n🎉 DATABASE SEEDING COMPLETED!\n');
    console.log('📊 Summary:');
    console.log(`   ✓ Admin: 1`);
    console.log(`   ✓ Editors: ${editors.length}`);
    console.log(`   ✓ Customers: ${customers.length}`);
    console.log(`   ✓ Packages: ${packagesData.length}`);
    console.log(`   ✓ Projects: ${allProjects.length}`);
    console.log(`   ✓ Payments: ${payments.length}`);
    console.log(`   ✓ Payouts: ${payouts.length}`);
    console.log(`   ✓ Messages: ${messages.length}`);
    console.log(`   ✓ Notifications: ${notifications.length}`);
    console.log('\n📝 Login Credentials:');
    console.log(`   Admin: admin@videoedit.com / Admin@123`);
    console.log(`   Editors: editor1@videoedit.com to editor8@videoedit.com / Admin@123`);
    console.log(`   Customers: customer1@testcustomer.com to customer15@testcustomer.com / Admin@123`);
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Seeding Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
    process.exit(0);
  }
};

// Run the seeder
seedDatabase();
