# Marketing Site Testing Checklist

**Last Updated:** October 28, 2025
**Dev Server:** http://localhost:3002
**Status:** Ready for Testing

---

## Overview

This document provides a comprehensive testing checklist for the new premium marketing landing page. Test all features across different devices and browsers to ensure a smooth user experience.

---

## Quick Start

1. **Open the site:** Navigate to http://localhost:3002
2. **Test on desktop first:** Use Chrome DevTools (F12) to test responsiveness
3. **Test mobile devices:** Use responsive mode or real devices
4. **Check animations:** Scroll slowly to trigger intersection observer animations

---

## Component Testing Checklist

### 1. Header Component
- [ ] Header is sticky and stays at top when scrolling
- [ ] Background changes from transparent to frosted glass when scrolling down
- [ ] Logo is visible and clickable (should link to home)
- [ ] Navigation links work (Services, How It Works, Testimonials, Contact)
- [ ] Smooth scroll to sections when clicking nav links
- [ ] "Get Started" button is visible and styled correctly
- [ ] "Login" dropdown shows two options: Staff Login & Customer Login
- [ ] Staff Login links to `/login`
- [ ] Customer Login links to `/customer-login`
- [ ] **Mobile:** Hamburger menu icon appears on small screens
- [ ] **Mobile:** Hamburger menu opens/closes smoothly
- [ ] **Mobile:** Menu items are readable and clickable
- [ ] **Mobile:** Login dropdown works in mobile menu

**Expected Behavior:**
- Header should be transparent on page load
- After scrolling ~50px, header gains white/90% background with backdrop blur
- All links should navigate correctly

---

### 2. Hero Section (HeroGradient)
- [ ] Hero takes full viewport height (at least 600px on mobile)
- [ ] Gradient background is visible and attractive
- [ ] Headline text is large and readable: "Premium Dry Cleaning Services in Kilimani, Nairobi"
- [ ] Subheading is visible: "Experience excellence in garment care..."
- [ ] Primary CTA button "Schedule Pickup" is prominent (blue background)
- [ ] Secondary button "Browse Services" is visible (outline style)
- [ ] Buttons have hover effects (scale, shadow)
- [ ] Trust indicators show below buttons (Fast Pickup, Fresh Finish, Eco Friendly)
- [ ] Scroll indicator (down arrow) is visible at bottom
- [ ] Scroll indicator bounces/animates
- [ ] **Animations:** Headline fades in and slides up (0.6s delay)
- [ ] **Animations:** Subheading fades in with 0.8s delay
- [ ] **Animations:** Buttons fade in with 1.0s delay (stagger effect)
- [ ] **Animations:** Trust indicators fade in with 1.2s delay
- [ ] **Mobile:** Text remains readable (no overflow)
- [ ] **Mobile:** Buttons stack vertically
- [ ] **Mobile:** Font sizes adjust appropriately

**Expected Behavior:**
- Hero should have dramatic entrance with staggered animations
- Gradient should be blue-to-dark-blue radial
- CTA button links to `/customer-login`
- Services button links to `/services` (or scrolls to section if not created yet)

---

### 3. Features Grid Component
- [ ] Section title "Why Choose Lorenzo Dry Cleaners" is visible
- [ ] 6 feature cards are displayed in a grid
- [ ] **Desktop:** 3 columns
- [ ] **Tablet:** 2 columns
- [ ] **Mobile:** 1 column
- [ ] Each card has:
  - [ ] Icon (Sparkles, Smartphone, Zap, Truck, CreditCard, Shield)
  - [ ] Title
  - [ ] Description
  - [ ] Glassmorphism effect (frosted glass background)
- [ ] Cards have hover effect (lift up, shadow increases)
- [ ] Cards have subtle borders and shadows
- [ ] Stats bar is visible below cards
- [ ] 4 stats displayed: 500+ Customers, 10,000+ Garments, 24hr Service, 5.0★ Rating
- [ ] **Animations:** Cards fade in and slide up when scrolling into view
- [ ] **Animations:** Animation triggers only once (not on every scroll)

**Expected Behavior:**
- All 6 cards should be visible and evenly spaced
- Glassmorphism effect: white/10% background with backdrop-blur
- Hover should lift card up (-4px translate) and increase shadow

---

### 4. Process Steps Component
- [ ] Section title "How It Works" is visible
- [ ] Subtitle text is readable
- [ ] 4 process steps are displayed
- [ ] Each step has:
  - [ ] Numbered badge (1, 2, 3, 4) with colored background
  - [ ] Icon (Calendar, Package, Sparkles, Truck)
  - [ ] Title
  - [ ] Description
- [ ] Step colors are distinct: blue, purple, orange, green
- [ ] **Desktop:** Steps displayed in horizontal row
- [ ] **Desktop:** Connecting arrows between steps
- [ ] **Mobile:** Steps stack vertically
- [ ] **Mobile:** Vertical connectors between steps
- [ ] **Animations:** Steps fade in with stagger effect (0.2s between each)
- [ ] **Animations:** Badges scale in
- [ ] Primary CTA "Get Started Now" button is visible below steps
- [ ] CTA button links to `/customer-login`

**Expected Behavior:**
- Steps should clearly show the service flow from scheduling to delivery
- Color progression: blue → purple → orange → green
- Horizontal layout on desktop (≥768px), vertical on mobile

---

### 5. CTA Band Component (First Instance)
- [ ] CTA section has blue gradient background
- [ ] Background has grid pattern overlay (subtle)
- [ ] Section has rounded corners (3xl)
- [ ] Title "Ready to Experience Premium Care?" is large and white
- [ ] Description text is readable and white
- [ ] Primary button "Schedule Pickup" is prominent (white text on blue)
- [ ] Secondary button "Call Us Now" is visible (outline style)
- [ ] Buttons have icons (Calendar, Phone)
- [ ] Trust indicators below buttons: Fast Pickup, Fresh Finish, Eco Friendly
- [ ] **Animations:** Entire section fades in and slides up when scrolling into view
- [ ] **Animations:** Content elements have staggered delays (title → description → buttons)
- [ ] Primary button links to `/contact`
- [ ] Secondary button links to `tel:+254725462859`
- [ ] **Mobile:** Buttons stack vertically
- [ ] **Mobile:** Text remains centered and readable

**Expected Behavior:**
- Should feel high-impact and attention-grabbing
- Gradient from brand-blue to brand-blue-dark
- Decorative blur elements in corners
- Phone link should trigger phone app on mobile

---

### 6. Testimonials Component
- [ ] Section title "What Our Customers Say" is visible
- [ ] Testimonial card has glassmorphism effect
- [ ] Current testimonial displays:
  - [ ] 5-star rating (yellow stars)
  - [ ] Quote text
  - [ ] Customer name
  - [ ] Customer role/title
  - [ ] Initial avatar (colored circle with letters)
- [ ] Navigation arrows (left/right) are visible
- [ ] Navigation arrows have hover effects
- [ ] Dot indicators show below (5 dots)
- [ ] Active dot is highlighted (blue)
- [ ] **Auto-advance:** Testimonial changes every 5 seconds
- [ ] **Auto-advance:** Pauses when hovering over card
- [ ] **Auto-advance:** Resumes after mouse leaves
- [ ] **Animations:** Testimonials slide left/right with smooth transition
- [ ] Clicking left arrow shows previous testimonial
- [ ] Clicking right arrow shows next testimonial
- [ ] Clicking dot jumps to that testimonial
- [ ] Carousel loops (after last testimonial, shows first)

**Expected Behavior:**
- 5 testimonials total: Sarah K., James M., Priya S., Michael O., Grace N.
- Smooth fade + slide animation between testimonials
- Auto-advance should pause on hover (improves UX)

---

### 7. CTA Band Component (Second Instance)
- [ ] Second CTA has different content than first
- [ ] Title "Let's Make Laundry the Easiest Chore Ever"
- [ ] Description about hassle-free service
- [ ] Primary button "Schedule Pickup" → `/contact`
- [ ] Secondary button "Browse Services" → `/services`
- [ ] Same visual styling as first CTA (blue gradient)
- [ ] Same animations (fade in, slide up)
- [ ] **Mobile:** Responsive and readable

**Expected Behavior:**
- Should reinforce conversion after seeing testimonials
- Same high-impact design as first CTA

---

### 8. Footer Component
- [ ] Footer has dark gray background
- [ ] 4 columns visible on desktop: About, Services, Support, Connect
- [ ] **About section:**
  - [ ] Company description
  - [ ] Phone number (clickable tel: link)
  - [ ] Email address (clickable mailto: link)
  - [ ] Physical address
- [ ] **Services section:**
  - [ ] Links to service pages (Dry Cleaning, Wash & Fold, Express Service, etc.)
- [ ] **Support section:**
  - [ ] Links to Contact, Help Center, Track Order, FAQs
- [ ] **Connect section:**
  - [ ] Newsletter signup form
  - [ ] Email input field
  - [ ] "Subscribe" button
  - [ ] Social media icons (Facebook, Twitter, Instagram)
- [ ] Copyright text at bottom
- [ ] **Mobile:** Columns stack vertically
- [ ] **Mobile:** All links remain clickable
- [ ] All footer links work (even if they lead to 404, they should navigate)

**Expected Behavior:**
- Newsletter form should have proper validation (email format)
- Phone number should trigger phone app on mobile
- Social icons should have hover effects
- Footer should be fully readable on all screen sizes

---

## Responsive Design Testing

### Desktop (≥1024px)
- [ ] All sections display in optimal layout
- [ ] Features grid shows 3 columns
- [ ] Process steps show horizontally with arrows
- [ ] Header navigation is horizontal
- [ ] Text sizes are appropriate
- [ ] No horizontal scrolling
- [ ] Margins and spacing look good

### Tablet (768px - 1023px)
- [ ] Features grid shows 2 columns
- [ ] Process steps remain horizontal or stack (depending on width)
- [ ] Header adjusts appropriately
- [ ] Text remains readable
- [ ] CTA buttons fit properly

### Mobile (<768px)
- [ ] Features grid shows 1 column
- [ ] Process steps stack vertically
- [ ] Header shows hamburger menu
- [ ] Mobile menu opens/closes smoothly
- [ ] Hero text is readable (not too large)
- [ ] Buttons stack vertically in CTAs
- [ ] Footer columns stack
- [ ] No horizontal scrolling
- [ ] Touch targets are large enough (min 44px)

**Test Devices:**
- iPhone (375px width)
- iPad (768px width)
- Desktop (1440px width)

---

## Animation Testing

### Scroll-Triggered Animations (Intersection Observer)
- [ ] Features section animates when scrolling into view
- [ ] Process steps animate with stagger
- [ ] First CTA animates
- [ ] Testimonials section animates
- [ ] Second CTA animates
- [ ] Animations trigger at correct threshold (10% visibility)
- [ ] Animations only play once (not on every scroll)

### Hover Animations
- [ ] Feature cards lift on hover
- [ ] Buttons scale on hover
- [ ] Navigation links have hover effects
- [ ] Testimonial arrows have hover effects
- [ ] Social icons have hover effects

### Auto Animations
- [ ] Hero content animates on page load (staggered entrance)
- [ ] Testimonials auto-advance every 5 seconds
- [ ] Scroll indicator bounces continuously

---

## Interaction Testing

### Navigation
- [ ] Header nav links scroll smoothly to sections
- [ ] "Get Started" button navigates correctly
- [ ] Login dropdown shows correct options
- [ ] All footer links navigate (even if to 404)

### Forms
- [ ] Newsletter signup accepts email input
- [ ] Form validation shows errors for invalid email
- [ ] Submit button is clickable

### Buttons
- [ ] All CTA buttons are clickable
- [ ] Schedule Pickup buttons navigate to `/customer-login`
- [ ] Browse Services buttons navigate to `/services`
- [ ] Call buttons trigger phone app (`tel:` links)
- [ ] Login buttons navigate to correct portals

### Carousel
- [ ] Testimonial carousel responds to arrow clicks
- [ ] Dot indicators change active state
- [ ] Auto-advance works
- [ ] Pause on hover works

---

## Visual Testing

### Design System Compliance
- [ ] Color scheme matches: Blue (#22BBFF) as primary
- [ ] Black/white theme maintained (except marketing sections)
- [ ] Typography: Inter font family
- [ ] Consistent spacing (Tailwind spacing scale)
- [ ] Rounded corners consistent (rounded-2xl, rounded-3xl)

### Glassmorphism Effects
- [ ] Feature cards have frosted glass effect
- [ ] Header has backdrop-blur when scrolled
- [ ] Testimonial card has glass effect
- [ ] Borders are subtle (white/25% opacity)
- [ ] Shadows are soft (not harsh)

### Gradients
- [ ] Hero has radial blue gradient
- [ ] CTA sections have linear blue gradients
- [ ] Gradients are smooth (no banding)

---

## Performance Testing

### Load Times
- [ ] Page loads in under 2 seconds (dev mode)
- [ ] No layout shift during load
- [ ] Images (if added) load progressively

### Smoothness
- [ ] Scrolling is smooth (60fps)
- [ ] Animations don't cause jank
- [ ] No stuttering during auto-advance

### Console Errors
- [ ] No JavaScript errors in console
- [ ] No React warnings
- [ ] No 404 errors for assets

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab key navigates through all interactive elements
- [ ] Focus indicators are visible
- [ ] Enter key activates buttons/links
- [ ] Escape key closes mobile menu

### Screen Reader
- [ ] Headings are in logical order (h1, h2, h3)
- [ ] Alt text exists for icons (aria-labels)
- [ ] Links have descriptive text
- [ ] Form inputs have labels

### Color Contrast
- [ ] Text on white background meets WCAG AA (4.5:1)
- [ ] Text on blue gradient is readable (white text)
- [ ] Button text has sufficient contrast

---

## Cross-Browser Testing

### Chrome
- [ ] All features work
- [ ] Animations smooth
- [ ] No visual bugs

### Firefox
- [ ] All features work
- [ ] Backdrop-blur supported
- [ ] Animations work

### Safari
- [ ] All features work
- [ ] iOS Safari tested
- [ ] Webkit-specific styles work

### Edge
- [ ] All features work
- [ ] Animations smooth

---

## Integration Testing

### Existing Routes
- [ ] `/login` (Staff Login) still works
- [ ] `/customer-login` (Customer Portal) still works
- [ ] Other dashboard routes unaffected

### Environment
- [ ] .env.local variables loading correctly
- [ ] No Firebase errors in console
- [ ] API routes still functional

---

## Known Issues / Notes

### Expected Warnings (Development Mode)
- ESLint warnings (~100+) are expected and ignored during build per next.config.ts
- These do not affect functionality

### Placeholder Content
- Hero video: Using gradient fallback (no video file yet)
- Testimonial avatars: Using initials (no photos yet)
- Service images: None required (using icons and gradients)

### Future Enhancements
- Add hero video once available (see `/public/images/marketing/README.md`)
- Create `/services` page (currently placeholder)
- Create `/contact` page with form
- Add real customer testimonials
- Add professional photography

---

## Bug Reporting Template

If you find any issues during testing, use this format:

```
**Issue:** [Brief description]
**Component:** [Which component/section]
**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
**Actual Behavior:**
**Browser/Device:**
**Screenshot:** [If applicable]
**Priority:** High / Medium / Low
```

---

## Sign-Off

Once all checklist items are complete, the marketing site is ready for production deployment.

**Tested By:** _______________
**Date:** _______________
**Status:** ☐ Pass ☐ Fail ☐ Needs Fixes

---

**Dev Server:** http://localhost:3002
**Production URL:** [To be deployed]
