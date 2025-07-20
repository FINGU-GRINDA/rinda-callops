#!/usr/bin/env tsx
/**
 * Generate TypeScript API client from FastAPI OpenAPI spec
 * Uses @hey-api/openapi-ts for modern TypeScript generation
 */

import { createClient } from '@hey-api/openapi-ts';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
const OUTPUT_DIR = join(process.cwd(), 'src', 'lib', 'api');

async function generateApiClient() {
  try {
    console.log(`🔍 Fetching OpenAPI spec from ${SERVER_URL}...`);
    
    // Ensure output directory exists
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
    }
    
    // Generate TypeScript client
    await createClient({
      input: `${SERVER_URL}/openapi.json`,
      output: OUTPUT_DIR,
      plugins: [
        // Generate TypeScript types
        '@hey-api/typescript',
        // Generate fetch client
        '@hey-api/client-fetch',
      ],
    });
    
    console.log('✅ Generated TypeScript API client successfully!');
    console.log(`📝 Output directory: ${OUTPUT_DIR}`);
    console.log('');
    console.log('📋 Generated files:');
    console.log('  - types.gen.ts (TypeScript interfaces)');
    console.log('  - client.gen.ts (API client)');
    console.log('  - index.ts (exports)');
    console.log('');
    console.log('🚀 Usage example:');
    console.log('  import { client } from "@/lib/api";');
    console.log('  const agents = await client.GET("/api/agents");');
    
  } catch (error) {
    console.error('❌ Generation failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('');
        console.error('🔧 Make sure your FastAPI server is running:');
        console.error(`   cd /root/phone-ag/server && python -m uvicorn src.main:app --reload`);
        console.error(`   Server should be accessible at: ${SERVER_URL}`);
      } else if (error.message.includes('404')) {
        console.error('');
        console.error('🔧 OpenAPI spec not found. Verify FastAPI is serving OpenAPI at /openapi.json');
      }
    }
    
    process.exit(1);
  }
}

async function main() {
  console.log('🎯 FastAPI TypeScript API Client Generator');
  console.log('=========================================');
  console.log('');
  
  await generateApiClient();
}

if (require.main === module) {
  main();
}