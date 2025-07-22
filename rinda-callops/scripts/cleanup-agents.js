#!/usr/bin/env node

/**
 * Firebase Agent Cleanup Script
 * 
 * This script deletes all agents from Firebase that have invalid/old data structure.
 * Run this script to clean up agents that are causing validation errors.
 * 
 * Usage:
 *   node scripts/cleanup-agents.js
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
let app;
let db;

const hasFirebaseCredentials = process.env.FIREBASE_PROJECT_ID && 
                               process.env.FIREBASE_CLIENT_EMAIL && 
                               process.env.FIREBASE_PRIVATE_KEY;

if (!hasFirebaseCredentials) {
  console.error('❌ Missing Firebase credentials in .env.local');
  console.error('Required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

console.log('🔥 Initializing Firebase Admin...');

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} else {
  app = getApps()[0];
}

db = getFirestore(app);

async function cleanupAgents() {
  try {
    console.log('🔍 Fetching all agents from Firebase...');
    
    // Get all agents from Firebase
    const agentsRef = db.collection('agents');
    const snapshot = await agentsRef.get();
    
    if (snapshot.empty) {
      console.log('✅ No agents found in Firebase - nothing to clean up');
      return;
    }

    console.log(`📊 Found ${snapshot.size} agents in Firebase`);
    
    // Show agent details before deletion
    console.log('📋 Agents to be deleted:');
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name || 'Unnamed'} (${data.businessName || data.business_name || 'No business name'})`);
    });

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('\n⚠️  Are you sure you want to delete ALL agents? This cannot be undone. (yes/no): ', resolve);
    });
    
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Cleanup cancelled');
      return;
    }

    console.log('🗑️  Starting deletion...');

    // Delete all agents in batches (Firebase has a limit of 500 operations per batch)
    const batchSize = 500;
    const docs = snapshot.docs;
    let deletedCount = 0;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      await batch.commit();
      console.log(`✅ Deleted batch of ${batchDocs.length} agents (${deletedCount}/${docs.length} total)`);
    }

    console.log(`🎉 Successfully deleted ${deletedCount} agents from Firebase!`);
    console.log('✨ Database cleanup complete - you can now create new agents without validation errors');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupAgents()
  .then(() => {
    console.log('👋 Cleanup script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Cleanup script failed:', error);
    process.exit(1);
  });