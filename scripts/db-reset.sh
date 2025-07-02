#!/bin/bash

# Database Reset Script for Development
# This script resets the database and seeds it with initial data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Database Reset Script${NC}"
echo -e "${YELLOW}⚠️  This will completely reset your database!${NC}"
echo -e "${YELLOW}⚠️  All data will be lost!${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

# Ask for confirmation unless --force flag is used
if [ "$1" != "--force" ]; then
    read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🚫 Database reset cancelled${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}🔄 Resetting database and storage...${NC}"

# Reset storage buckets first
echo -e "${YELLOW}🗑️  Resetting storage buckets...${NC}"
npx tsx scripts/reset-storage-buckets.ts

# Wait a moment for storage reset to complete
sleep 2

# Setup storage buckets again
echo -e "${YELLOW}📦 Setting up storage buckets...${NC}"
npx tsx scripts/setup-storage-buckets.ts

# Wait a moment before database reset
sleep 2

# Reset database with migrations
echo -e "${YELLOW}📋 Running Prisma migrate reset...${NC}"
npx prisma migrate reset --force

# Wait a moment for connections to clear
echo -e "${YELLOW}⏳ Waiting for connections to clear...${NC}"
sleep 2

# Apply migrations to recreate tables
echo -e "${YELLOW}🏗️  Applying database migrations...${NC}"
npx prisma db push

# Wait a moment before generating client
sleep 1

# Generate Prisma client
echo -e "${YELLOW}⚙️  Generating Prisma client...${NC}"
npx prisma generate

# Wait before seeding
sleep 1

# Run seed script if it exists
if [ -f "prisma/seed.ts" ]; then
    echo -e "${YELLOW}🌱 Running database seed...${NC}"
    npx tsx prisma/seed.ts
else
    echo -e "${YELLOW}⚠️  No seed script found, skipping seed...${NC}"
fi

echo ""
echo -e "${GREEN}✅ Database reset completed successfully!${NC}"
echo -e "${BLUE}💡 You can now start your development server with: npm run dev${NC}"
echo "" 