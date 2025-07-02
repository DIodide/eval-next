import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Bucket configuration type
interface BucketOptions {
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
}

// Storage bucket names (matching STORAGE_BUCKETS from storage.ts)
const STORAGE_BUCKETS = {
  LEAGUES: 'league-assets',
  TRYOUTS: 'tryout-assets', 
  SCHOOLS: 'school-assets',
  PLAYERS: 'player-assets',
  COACHES: 'coach-assets'
} as const;

// Bucket configurations
const buckets = [
  {
    name: STORAGE_BUCKETS.LEAGUES,
    options: {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    }
  },
  {
    name: STORAGE_BUCKETS.TRYOUTS,
    options: {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    }
  },
  {
    name: STORAGE_BUCKETS.SCHOOLS,
    options: {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    }
  },
  {
    name: STORAGE_BUCKETS.PLAYERS,
    options: {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    }
  },
  {
    name: STORAGE_BUCKETS.COACHES,
    options: {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    }
  }
];

async function createStorageBucket(bucketName: string, options: BucketOptions) {
  try {
    console.log(`📦 Creating bucket: ${bucketName}`);
    
    const { data, error } = await supabase.storage.createBucket(bucketName, options);
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ✅ Bucket '${bucketName}' already exists`);
        return true;
      } else {
        console.error(`   ❌ Error creating bucket '${bucketName}':`, error.message);
        return false;
      }
    }
    
    console.log(`   ✅ Successfully created bucket '${bucketName}'`);
    return true;
  } catch (error) {
    console.error(`   ❌ Unexpected error creating bucket '${bucketName}':`, error);
    return false;
  }
}

async function createRLSPolicy(bucketName: string) {
  try {
    console.log(`🔒 Setting up RLS policies for ${bucketName}`);
    
    // Note: RLS policies need to be set up via SQL or Supabase Dashboard
    // These policies are designed for anonymous access with file-based permissions
    const policies = [
      {
        name: `${bucketName}_select_policy`,
        description: `Allow public read access to ${bucketName} bucket`,
        sql: `
          CREATE POLICY "${bucketName}_select_policy" ON storage.objects
          FOR SELECT USING (bucket_id = '${bucketName}');
        `
      },
      {
        name: `${bucketName}_insert_policy`, 
        description: `Allow anonymous users to upload to ${bucketName} bucket`,
        sql: `
          CREATE POLICY "${bucketName}_insert_policy" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = '${bucketName}');
        `
      },
      {
        name: `${bucketName}_update_policy`,
        description: `Allow anonymous users to update files in ${bucketName} bucket`,
        sql: `
          CREATE POLICY "${bucketName}_update_policy" ON storage.objects
          FOR UPDATE USING (bucket_id = '${bucketName}');
        `
      },
      {
        name: `${bucketName}_delete_policy`,
        description: `Allow anonymous users to delete files in ${bucketName} bucket`,
        sql: `
          CREATE POLICY "${bucketName}_delete_policy" ON storage.objects
          FOR DELETE USING (bucket_id = '${bucketName}');
        `
      }
    ];
    
    console.log(`   ⚠️  RLS policies need to be created manually in Supabase Dashboard`);
    console.log(`   📋 Copy and run these SQL commands in your Supabase SQL Editor:`);
    console.log(`   ---`);
    
    policies.forEach(policy => {
      console.log(`   -- ${policy.description}`);
      console.log(`   ${policy.sql.trim()}`);
      console.log(``);
    });
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error setting up RLS policies for ${bucketName}:`, error);
    return false;
  }
}

async function verifyBucketExists(bucketName: string) {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error) {
      console.log(`   ❌ Bucket '${bucketName}' verification failed:`, error.message);
      return false;
    }
    
    console.log(`   ✅ Bucket '${bucketName}' verified successfully`);
    return true;
  } catch (error) {
    console.error(`   ❌ Unexpected error verifying bucket '${bucketName}':`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase Storage Bucket Setup');
  console.log('==========================================');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using Service Role Key: ${supabaseServiceKey ? '✅ Present' : '❌ Missing'}`);
  console.log('');
  
  let successCount = 0;
  const totalBuckets = buckets.length;
  
  // Create all buckets
  for (const bucket of buckets) {
    const success = await createStorageBucket(bucket.name, bucket.options);
    if (success) successCount++;
    console.log('');
  }
  
  // Verify all buckets
  console.log('🔍 Verifying bucket creation...');
  for (const bucket of buckets) {
    await verifyBucketExists(bucket.name);
  }
  console.log('');
  
  // Display RLS policy instructions
  console.log('🔒 RLS Policy Setup Instructions');
  console.log('=================================');
  console.log('');
  console.log('⚠️  IMPORTANT: You need to manually set up RLS policies for security.');
  console.log('');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Run the following SQL commands for each bucket:');
  console.log('');
  
  for (const bucket of buckets) {
    await createRLSPolicy(bucket.name);
    console.log('');
  }
  
  // Summary
  console.log('📊 Setup Summary');
  console.log('================');
  console.log(`✅ Successfully created/verified: ${successCount}/${totalBuckets} buckets`);
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. Run the RLS policy SQL commands shown above');
  console.log('2. Test file uploads in your application');
  console.log('3. Verify bucket permissions are working correctly');
  console.log('');
  console.log('🎉 Storage setup complete!');
  
  if (successCount === totalBuckets) {
    process.exit(0);
  } else {
    console.log('⚠️  Some buckets failed to create. Please check the errors above.');
    process.exit(1);
  }
}

// Run the setup
main().catch((error) => {
  console.error('❌ Fatal error during setup:', error);
  process.exit(1);
}); 