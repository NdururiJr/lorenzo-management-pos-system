# View Marketing Site - Quick Start Guide

**Status:** Development server running
**URL:** http://localhost:3002
**Last Updated:** October 28, 2025

---

## Current Status

✅ **Development server is LIVE at:** http://localhost:3002

The premium marketing landing page is ready to view with:
- Hero section with gradient background
- Features grid with glassmorphism effects
- Process steps (4-step flow)
- Call-to-action sections
- Testimonials carousel
- Responsive header and footer

---

## How to View the Site

### Option 1: Open in Your Browser
Simply click or navigate to: **http://localhost:3002**

### Option 2: Use Chrome DevTools for Responsive Testing
1. Open http://localhost:3002 in Chrome
2. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Click the device toolbar icon (or press `Ctrl+Shift+M`)
4. Select different devices from the dropdown:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1440px)

---

## What to Look For

### 1. Hero Section
- Large headline: "Premium Dry Cleaning Services in Kilimani, Nairobi"
- Blue gradient background
- Two CTA buttons: "Schedule Pickup" and "Browse Services"
- Staggered entrance animations

### 2. Features Grid
- 6 glassmorphism cards with icons
- Cards lift on hover
- Stats bar: 500+ Customers, 10,000+ Garments, 24hr Service, 5.0★

### 3. Process Steps
- 4 colored steps: Schedule → Collect → Clean → Deliver
- Desktop: Horizontal with arrows
- Mobile: Vertical with connectors

### 4. Call-to-Action Sections
- Blue gradient backgrounds with grid pattern
- Two CTA sections throughout the page
- Prominent buttons with hover effects

### 5. Testimonials
- Auto-advancing carousel (changes every 5 seconds)
- 5 customer reviews with 5-star ratings
- Navigation arrows and dot indicators
- Pauses on hover

### 6. Header
- Sticky navigation
- Becomes frosted glass on scroll
- Login dropdown with Staff/Customer options
- Mobile hamburger menu

### 7. Footer
- Dark theme with 4 columns
- Company info, links, newsletter signup
- Social media icons

---

## Testing the Animations

### Scroll-Triggered Animations
1. **Reload the page** (Ctrl+R or Cmd+R)
2. **Watch the hero:** Content fades in with stagger effect
3. **Scroll slowly down:** Features, process steps, and CTAs animate when they come into view
4. **Scroll back up:** Animations don't repeat (they only play once)

### Hover Effects
- **Feature cards:** Hover to see lift effect
- **Buttons:** Hover to see scale and shadow increase
- **Navigation links:** Hover for underline effect
- **Testimonial arrows:** Hover for background change

### Auto-Advance Carousel
1. **Find testimonials section** (scroll to middle of page)
2. **Wait 5 seconds:** Testimonial should change automatically
3. **Hover over testimonial card:** Auto-advance pauses
4. **Move mouse away:** Auto-advance resumes

---

## Test Navigation

### Links to Test
- **Header "Get Started" button** → Should link somewhere (check destination)
- **Hero "Schedule Pickup" button** → Should go to customer login
- **Header "Login" dropdown:**
  - Staff Login → [http://localhost:3002/login](http://localhost:3002/login)
  - Customer Login → [http://localhost:3002/customer-login](http://localhost:3002/customer-login)
- **Footer links** → Most are placeholder, but should attempt to navigate

### Mobile Menu
1. **Resize browser to mobile** (< 768px width)
2. **Click hamburger icon** (three lines in header)
3. **Menu should slide in** from right side
4. **Click menu items** to test navigation
5. **Click X or outside menu** to close

---

## Known Behavior

### Expected (Not Bugs)
- **Port 3002:** Using 3002 instead of 3000 (3000 is already in use)
- **No hero video:** Using gradient fallback (video is optional)
- **Testimonial avatars:** Using colored initials (photos optional)
- **Some links lead to 404:** Services and Contact pages not created yet
- **ESLint warnings in console:** Expected (~100+ warnings, ignored per config)

### What Should NOT Happen
- ❌ JavaScript errors in console
- ❌ Layout shifting during load
- ❌ Broken images (no images required)
- ❌ Horizontal scrolling on mobile
- ❌ Text overflowing containers

---

## Stopping the Development Server

When you're done testing, stop the server by:
1. Going to your terminal
2. Pressing `Ctrl+C`
3. Confirming when prompted (Y)

---

## Making Changes

If you want to modify the marketing site:

1. **Component files are in:** `components/marketing/`
   - [GlassCard.tsx](c:\Users\gache\lorenzo-dry-cleaners\components\marketing\GlassCard.tsx) - Glassmorphism cards
   - [Header.tsx](c:\Users\gache\lorenzo-dry-cleaners\components\marketing\Header.tsx) - Navigation header
   - [Footer.tsx](c:\Users\gache\lorenzo-dry-cleaners\components\marketing\Footer.tsx) - Footer
   - [HeroVideo.tsx](c:\Users\gache\lorenzo-dry-cleaners\components\marketing\HeroVideo.tsx) - Hero section (HeroGradient variant used)
   - [FeaturesGrid.tsx](c:\Users\gache\lorenzo-dry-cleaners\components\marketing\FeaturesGrid.tsx) - Features section
   - [ProcessSteps.tsx](c:\Users\gache\lorenzo-dry-cleaners\components\marketing\ProcessSteps.tsx) - Process flow
   - [Testimonials.tsx](c:\Users\gache\lorenzo-dry-cleaners\components\marketing\Testimonials.tsx) - Reviews carousel
   - [CTABand.tsx](c:\Users\gache\lorenzo-dry-cleaners\components\marketing\CTABand.tsx) - Call-to-action sections

2. **Landing page is at:** [app/page.tsx](c:\Users\gache\lorenzo-dry-cleaners\app\page.tsx)

3. **After making changes:**
   - Next.js will auto-reload (Fast Refresh)
   - Check browser - changes should appear in ~1-2 seconds
   - Check console for any errors

---

## Comprehensive Testing Checklist

For detailed testing instructions, see:
[MARKETING_SITE_TESTING.md](c:\Users\gache\lorenzo-dry-cleaners\Documentation\MARKETING_SITE_TESTING.md)

This document includes:
- Component-by-component testing checklist
- Responsive design testing (desktop, tablet, mobile)
- Animation testing
- Interaction testing
- Visual testing
- Performance testing
- Accessibility testing
- Cross-browser testing

---

## Next Steps

### Immediate (Testing Phase)
1. ✅ View the site at http://localhost:3002
2. ⏳ Test on different screen sizes
3. ⏳ Verify all animations work
4. ⏳ Check navigation links
5. ⏳ Test testimonials carousel

### Upcoming (Phase 5-6)
1. Create Services page (`app/services/page.tsx`)
2. Create Contact page with form (`app/contact/page.tsx`)
3. Add SEO metadata
4. Performance optimization
5. Cross-browser testing

### Future Enhancements
1. Add hero video (see `public/images/marketing/README.md`)
2. Add professional photography
3. Add real testimonials
4. Implement newsletter signup backend
5. Add analytics tracking

---

## Need Help?

### Common Issues

**Issue: Page won't load**
- Check that dev server is running (should see "Ready" message in terminal)
- Try refreshing the page (Ctrl+R or Cmd+R)
- Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Del)

**Issue: Animations not playing**
- Scroll away from the section and back
- Reload the page (animations trigger once on first view)
- Check browser console for JavaScript errors

**Issue: Mobile menu not working**
- Resize browser to mobile width (<768px)
- Check browser console for errors
- Try clicking hamburger icon again

**Issue: Styles look broken**
- Check that Tailwind is compiling (should see in terminal output)
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for CSS errors

### Technical Support
- **Developer:** Gachengoh Marugu
- **Email:** jerry@ai-agentsplus.com
- **Phone:** +254 725 462 859

---

**Enjoy exploring the new marketing site! 🚀**
