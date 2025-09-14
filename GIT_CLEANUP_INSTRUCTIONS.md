# Git History Cleanup Instructions

This document provides instructions for deleting the git history on the main branch and removing all other branches from the repository.

## ⚠️ IMPORTANT WARNING

**This process will permanently delete all git history and branches except main. Make sure you have backups before proceeding.**

## Prerequisites

1. Ensure you have administrative access to the repository
2. Clone the repository locally if you haven't already
3. Make sure all important changes are committed and backed up

## Option 1: Using the Provided Script (Recommended)

We've included a script `clean-git-history.sh` that automates the entire process:

```bash
# Make sure you're in the repository directory
cd /path/to/your/voting/repository

# Run the cleanup script
./clean-git-history.sh
```

The script will:
- Ask for confirmation before proceeding
- Create a new orphan branch with no history
- Add all current files in a single commit
- Delete all other branches (local and remote)
- Force push the clean main branch

## Option 2: Manual Steps

If you prefer to run the commands manually:

### Step 1: Create New Orphan Branch
```bash
git checkout --orphan new-main
```

### Step 2: Add All Files
```bash
git add .
git commit -m "Initial commit with clean history"
```

### Step 3: Delete Other Branches
```bash
# Delete all local branches except new-main
git branch | grep -v "new-main" | xargs git branch -D

# Rename new branch to main
git branch -m new-main main
```

### Step 4: Force Push New Main
```bash
git push --force origin main
```

### Step 5: Delete Remote Branches
```bash
# Delete all remote branches except main
git branch -r | grep -v "origin/main" | grep -v "HEAD" | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

## What This Accomplishes

- **Clean History**: The main branch will have only one commit containing all current files
- **No Branches**: All other branches (both local and remote) will be deleted
- **Preserved Content**: All current files and their content will be preserved
- **Fresh Start**: The repository will have a clean, minimal git history

## Verification

After running the cleanup, verify the results:

```bash
# Check that only main branch exists
git branch -a

# Verify clean history (should show only one commit)
git log --oneline

# Confirm all files are present
ls -la
```

## Recovery

If you need to recover the old history:
1. Restore from your backup repository
2. The old history will be available in any clones made before the cleanup
3. GitHub may retain the old history for a limited time in their interface

## Support

If you encounter any issues with this process, please:
1. Check that you have the necessary permissions
2. Ensure your git version supports all used commands
3. Contact the repository maintainer for assistance