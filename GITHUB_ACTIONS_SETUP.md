# 🚀 GitHub Actions Setup Guide

## Step 1: Push Your Code to GitHub

```bash
# If you haven't already initialized git
git init
git add .
git commit -m "Initial commit with GitHub Actions scheduler"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/celebrate-this-mortal-discord-bot.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Firebase Service Account

### 2.1 Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `celebratethismortalbot`

### 2.2 Create Service Account
1. Go to **Project Settings** (gear icon)
2. Click **Service Accounts** tab
3. Click **Generate new private key**
4. Save the JSON file (keep it secure!)

### 2.3 Extract Required Values
From the downloaded JSON file, you'll need:
- `project_id`
- `client_email`
- `private_key` (the entire multi-line string)

## Step 3: Add GitHub Secrets

### 3.1 Go to Repository Settings
1. Go to your GitHub repo
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**

### 3.2 Add These Secrets
Click **New repository secret** for each:

| Secret Name | Value | Example |
|-------------|--------|---------|
| `DISCORD_TOKEN` | Your bot token | `MTQxNjI2MTYwMTMwMzk4NjM1Nw.G-7fd0...` |
| `FIREBASE_PROJECT_ID` | Project ID from JSON | `celebratethismortalbot` |
| `FIREBASE_CLIENT_EMAIL` | Client email from JSON | `firebase-adminsdk-xyz@celebratethismortalbot.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Private key from JSON | `-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...` |

**⚠️ Important:** For `FIREBASE_PRIVATE_KEY`, copy the ENTIRE private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines.

## Step 4: Test the Scheduler

### 4.1 Manual Test
1. Go to **Actions** tab in your GitHub repo
2. Click **Birthday Scheduler** workflow
3. Click **Run workflow** → **Run workflow**
4. Select task type: "all" to test everything

### 4.2 Check Logs
1. Click on the running workflow
2. Click on each job to see logs
3. Look for success messages like:
   - `✅ Scheduler completed successfully`
   - `🎂 Running daily birthday check`

## Step 5: Verify Schedule

The workflow will automatically run:
- **Daily at midnight UTC** - Birthday checks (14 days ahead) AND birthday reveals (today's birthdays)
- **Every 6 hours** - Process scheduled events (reminders, role removal)

## Step 6: Monitor & Debug

### Common Issues:
1. **Firebase Permission Denied**
   - Check that `FIREBASE_PRIVATE_KEY` includes the entire key with newlines
   - Verify project ID matches your Firebase project

2. **Discord Login Failed**
   - Check `DISCORD_TOKEN` is correct
   - Ensure bot has necessary permissions in your server

3. **Build Errors**
   - Check that all dependencies are in package.json
   - Verify TypeScript compiles locally first

### Debugging:
```bash
# Test locally first
npm run scheduler:daily
npm run scheduler:hourly
npm run scheduler:reveals
```

## 🎯 Next Steps

1. **Test with a Real Birthday**: Set a birthday for tomorrow to test the full flow
2. **Monitor Logs**: Check GitHub Actions regularly for the first week
3. **Add Webhooks**: Optionally add Discord webhook notifications for failures
4. **Scale Up**: The current setup can handle hundreds of users easily

## 📊 Usage Tracking

Your workflow will use approximately:
- **90 minutes/month** of GitHub Actions (well under the 2,000 free limit)
- **$0/month** cost
- **High reliability** with GitHub's infrastructure

## 🔧 Advanced Configuration

### Custom Schedules
Edit `.github/workflows/birthday-scheduler.yml` to change timing:
```yaml
# Run every 4 hours instead of 6
- cron: '0 */4 * * *'

# Run reveals at 9 AM instead of 8 AM
- cron: '0 9 * * *'
```

### Failure Notifications
Add Discord webhook for failures:
```yaml
- name: Notify Discord on failure
  if: failure()
  run: |
    curl -H "Content-Type: application/json" \
         -d '{"content":"⚠️ Birthday scheduler failed!"}' \
         ${{ secrets.DISCORD_WEBHOOK_URL }}
```

You're all set! 🎉
