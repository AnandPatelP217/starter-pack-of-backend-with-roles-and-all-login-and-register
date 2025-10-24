/**
 * COMPREHENSIVE API FLOW TEST
 * Tests the complete video editing portal workflow
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let tokens = {};
let ids = {};

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logStep = (step, message) => {
  console.log('\n' + '='.repeat(60));
  log(`STEP ${step}: ${message}`, 'blue');
  console.log('='.repeat(60));
};

const logSuccess = (message) => log(`✓ ${message}`, 'green');
const logError = (message, error) => {
  log(`✗ ${message}`, 'red');
  if (error.response) {
    console.log('Status:', error.response.status);
    console.log('Data:', error.response.data);
  } else {
    console.log('Error:', error.message);
  }
};
const logInfo = (message) => log(`ℹ ${message}`, 'yellow');

// Helper function for API calls
const api = async (method, endpoint, data = null, token = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  };
  
  if (data) {
    config.data = data;
  }
  
  return await axios(config);
};

async function runTests() {
  try {
    log('\n🚀 STARTING COMPREHENSIVE BACKEND TEST', 'magenta');
    log('Testing Video Editing Portal API Flow\n', 'magenta');

    // ============================================
    // STEP 1: LOGIN AS ADMIN
    // ============================================
    logStep(1, 'LOGIN AS ADMIN');
    try {
      const adminCredentials = {
        email: 'admin@abc.com',
        password: 'Anand@123'
      };
      
      const loginRes = await api('post', '/auth/login', adminCredentials);
      tokens.admin = loginRes.data.data.token;
      ids.admin = loginRes.data.data.user.id || loginRes.data.data.user._id;
      
      logSuccess('Admin logged in successfully');
      logInfo(`Admin ID: ${ids.admin}`);
      logInfo(`Admin Email: ${adminCredentials.email}`);
      logInfo(`Admin Name: ${loginRes.data.data.user.name}`);
    } catch (error) {
      logError('Admin login failed', error);
      throw error;
    }

    // ============================================
    // STEP 2: ADMIN CREATES EDITOR ACCOUNT
    // ============================================
    logStep(2, 'ADMIN CREATES EDITOR ACCOUNT');
    try {
      const editorData = {
        name: 'John Editor',
        email: `editor_${Date.now()}@test.com`,
        password: 'Editor@123',
        skills: ['color_grading', 'motion_graphics', 'sound_design'],
        isAvailable: true
      };
      
      const registerRes = await api('post', '/auth/signup/editor', editorData, tokens.admin);
      ids.editorEmail = editorData.email;
      ids.editorPassword = editorData.password;
      
      logSuccess('Editor account created successfully');
      logInfo(`Editor Email: ${editorData.email}`);
      logInfo(registerRes.data.message);
    } catch (error) {
      logError('Editor creation failed', error);
      throw error;
    }

    // ============================================
    // STEP 2B: EDITOR LOGIN TO GET ID AND TOKEN
    // ============================================
    logStep('2B', 'EDITOR LOGIN');
    try {
      const loginRes = await api('post', '/auth/login', {
        email: ids.editorEmail,
        password: ids.editorPassword
      });
      tokens.editor = loginRes.data.data.token;
      ids.editor = loginRes.data.data.user.id || loginRes.data.data.user._id;
      
      logSuccess('Editor logged in successfully');
      logInfo(`Editor ID: ${ids.editor}`);
    } catch (error) {
      logError('Editor login failed', error);
      throw error;
    }

    // ============================================
    // STEP 3: CUSTOMER SELF REGISTRATION
    // ============================================
    logStep(3, 'CUSTOMER SELF REGISTRATION');
    try {
      const customerData = {
        name: 'Jane Customer',
        email: `customer_${Date.now()}@test.com`,
        password: 'Customer@123',
        contact: '+919876543210',
        address: 'Mumbai, India'
      };
      
      const registerRes = await api('post', '/auth/signup/customer', customerData);
      ids.customerEmail = customerData.email;
      ids.customerPassword = customerData.password;
      
      logSuccess('Customer registered successfully');
      logInfo(`Customer Email: ${customerData.email}`);
      logInfo(registerRes.data.message);
    } catch (error) {
      logError('Customer registration failed', error);
      throw error;
    }

    // ============================================
    // STEP 3B: CUSTOMER LOGIN
    // ============================================
    logStep('3B', 'CUSTOMER LOGIN');
    try {
      const loginRes = await api('post', '/auth/login', {
        email: ids.customerEmail,
        password: ids.customerPassword
      });
      tokens.customer = loginRes.data.data.token;
      ids.customer = loginRes.data.data.user.id || loginRes.data.data.user._id;
      
      logSuccess('Customer logged in successfully');
      logInfo(`Customer ID: ${ids.customer}`);
    } catch (error) {
      logError('Customer login failed', error);
      throw error;
    }

    // ============================================
    // STEP 4: ADMIN APPROVES EDITOR
    // ============================================
    logStep(4, 'ADMIN APPROVES EDITOR');
    try {
      const approveRes = await api('post', `/admin/editors/${ids.editor}/approve`, null, tokens.admin);
      
      logSuccess('Editor approved successfully');
      logInfo(`Editor status: ${approveRes.data.data.application_status}`);
      logInfo(`Editor available: ${approveRes.data.data.is_available}`);
    } catch (error) {
      logError('Editor approval failed', error);
      throw error;
    }

    // ============================================
    // STEP 5: CREATE PACKAGES (ADMIN)
    // ============================================
    logStep(5, 'CREATE PACKAGES');
    try {
      const packages = [
        {
          name: 'basic',
          display_name: 'Basic Package',
          description: 'Perfect for simple edits and quick turnaround projects',
          base_price: 1999,
          price_per_minute: 50,
          estimated_delivery_days: 3,
          max_revisions: 2,
          max_video_length: 10,
          max_file_size: 500,
          editing_options: {
            color_grading: true,
            transitions: true,
            sound_design: false,
            motion_graphics: false
          },
          features: [
            { name: 'Color Correction', included: true },
            { name: 'Basic Transitions', included: true },
            { name: 'Audio Sync', included: true }
          ]
        },
        {
          name: 'advanced',
          display_name: 'Advanced Package',
          description: 'For professional quality edits with advanced features',
          base_price: 4999,
          price_per_minute: 100,
          estimated_delivery_days: 5,
          max_revisions: 4,
          max_video_length: 30,
          max_file_size: 2000,
          priority_support: true,
          editing_options: {
            color_grading: true,
            transitions: true,
            sound_design: true,
            motion_graphics: true,
            subtitles: true
          },
          features: [
            { name: 'Professional Color Grading', included: true },
            { name: 'Advanced Effects', included: true },
            { name: 'Motion Graphics', included: true },
            { name: 'Sound Design', included: true }
          ]
        }
      ];

      for (const pkg of packages) {
        try {
          const pkgRes = await api('post', '/packages', pkg, tokens.admin);
          ids[`package_${pkg.name}`] = pkgRes.data.data._id || pkgRes.data.data.id;
          logSuccess(`${pkg.display_name} created`);
        } catch (error) {
          if (error.response && error.response.status === 400 && error.response.data.message.includes('already exists')) {
            logInfo(`${pkg.display_name} already exists (skipping)`);
            // Fetch existing package ID
            const allPackages = await api('get', '/packages', null, tokens.admin);
            const packagesList = allPackages.data.data.packages || allPackages.data.data;
            let existing = null;
            if (Array.isArray(packagesList)) {
              existing = packagesList.find(p => p.name === pkg.name);
            }
            if (existing) {
              ids[`package_${pkg.name}`] = existing._id || existing.id;
            }
          } else {
            throw error;
          }
        }
      }
      logSuccess('Packages ready for testing');
    } catch (error) {
      logError('Package setup failed', error);
      throw error;
    }

    // ============================================
    // STEP 6: GET ALL PACKAGES (CUSTOMER)
    // ============================================
    logStep(6, 'CUSTOMER VIEWS PACKAGES');
    try {
      const packagesRes = await api('get', '/packages', null, tokens.customer);
      
      const packages = packagesRes.data.data.packages || packagesRes.data.data;
      const count = Array.isArray(packages) ? packages.length : (packagesRes.data.data.total || 0);
      
      logSuccess(`Retrieved ${count} packages`);
      
      if (Array.isArray(packages)) {
        packages.slice(0, 5).forEach(pkg => {
          logInfo(`  - ${pkg.display_name}: ₹${pkg.base_price}`);
        });
      }
    } catch (error) {
      logError('Failed to get packages', error);
      throw error;
    }

    // ============================================
    // STEP 7: CUSTOMER CREATES PROJECT
    // ============================================
    logStep(7, 'CUSTOMER CREATES PROJECT');
    try {
      const projectData = {
        title: 'Corporate Video Editing',
        description: 'Need professional editing for our company presentation video',
        package_type: 'advanced',
        editing_instructions: 'Please add smooth transitions and corporate music',
        special_requirements: ['Background music', 'Company logo overlay']
        // raw_footage will be added later via upload endpoint
      };
      
      const projectRes = await api('post', '/projects', projectData, tokens.customer);
      
      const projectResponse = projectRes.data.data || projectRes.data;
      ids.project = projectResponse._id || projectResponse.id;
      
      logSuccess('Project created successfully');
      logInfo(`Project ID: ${ids.project}`);
      logInfo(`Project Status: ${projectResponse.status}`);
    } catch (error) {
      logError('Project creation failed', error);
      throw error;
    }

    // ============================================
    // STEP 8: ADMIN VIEWS UNASSIGNED PROJECTS
    // ============================================
    logStep(8, 'ADMIN VIEWS UNASSIGNED PROJECTS');
    try {
      const unassignedRes = await api('get', '/projects/unassigned', null, tokens.admin);
      
      logSuccess(`Found ${unassignedRes.data.data.length} unassigned projects`);
    } catch (error) {
      logError('Failed to get unassigned projects', error);
      throw error;
    }

    // ============================================
    // STEP 9: ADMIN ASSIGNS EDITOR TO PROJECT
    // ============================================
    logStep(9, 'ADMIN ASSIGNS EDITOR TO PROJECT');
    try {
      const assignData = {
        editor_id: ids.editor
      };
      
      const assignRes = await api('post', `/projects/${ids.project}/assign`, assignData, tokens.admin);
      
      logSuccess('Editor assigned to project');
      logInfo(`Project Status: ${assignRes.data.data.status}`);
      logInfo(`Assigned Editor: ${assignRes.data.data.editor_id.name}`);
    } catch (error) {
      logError('Editor assignment failed', error);
      throw error;
    }

    // ============================================
    // STEP 10: EDITOR VIEWS THEIR PROJECTS
    // ============================================
    logStep(10, 'EDITOR VIEWS ASSIGNED PROJECTS');
    try {
      const editorProjectsRes = await api('get', '/projects/editor/projects', null, tokens.editor);
      
      logSuccess(`Editor has ${editorProjectsRes.data.data.length} projects`);
      editorProjectsRes.data.data.forEach(proj => {
        logInfo(`  - ${proj.title} [${proj.status}]`);
      });
    } catch (error) {
      logError('Failed to get editor projects', error);
      throw error;
    }

    // ============================================
    // STEP 11: EDITOR STARTS WORKING (STATUS UPDATE)
    // ============================================
    logStep(11, 'EDITOR STARTS WORKING ON PROJECT');
    try {
      const statusData = {
        status: 'in_progress'
      };
      
      const statusRes = await api('put', `/projects/${ids.project}/status`, statusData, tokens.editor);
      
      logSuccess('Project status updated to in_progress');
      logInfo(`Status: ${statusRes.data.data.status}`);
    } catch (error) {
      logError('Status update failed', error);
      throw error;
    }

    // ============================================
    // STEP 12: EDITOR UPLOADS DRAFT
    // ============================================
    logStep(12, 'EDITOR UPLOADS DRAFT VIDEO');
    try {
      const draftData = {
        videoData: {
          filename: 'draft_video.mp4',
          size: 45000000,
          url: 'https://cloudinary.com/draft_video.mp4',
          public_id: 'draft_456'
        }
      };
      
      const draftRes = await api('post', `/projects/${ids.project}/draft`, draftData, tokens.editor);
      
      logSuccess('Draft video uploaded');
      logInfo(`Project Status: ${draftRes.data.data.status}`);
    } catch (error) {
      logError('Draft upload failed', error);
      throw error;
    }

    // ============================================
    // STEP 13: CUSTOMER VIEWS PROJECT
    // ============================================
    logStep(13, 'CUSTOMER VIEWS PROJECT STATUS');
    try {
      const projectRes = await api('get', `/projects/${ids.project}`, null, tokens.customer);
      
      logSuccess('Project details retrieved');
      logInfo(`Title: ${projectRes.data.data.title}`);
      logInfo(`Status: ${projectRes.data.data.status}`);
      logInfo(`Editor: ${projectRes.data.data.editor_id.name}`);
    } catch (error) {
      logError('Failed to get project', error);
      throw error;
    }

    // ============================================
    // STEP 14: CUSTOMER REQUESTS REVISION
    // ============================================
    logStep(14, 'CUSTOMER REQUESTS REVISION');
    try {
      const revisionData = {
        feedback: 'Please add more transitions between scenes and increase the background music volume'
      };
      
      const revisionRes = await api('post', `/projects/${ids.project}/revision`, revisionData, tokens.customer);
      
      logSuccess('Revision requested');
      logInfo(`Revisions used: ${revisionRes.data.data.revisions.length}/${revisionRes.data.data.max_revisions}`);
    } catch (error) {
      logError('Revision request failed', error);
      throw error;
    }

    // ============================================
    // STEP 15: EDITOR UPLOADS FINAL VIDEO
    // ============================================
    logStep(15, 'EDITOR UPLOADS EDITED VIDEO');
    try {
      const editedVideoData = {
        filename: 'final_video.mp4',
        size: 48000000,
        url: 'https://cloudinary.com/final_video.mp4',
        public_id: 'final_789',
        duration: 180
      };
      
      const uploadRes = await api('post', `/projects/${ids.project}/edited-video`, editedVideoData, tokens.editor);
      
      logSuccess('Final video uploaded');
      logInfo(`Project Status: ${uploadRes.data.data.status}`);
    } catch (error) {
      logError('Video upload failed', error);
      throw error;
    }

    // ============================================
    // STEP 16: EDITOR MARKS PROJECT AS FINAL
    // ============================================
    logStep(16, 'EDITOR MARKS PROJECT AS FINAL');
    try {
      const finalRes = await api('patch', `/projects/${ids.project}/mark-final`, null, tokens.editor);
      
      logSuccess('Project marked as final');
      logInfo(`Project Status: ${finalRes.data.data.status}`);
      logInfo(`Payment will be released to editor`);
    } catch (error) {
      logError('Mark as final failed', error);
      throw error;
    }

    // ============================================
    // STEP 17: CUSTOMER ADDS RATING
    // ============================================
    logStep(17, 'CUSTOMER RATES THE PROJECT');
    try {
      const ratingData = {
        rating: 5,
        feedback: 'Excellent work! Very professional editing and quick delivery.'
      };
      
      const ratingRes = await api('post', `/projects/${ids.project}/rating`, ratingData, tokens.customer);
      
      logSuccess('Rating submitted');
      logInfo(`Rating: ${ratingRes.data.data.rating}/5`);
    } catch (error) {
      logError('Rating submission failed', error);
      throw error;
    }

    // ============================================
    // STEP 18: CREATE PAYMENT
    // ============================================
    logStep(18, 'CUSTOMER INITIATES PAYMENT');
    try {
      const paymentData = {
        project_id: ids.project,
        payment_type: 'full',
        payment_gateway: 'razorpay'
      };
      
      const paymentRes = await api('post', '/payments/initiate', paymentData, tokens.customer);
      ids.payment = paymentRes.data.data._id || paymentRes.data.data.id;
      
      logSuccess('Payment initiated');
      logInfo(`Payment ID: ${ids.payment}`);
      logInfo(`Status: ${paymentRes.data.data.status}`);
    } catch (error) {
      logError('Payment initiation failed', error);
      throw error;
    }

    // ============================================
    // STEP 19: VERIFY PAYMENT (SIMULATE WEBHOOK)
    // ============================================
    logStep(19, 'VERIFY PAYMENT');
    try {
      const verifyData = {
        transaction_id: 'pay_mock_' + Date.now(),
        payment_gateway: 'razorpay'
      };
      
      const verifyRes = await api('post', `/payments/${ids.payment}/verify`, verifyData, tokens.customer);
      
      logSuccess('Payment verified');
      logInfo(`Payment Status: ${verifyRes.data.data.status}`);
    } catch (error) {
      logError('Payment verification failed', error);
      throw error;
    }

    // ============================================
    // STEP 20: ADMIN VIEWS DASHBOARD
    // ============================================
    logStep(20, 'ADMIN VIEWS DASHBOARD ANALYTICS');
    try {
      const dashboardRes = await api('get', '/admin/dashboard?period=month', null, tokens.admin);
      
      logSuccess('Dashboard analytics retrieved');
      logInfo(`Total Users: ${dashboardRes.data.data.users.total}`);
      logInfo(`Total Editors: ${dashboardRes.data.data.editors.total}`);
      logInfo(`Total Projects: ${dashboardRes.data.data.projects.total}`);
      logInfo(`Total Revenue: ₹${dashboardRes.data.data.revenue.total}`);
    } catch (error) {
      logError('Dashboard retrieval failed', error);
      throw error;
    }

    // ============================================
    // STEP 21: ADMIN VIEWS PLATFORM STATS
    // ============================================
    logStep(21, 'ADMIN VIEWS PLATFORM STATISTICS');
    try {
      const statsRes = await api('get', '/admin/stats', null, tokens.admin);
      
      logSuccess('Platform statistics retrieved');
      const stats = statsRes.data.data;
      logInfo(`Total Users: ${stats.total_users}`);
      logInfo(`Active Projects: ${stats.active_projects}`);
      logInfo(`Completed Projects: ${stats.completed_projects}`);
    } catch (error) {
      logError('Stats retrieval failed', error);
      throw error;
    }

    // ============================================
    // STEP 22: ADMIN CREATES PAYOUT FOR EDITOR
    // ============================================
    logStep(22, 'ADMIN CREATES PAYOUT FOR EDITOR');
    try {
      const payoutData = {
        editor_id: ids.editor,
        amount: 3500,
        project_ids: [ids.project],
        payment_method: 'bank_transfer'
      };
      
      const payoutRes = await api('post', '/payouts', payoutData, tokens.admin);
      ids.payout = payoutRes.data.data._id || payoutRes.data.data.id;
      
      logSuccess('Payout created');
      logInfo(`Payout ID: ${ids.payout}`);
      logInfo(`Amount: ₹${payoutRes.data.data.amount}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('bank details')) {
        logInfo('Payout creation skipped (bank details not configured)');
        ids.payout = null;
      } else {
        logError('Payout creation failed', error);
        throw error;
      }
    }

    // ============================================
    // STEP 23: ADMIN PROCESSES PAYOUT
    // ============================================
    logStep(23, 'ADMIN PROCESSES PAYOUT');
    try {
      if (!ids.payout) {
        logInfo('Payout processing skipped (no payout created)');
      } else {
        const processData = {
          transaction_id: 'txn_' + Date.now(),
          transaction_date: new Date()
        };
        
        const processRes = await api('patch', `/payouts/${ids.payout}/process`, processData, tokens.admin);
        
        logSuccess('Payout processed');
        logInfo(`Status: ${processRes.data.data.status}`);
      }
    } catch (error) {
      logError('Payout processing failed', error);
      throw error;
    }

    // ============================================
    // STEP 24: EDITOR VIEWS EARNINGS
    // ============================================
    logStep(24, 'EDITOR VIEWS EARNINGS HISTORY');
    try {
      const earningsRes = await api('get', '/payouts/my-earnings', null, tokens.editor);
      
      logSuccess('Earnings retrieved');
      logInfo(`Total Earnings: ₹${earningsRes.data.data.total_earnings || 0}`);
      logInfo(`Pending: ₹${earningsRes.data.data.pending || 0}`);
      logInfo(`Completed: ₹${earningsRes.data.data.completed || 0}`);
    } catch (error) {
      logError('Earnings retrieval failed', error);
      throw error;
    }

    // ============================================
    // STEP 25: SEND MESSAGE BETWEEN CUSTOMER AND EDITOR
    // ============================================
    logStep(25, 'CUSTOMER SENDS MESSAGE TO EDITOR');
    try {
      const messageData = {
        project_id: ids.project,
        receiver_id: ids.editor,
        content: 'Thank you for the excellent work! Looking forward to working with you again.',
        message_type: 'text'
      };
      
      const messageRes = await api('post', '/messages', messageData, tokens.customer);
      ids.message = messageRes.data.data._id || messageRes.data.data.id;
      
      logSuccess('Message sent');
      logInfo(`Message ID: ${ids.message}`);
    } catch (error) {
      logError('Message sending failed', error);
      throw error;
    }

    // ============================================
    // STEP 26: EDITOR VIEWS MESSAGES
    // ============================================
    logStep(26, 'EDITOR VIEWS MESSAGES');
    try {
      const messagesRes = await api('get', `/messages/project/${ids.project}`, null, tokens.editor);
      
      logSuccess(`Retrieved ${messagesRes.data.data.length} messages`);
    } catch (error) {
      logError('Message retrieval failed', error);
      throw error;
    }

    // ============================================
    // STEP 27: VIEW NOTIFICATIONS
    // ============================================
    logStep(27, 'VIEW NOTIFICATIONS');
    try {
      // Customer notifications
      const customerNotifs = await api('get', '/notifications', null, tokens.customer);
      logSuccess(`Customer has ${customerNotifs.data.data.length} notifications`);
      
      // Editor notifications
      const editorNotifs = await api('get', '/notifications', null, tokens.editor);
      logSuccess(`Editor has ${editorNotifs.data.data.length} notifications`);
    } catch (error) {
      logError('Notification retrieval failed', error);
      throw error;
    }

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    log('🎉 ALL TESTS COMPLETED SUCCESSFULLY! 🎉', 'green');
    console.log('='.repeat(60));
    
    console.log('\n📊 TEST SUMMARY:');
    logSuccess('✓ User Registration (Admin, Editor, Customer)');
    logSuccess('✓ Editor Approval Workflow');
    logSuccess('✓ Package Management');
    logSuccess('✓ Project Creation & Assignment');
    logSuccess('✓ Editor Workflow (Draft, Final Upload)');
    logSuccess('✓ Customer Revision Requests');
    logSuccess('✓ Rating & Feedback System');
    logSuccess('✓ Payment Processing');
    logSuccess('✓ Payout Management');
    logSuccess('✓ Messaging System');
    logSuccess('✓ Notification System');
    logSuccess('✓ Admin Dashboard & Analytics');
    
    console.log('\n📝 CREATED ENTITIES:');
    console.log('IDs:', JSON.stringify(ids, null, 2));
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log('❌ TEST FAILED', 'red');
    console.log('='.repeat(60));
    console.error('\nError Details:', error.message);
    process.exit(1);
  }
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/');
    log('✓ Server is running', 'green');
    return true;
  } catch (error) {
    log('✗ Server is not running. Please start the server first.', 'red');
    log('Run: node src/server.js', 'yellow');
    return false;
  }
}

// Main execution
(async () => {
  log('\n🔍 Checking server status...', 'blue');
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
})();
