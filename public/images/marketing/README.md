# Marketing Assets

This folder contains all images and media files for the marketing website.

## Required Assets

### Hero Video (Optional)
**Location:** `/public/videos/`
- `hero-video.mp4` - MP4 format (recommended: H.264, < 5MB)
- `hero-video.webm` - WebM format (better compression, < 5MB)
- `hero-poster.jpg` - Poster image shown before video loads (1920x1080)

**Current Status:** Using gradient background fallback (no video required initially)

---

### Service Images
**Location:** `/public/images/marketing/`

#### Required Images:
1. **General Service Photos** (6-8 images recommended)
   - `service-dry-cleaning.jpg` - Professional dry cleaning
   - `service-wash-fold.jpg` - Wash and fold service
   - `service-express.jpg` - Express 24-hour service
   - `service-delivery.jpg` - Pickup and delivery
   - `facility-exterior.jpg` - Business exterior
   - `facility-interior.jpg` - Equipment/workspace
   - `staff-team.jpg` - Team photo (optional)
   - `quality-check.jpg` - Quality inspection

#### Image Specifications:
- Format: JPG or WebP
- Dimensions: 1200x800px (3:2 ratio)
- File size: < 500KB each (compressed)
- Quality: High resolution, professional

---

### Testimonial Placeholders
**Location:** `/public/images/marketing/`

Currently using initials as avatars. Optional real photos:
- `testimonial-1.jpg` to `testimonial-5.jpg`
- Dimensions: 400x400px (square)
- Format: JPG or WebP
- File size: < 200KB each

**Current Status:** Using initials in colored circles (no photos required)

---

### Brand Assets
**Location:** `/public/images/`

#### Logo:
- `logo.svg` - Vector logo (preferred)
- `logo.png` - PNG logo (2000x2000px transparent)
- `logo-white.svg` - White version for dark backgrounds
- `favicon.ico` - Browser icon (32x32px)

**Current Status:** Using text logo "Lorenzo" (no image logo required)

---

## Asset Sources

### Where to Get Assets:

#### 1. Professional Photography (Recommended)
- Hire a photographer for 2-3 hours
- Cost: ~KES 10,000 - 20,000
- Best quality and authenticity

#### 2. Stock Photos (Budget-Friendly)
- [Unsplash](https://unsplash.com) - Free high-quality photos
- [Pexels](https://pexels.com) - Free stock photos
- [Freepik](https://freepik.com) - Free with attribution
- Search terms: "dry cleaning", "laundry service", "garment care", "professional cleaning"

#### 3. AI-Generated (Quick Solution)
- [Midjourney](https://midjourney.com) - AI image generation
- [DALL-E](https://openai.com/dall-e-2) - AI image generation
- Prompt example: "Professional dry cleaning service interior, bright modern facility, high quality equipment, clean and organized, photorealistic"

---

## Image Optimization

Before adding images to this folder:

1. **Compress images:**
   - Use [Squoosh](https://squoosh.app/) - Free online compressor
   - Or [TinyPNG](https://tinypng.com/) - PNG/JPG compressor
   - Target: < 500KB per image

2. **Convert to WebP:**
   - Better compression than JPG
   - Next.js Image component handles conversion automatically

3. **Name images consistently:**
   - Use lowercase
   - Use hyphens for spaces
   - Be descriptive: `service-dry-cleaning.jpg` not `img1.jpg`

---

## Priority

**Must-Have (High Priority):**
- ✅ None required for initial launch (using gradients and placeholders)

**Nice-to-Have (Medium Priority):**
- Hero video (adds premium feel)
- Service photos (shows real facility)
- Team photos (builds trust)

**Optional (Low Priority):**
- Testimonial photos (initials work fine)
- Additional service photos
- Process step illustrations

---

## Next Steps

1. **Phase 1 (Launch):** Use current setup (gradients + placeholders)
2. **Phase 2 (Enhancement):** Add hero video and service photos
3. **Phase 3 (Polish):** Add team photos and testimonials
4. **Phase 4 (Optimization):** Professional photography session

The website is **fully functional without any images** thanks to our gradient backgrounds and icon-based design!
