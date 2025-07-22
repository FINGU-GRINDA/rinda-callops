const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('Private Key (first 50 chars):', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

const demoAccounts = [
  { email: 'demo@rindacallops.com', password: 'demo123', displayName: 'Demo User' },
  { email: 'demo2@rindacallops.com', password: 'demo123', displayName: 'Demo User 2' },
  { email: 'demo3@rindacallops.com', password: 'demo123', displayName: 'Demo User 3' },
  { email: 'demo4@rindacallops.com', password: 'demo123', displayName: 'Demo User 4' },
  { email: 'demo5@rindacallops.com', password: 'demo123', displayName: 'Demo User 5' },
];

async function createDemoAccounts() {
  console.log('Creating demo accounts...');
  
  for (const account of demoAccounts) {
    try {
      // Check if user already exists
      let user;
      try {
        user = await auth.getUserByEmail(account.email);
        console.log(`✓ User ${account.email} already exists`);
      } catch (error) {
        // User doesn't exist, create them
        user = await auth.createUser({
          email: account.email,
          password: account.password,
          displayName: account.displayName,
          emailVerified: true,
        });
        console.log(`✓ Created user ${account.email} with ID: ${user.uid}`);
      }

      // Create user document in Firestore
      const userDoc = {
        email: account.email,
        displayName: account.displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('users').doc(user.uid).set(userDoc, { merge: true });
      console.log(`✓ Created user document for ${account.email}`);

    } catch (error) {
      console.error(`✗ Error creating user ${account.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 Demo accounts setup complete!');
  console.log('\nYou can now sign in with:');
  demoAccounts.forEach(account => {
    console.log(`  Email: ${account.email} | Password: ${account.password}`);
  });
  
  process.exit(0);
}

createDemoAccounts().catch(console.error);