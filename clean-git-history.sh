#!/bin/bash

# Script to delete git history on master and delete all other branches
# WARNING: This script will permanently delete git history and branches
# Make sure you have backups before running this script

echo "WARNING: This script will permanently delete git history and all branches except main."
echo "Are you sure you want to continue? (type 'yes' to proceed)"
read confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Operation cancelled."
    exit 1
fi

echo "Starting git history cleanup..."

# Step 1: Create a new orphan branch with no history
echo "Creating new orphan branch..."
git checkout --orphan new-main

# Step 2: Add all current files
echo "Adding all files to new branch..."
git add .

# Step 3: Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit with clean history"

# Step 4: Delete all other local branches
echo "Deleting other local branches..."
git branch | grep -v "new-main" | xargs -r git branch -D

# Step 5: Rename new branch to main
echo "Renaming branch to main..."
git branch -m new-main main

# Step 6: Force push to replace main branch
echo "Force pushing new main branch..."
git push --force origin main

# Step 7: Delete all other remote branches (except main)
echo "Deleting remote branches..."
git branch -r | grep -v "origin/main" | grep -v "HEAD" | sed 's/origin\///' | xargs -r -I {} git push origin --delete {}

echo "Git history cleanup completed!"
echo "The repository now has a clean history with only the main branch."