# Guiding Hand - Missing Persons Tracking for Jamaica

A Next.js app for tracking and finding missing persons after natural disasters in Jamaica. Built with Convex backend and Resend for email notifications.

## Features

- **Report Missing Persons**: Submit detailed reports with PII (TRN, NIN, Passport, Driver's License), physical description, photos, and location
- **Report Found Persons**: Submit found person information - automatically matches against missing persons reports
- **Fuzzy Matching Algorithm**: Uses Levenshtein distance for name matching with confidence scoring
- **Email Notifications**: Automatic email alerts when high-confidence matches (>85%) are found
- **Browse & Search**: View and filter missing persons by parish, search by name (on homepage)
- **Tracking Subscriptions**: Subscribe to email notifications for specific missing persons

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set up Convex

1. Run `npx convex dev` to initialize your Convex project (interactive setup)
2. This will create a `.env.local` file with `NEXT_PUBLIC_CONVEX_URL`

### 3. Set up Resend (for email notifications)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. **For Development**: You can use Resend's test domain without verification:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=Guiding Hand <onboarding@resend.dev>
   ```
   This works immediately but has rate limits.

4. **For Production**: You'll need to verify your own domain in Resend:
   - Add your domain in Resend dashboard (Settings > Domains)
   - Add the required DNS records (SPF, DKIM)
   - Once verified, use: `RESEND_FROM_EMAIL=Guiding Hand <notifications@yourdomain.com>`

   **Note**: You cannot use Gmail addresses directly. Options:
   - Use a custom domain with Resend (requires domain ownership)
   - Use Google Workspace with a custom domain (then verify that domain in Resend)
   - Keep using `onboarding@resend.dev` for testing (has limits)

### 4. Environment Variables

Create `.env.local` with:
```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url_from_step_2
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=Guiding Hand <notifications@yourdomain.com>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Reporting**: Users submit missing/found person reports with PII and photos
2. **Matching**: When a found person is reported, the system automatically:
   - Compares against all missing persons using fuzzy matching
   - Scores matches by confidence (100% for exact ID match, 90% for name+DOB, 75% for name+description+location, 70%+ for fuzzy name matches)
   - Creates match records for scores ≥70%
3. **Notifications**: High-confidence matches (>85%) automatically email all verified trackers
4. **Verification**: Lower confidence matches (70-85%) go to review queue

## Matching Algorithm

- **100% confidence**: Exact match on TRN, NIN, or Passport number
- **90% confidence**: Exact name + date of birth match
- **75% confidence**: Name similarity (>70%) + physical description + location match
- **70% confidence**: Fuzzy name match (>60%) + date of birth

## Jamaican-Specific Features

- Support for Jamaican ID types: TRN (Tax Registration Number), NIN (National ID), Passport, Driver's License
- 14 Jamaican parishes dropdown
- Phone format support for area codes 876 and 658

## Tech Stack

- **Frontend**: Next.js 15, React 19, shadcn/ui, Tailwind CSS
- **Backend**: Convex (database, auth, real-time, serverless functions)
- **Email**: Resend
- **File Storage**: Convex Storage for photos

## Project Structure

```
app/
  api/notify/          # Resend email API route
  page.tsx             # Homepage with browse/search functionality
  report/              # Report missing person page
  found/               # Report found person page
  person/[id]/         # View individual missing person details
  track/[id]/          # Subscribe to notifications for a missing person

convex/
  schema.ts            # Database schema
  missingPersons.ts    # Missing person mutations/queries
  foundPersons.ts      # Found person mutations/queries
  matching.ts          # Fuzzy matching algorithm
  notifications.ts     # Email notification triggers
  trackers.ts          # Email subscription management
  matches.ts           # Match records
  files.ts             # File upload utilities
  auth.ts              # Authentication setup

components/
  ReportForm.tsx       # Reusable form for reporting
```

## Security & Privacy

- Rate limiting: 5 reports per email per hour
- Duplicate detection: Prevents duplicate reports within 24 hours
- Email verification: Required for tracking subscriptions
- Access control: Public can see names/photos, authenticated users see full PII

## Development Notes

- Convex schema will be automatically deployed when you run `npx convex dev`
- The app uses Convex's real-time capabilities for live updates
- Email notifications are triggered via Convex actions calling the Next.js API route

## Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed production deployment instructions.

**Quick deploy:**
1. Deploy Convex: `npx convex deploy --prod`
2. Deploy to Vercel: `vercel --prod` or connect GitHub repo
3. Set environment variables (see deployment guide)
