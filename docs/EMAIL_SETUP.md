# Setting Up Custom Email Domain for Notifications

## Quick Setup Guide

### 1. Add Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Click **"Add"**

### 2. Add DNS Records

Resend will show you the required DNS records. Add them to your domain's DNS settings:

#### Required Records:

**SPF Record** (TXT)
```
v=spf1 include:_spf.resend.com ~all
```

**DKIM Records** (usually 2-3 CNAME records)
```
resend._domainkey.yourdomain.com → [value from Resend]
```

#### Where to Add DNS Records:

- **Cloudflare**: DNS → Records → Add record
- **Namecheap**: Advanced DNS → Add new record
- **GoDaddy**: DNS Management → Add
- **AWS Route 53**: Hosted zones → Create record

### 3. Verify Domain

1. In Resend Dashboard → Domains
2. Click **"Verify"** next to your domain
3. Wait 5-10 minutes for DNS propagation
4. Status should change to **"Verified"** ✅

### 4. Update Environment Variables

Once verified, update your `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Guiding Hand <notifications@yourdomain.com>
```

**Available email addresses:**
- `notifications@yourdomain.com`
- `noreply@yourdomain.com`
- `alerts@yourdomain.com`
- Any address at your verified domain works!

### 5. Verify It's Working

1. Restart your dev server
2. Subscribe to track a missing person
3. Check your inbox (emails may take a few minutes and check spam folder)

## Benefits of Custom Domain

✅ Better deliverability (less spam filtering)  
✅ Professional appearance  
✅ Higher rate limits  
✅ Can send to more recipients  
✅ Brand recognition  

## Troubleshooting

**DNS not propagating?**
- Wait 10-15 minutes (can take up to 48 hours)
- Check DNS propagation: https://dnschecker.org
- Verify records are added correctly (no typos)

**Domain won't verify?**
- Double-check all DNS records are added
- Make sure record types match (TXT, CNAME)
- Remove any conflicting records

**Still going to spam?**
- Add DMARC record (optional but recommended)
- Wait a few days for domain reputation to build
- Use proper email content (avoid spam trigger words)

## Need Help?

- [Resend Domain Setup Docs](https://resend.com/docs/dashboard/domains/introduction)
- [Resend DNS Records Guide](https://resend.com/docs/dashboard/domains/dns-records)

