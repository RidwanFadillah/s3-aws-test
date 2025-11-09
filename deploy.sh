#!/bin/bash

# CloudBox Deployment Script
# This script is executed on EC2 by GitHub Actions

set -e  # Exit on error

echo "======================================"
echo "🚀 CloudBox Deployment Started"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_DIR=~/s3-aws-test
APP_NAME="s3-uploader"

# Navigate to app directory
cd $APP_DIR

# Show current status
echo -e "${BLUE}📍 Current Directory:${NC} $(pwd)"
echo -e "${BLUE}📍 Current Branch:${NC} $(git branch --show-current)"
echo ""

# Pull latest code
echo -e "${YELLOW}🔄 Pulling latest code...${NC}"
git pull origin main
echo ""

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production
echo ""

# Check if PM2 process exists
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "${YELLOW}🔄 Restarting existing PM2 process...${NC}"
    pm2 restart $APP_NAME
else
    echo -e "${YELLOW}🚀 Starting new PM2 process...${NC}"
    pm2 start index.js --name "$APP_NAME"
fi
echo ""

# Save PM2 process list
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
echo ""

# Show status
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "======================================"
echo "📊 Application Status"
echo "======================================"
pm2 status
echo ""
pm2 logs $APP_NAME --lines 20 --nostream
echo ""
echo -e "${GREEN}🎉 CloudBox is now live!${NC}"
