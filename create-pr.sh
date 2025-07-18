#!/bin/bash

# Tersa Agent PR Creation Script
# Run this after forking haydenbleasel/tersa on GitHub

echo "🚀 Tersa Agent PR Setup"
echo "======================="
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

echo ""
echo "📝 Setting up fork remote..."
git remote add fork "https://github.com/${GITHUB_USERNAME}/tersa.git"

echo "📤 Pushing branch to your fork..."
git push fork feat/tersa-agent-complete

echo ""
echo "✅ Branch pushed successfully!"
echo ""
echo "🔗 Now create the PR:"
echo "1. Visit: https://github.com/${GITHUB_USERNAME}/tersa/tree/feat/tersa-agent-complete"
echo "2. Click 'Contribute' → 'Open pull request'"
echo "3. Use the PR title and body from PR-BODY.md"
echo ""
echo "Or use GitHub CLI:"
echo "gh pr create --repo haydenbleasel/tersa --base main --head ${GITHUB_USERNAME}:feat/tersa-agent-complete --title \"feat: add Tersa Agent - AI-native chat for autonomous canvas workflows\" --body-file PR-BODY.md"