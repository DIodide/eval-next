#!/bin/bash

# Clerk Users Reset Script for Development
# This script deletes all Clerk users and associated database records

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}👥 Clerk Users Reset Script${NC}"
echo -e "${YELLOW}⚠️  This will delete ALL Clerk users and their data!${NC}"
echo -e "${YELLOW}⚠️  This action is IRREVERSIBLE!${NC}"
echo -e "${RED}⚠️  DEVELOPMENT ENVIRONMENT ONLY!${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

# Check NODE_ENV
if [ -f ".env" ]; then
    NODE_ENV=$(grep "^NODE_ENV=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ "$NODE_ENV" != "development" ]; then
        echo -e "${RED}❌ Error: This script only works in development environment${NC}"
        echo -e "${RED}   Current NODE_ENV: ${NODE_ENV}${NC}"
        echo -e "${YELLOW}   Set NODE_ENV=development in your .env file${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found. Proceeding with caution...${NC}"
fi

# Check for required environment variables
if [ -f ".env" ]; then
    if ! grep -q "^CLERK_SECRET_KEY=" .env; then
        echo -e "${RED}❌ Error: CLERK_SECRET_KEY not found in .env file${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Error: .env file required for Clerk configuration${NC}"
    exit 1
fi

# Ask for confirmation unless --force flag is used
if [ "$1" != "--force" ]; then
    echo -e "${RED}🚨 DANGER ZONE 🚨${NC}"
    echo -e "${YELLOW}This will permanently delete:${NC}"
    echo -e "${YELLOW}  • All Clerk user accounts${NC}"
    echo -e "${YELLOW}  • All player records${NC}"
    echo -e "${YELLOW}  • All coach records${NC}"
    echo -e "${YELLOW}  • All associated data${NC}"
    echo ""
    read -p "Type 'DELETE ALL USERS' to confirm: " -r
    echo
    if [ "$REPLY" != "DELETE ALL USERS" ]; then
        echo -e "${YELLOW}🚫 User deletion cancelled${NC}"
        exit 0
    fi
    
    echo ""
    read -p "Are you absolutely sure? This cannot be undone! (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🚫 User deletion cancelled${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}🔄 Starting Clerk users deletion...${NC}"

# Run the TypeScript script that does the actual work
echo -e "${YELLOW}🗑️  Executing user deletion script...${NC}"
if npx tsx scripts/clerk-users-reset.ts; then
    echo ""
    echo -e "${GREEN}✅ All Clerk users deleted successfully!${NC}"
    echo -e "${BLUE}💡 You may want to reset your database as well: npm run db:reset:script${NC}"
else
    echo ""
    echo -e "${RED}❌ Error occurred during user deletion${NC}"
    exit 1
fi

echo "" 