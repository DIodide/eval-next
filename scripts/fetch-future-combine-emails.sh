#!/bin/bash

# Future Combine Registrations Email Fetcher
# Runs the TypeScript script to fetch emails of players registered for future combines

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Future Combine Registrations Email Fetcher${NC}"
echo -e "${BLUE}=============================================${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found in project root${NC}"
    echo -e "${YELLOW}⚠️  Please create a .env file with your database credentials${NC}"
    exit 1
fi

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo -e "${RED}❌ tsx is not installed${NC}"
    echo -e "${YELLOW}⚠️  Please install tsx: npm install -g tsx${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment checks passed${NC}"
echo

# Run the TypeScript script
echo -e "${BLUE}🔄 Running email fetch script...${NC}"
tsx scripts/fetch-future-combine-emails.ts

echo
echo -e "${GREEN}✅ Script completed${NC}" 