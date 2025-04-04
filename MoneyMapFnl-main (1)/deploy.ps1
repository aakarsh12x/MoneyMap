#!/usr/bin/env pwsh
# Deployment script for MoneyMap

Write-Host "Starting deployment process for MoneyMap..." -ForegroundColor Green

# Ensure all changes are committed
git status
$status = git status --porcelain
if ($status) {
    Write-Host "You have uncommitted changes. Please commit them first." -ForegroundColor Red
    exit 1
}

# Push changes to GitHub
Write-Host "Pushing changes to GitHub..." -ForegroundColor Yellow
git push

# Ensure Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

# Set environment variables in Vercel if needed
Write-Host "Checking environment variables..." -ForegroundColor Yellow
Write-Host "If you need to set/update environment variables, run the following commands:" -ForegroundColor Cyan
Write-Host "vercel env add NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
Write-Host "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
Write-Host "vercel env add CLERK_SECRET_KEY" -ForegroundColor Cyan
Write-Host "vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" -ForegroundColor Cyan

Write-Host "Deployment process completed!" -ForegroundColor Green
Write-Host "Your application should be live soon at your Vercel deployment URL." -ForegroundColor Green 