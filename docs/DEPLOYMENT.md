# Production Deployment Guide

## Overview

- **Next.js App**: Deploy to Vercel (recommended for Next.js)
- **Convex Backend**: Deploy separately via Convex CLI (free tier available)
- **Email**: Resend (keep using onboarding@resend.dev or verify custom domain)

## Pricing

### Convex
- **Free Tier**: 
  - 1M function invocations/month
  - 1M storage reads/month
  - 100K storage writes/month
  - 1GB file storage
  - Great for starting out!

### Vercel
- **Free Hobby Plan**:
  - Unlimited personal projects
  - 100GB bandwidth/month
  - Perfect for this app

### Resend
- **Free Tier**: 
  - 3,000 emails/month
  - 100 emails/day
  - Using `onboarding@resend.dev` (no domain needed)

## Deployment Steps

### 1. Deploy Convex Backend

```bash
# Make sure you're logged in
npx convex login

# Deploy to production
npx convex deploy --prod
```

This will:
- Create a production deployment
- Give you a production Convex URL
- Keep your dev deployment separate

**Note**: You'll have two Convex deployments:
- **Dev**: Used with `npx convex dev` (local development)
- **Prod**: Used in production (deployed separately)

### 2. Set Up Production Environment Variables

After deploying Convex, you'll get a production URL like:
`https://your-project.prod.convex.cloud`

### 3. Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:

**Environment Variables to add in Vercel:**

```
NEXT_PUBLIC_CONVEX_URL=https://your-project.prod.convex.cloud
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Guiding Hand <onboarding@resend.dev>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important**: Replace:
- `your-project.prod.convex.cloud` with your actual production Convex URL
- `your-app.vercel.app` with your actual Vercel URL (or custom domain)

### 4. Set Convex Production Environment Variables

Convex needs to know the production app URL:

```bash
# Set production app URL in Convex
npx convex env set NEXT_PUBLIC_APP_URL https://your-app.vercel.app --prod
```

Or via Convex Dashboard:
1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project → Production deployment
3. Settings → Environment Variables
4. Add `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`

## Environment Variables Summary

### Vercel (Next.js)
- `NEXT_PUBLIC_CONVEX_URL` - Production Convex URL
- `RESEND_API_KEY` - Your Resend API key
- `RESEND_FROM_EMAIL` - Email sender (onboarding@resend.dev or custom)
- `NEXT_PUBLIC_APP_URL` - Your Vercel app URL

### Convex Production
- `NEXT_PUBLIC_APP_URL` - Your production app URL (used for API calls)

## Quick Checklist

- [ ] Deploy Convex: `npx convex deploy --prod`
- [ ] Get production Convex URL
- [ ] Push code to GitHub
- [ ] Import to Vercel
- [ ] Add environment variables in Vercel
- [ ] Set `NEXT_PUBLIC_APP_URL` in Convex production
- [ ] Test the deployed app
- [ ] Verify emails are working

## Verifying Deployment

1. Visit your Vercel URL
2. Test reporting a missing person
3. Test searching/filtering
4. Test tracking subscription
5. Check Resend dashboard for emails

## Custom Domain (Optional)

If you want a custom domain:
1. Add domain in Vercel project settings
2. Update DNS records
3. Update `NEXT_PUBLIC_APP_URL` in both Vercel and Convex

## Troubleshooting

**Convex not connecting?**
- Check `NEXT_PUBLIC_CONVEX_URL` matches production deployment
- Verify you're using the `--prod` deployment URL

**Emails not sending?**
- Check `RESEND_API_KEY` in Vercel env vars
- Check Resend dashboard for API usage/quota
- Verify `NEXT_PUBLIC_APP_URL` is set correctly in Convex

**API routes failing?**
- Ensure `NEXT_PUBLIC_APP_URL` is set in Convex production
- Check Vercel function logs in dashboard

## Notes

- Your dev environment stays separate from production
- Convex dev/prod deployments are completely isolated
- You can test production Convex locally by using prod URL in `.env.local`
- Free tiers should be sufficient for disaster relief use case

