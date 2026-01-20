# GitHub Repository Setup Guide

## Step 1: Create Repository on GitHub

### Options to Choose:
- ✅ **Repository name**: `contract-management-platform` (or your preferred name)
- ✅ **Description**: "Full-stack Contract Management Platform with MERN stack"
- ✅ **Visibility**: **Public** (recommended for assignment)
- ❌ **DO NOT CHECK**: Add a README file (you already have one)
- ❌ **DO NOT CHECK**: Add .gitignore (you already have one)
- ❌ **DO NOT CHECK**: Choose a license (optional, can add later)

## Step 2: Initialize Git and Push (Run these commands)

```bash
# Navigate to your project directory
cd "C:\Users\Prathmesh more\OneDrive\Desktop\Coding\Contract Management Platform"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Contract Management Platform"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/contract-management-platform.git

# Rename main branch (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify

After pushing, verify on GitHub:
- ✅ README.md is visible
- ✅ All source files are present
- ✅ node_modules is NOT visible (excluded by .gitignore)
- ✅ .env files are NOT visible (excluded by .gitignore)

## Important Notes

1. **Never commit `.env` files** - They contain sensitive data
2. **`.env.example` is committed** - This is correct (template file)
3. **`node_modules/` is excluded** - This is correct (too large, can be reinstalled)
4. **Make meaningful commits** - Good commit messages show code quality

## Quick Command Reference

```bash
# Check status
git status

# See what will be committed
git add .

# Commit changes
git commit -m "Descriptive commit message"

# Push to GitHub
git push
```
