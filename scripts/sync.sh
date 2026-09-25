#!/usr/bin/env bash
set -e

# ==============================================================================
# CivicPulse Automated Sync: GitHub Production
# Usage: ./scripts/sync.sh ["optional commit message"]
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

MSG="${1:-chore: sync project updates to GitHub [$(date '+%Y-%m-%d %H:%M')]}"

echo "========================================================"
echo "🚀 CivicPulse Deployment Pipeline (GitHub)"
echo "========================================================"

# 1. Check Git Status
echo "📦 1. Staging and committing changes to Git..."
git add -A

if git diff-index --quiet HEAD --; then
    echo "ℹ️  No uncommitted changes in working tree."
else
    git commit -m "$MSG"
    echo "✅ Changes committed: $MSG"
fi

# 2. Push to GitHub
echo "🐙 2. Pushing to GitHub (origin/main)..."
git push origin main
echo "✅ Successfully pushed to https://github.com/BongaManzini/CivicPulse"

# 3. Build Production Web Application Bundle
echo "⚡ 3. Compiling production bundle (Vite)..."
npm run build
echo "✅ Production bundle compiled in dist/"

# 4. Deploy to Netlify Production
echo "🌐 4. Deploying production bundle to Netlify..."
npx netlify deploy --prod --dir=dist

echo "========================================================"
echo "🎉 SUCCESS: GitHub and Netlify are fully synchronized!"
echo "   GitHub:  https://github.com/BongaManzini/CivicPulse"
echo "   Netlify: https://civicpulse-gauteng-2026.netlify.app/"
echo "========================================================"
