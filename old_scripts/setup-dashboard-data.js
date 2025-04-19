// Setup script for initializing all dashboard data in Firestore
const { spawn } = require('child_process');
const path = require('path');

// Define the scripts to run in order
const scripts = [
  { name: 'Setup Feature Flags', path: path.join(__dirname, 'setup-feature-flags.js') },
  { name: 'Setup Analytics Events', path: path.join(__dirname, 'setup-analytics-events.js') }
];

// Get command line arguments
const args = process.argv.slice(2);
const forceFlag = args.includes('--force') ? ['--force'] : [];

// Run scripts sequentially
async function runScripts() {
  console.log('📊 MealFix Dashboard Data Setup 📊');
  console.log('==================================');
  
  for (const [index, script] of scripts.entries()) {
    console.log(`\n[${index + 1}/${scripts.length}] Running: ${script.name}...`);
    
    try {
      await runScript(script.path, forceFlag);
      console.log(`✅ ${script.name} completed successfully!`);
    } catch (error) {
      console.error(`❌ ${script.name} failed with error: ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log('\n🎉 All setup scripts completed successfully! 🎉');
  console.log('Your dashboard data is now ready to use.');
  console.log('\nTo view the dashboard:');
  console.log('1. Navigate to the dashboard directory: cd mealfix-dashboard');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Open your browser to: http://localhost:3000');
}

// Helper function to run a script as a child process
function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath, ...args], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Script exited with code ${code}`));
      } else {
        resolve();
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Run the main function
runScripts().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
}); 