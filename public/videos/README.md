# Hero Video Guide

This directory contains the hero section background video for the Lorenzo Dry Cleaners marketing website.

---

## Required Files

Place your hero video files here:

- **`hero-video.mp4`** - MP4 format (required, best browser compatibility)
- **`hero-video.webm`** - WebM format (optional, better compression, modern browsers)

---

## Video Specifications

### Recommended Specifications

- **Resolution:** 1920x1080 (Full HD) or 2560x1440 (2K)
- **Aspect Ratio:** 16:9 (landscape)
- **Duration:** 10-30 seconds (looping video works best)
- **Frame Rate:** 24fps or 30fps
- **File Size:**
  - MP4: Under 5MB (target), max 10MB
  - WebM: Under 3MB (target), max 7MB
- **Codec:**
  - MP4: H.264
  - WebM: VP9

### Content Suggestions

The video should showcase:
- Clean, professional dry cleaning facility
- Staff handling garments with care
- Modern equipment and processes
- Happy customers
- Delivery service in action
- Beautiful clothing hanging or folded

**Important:** Keep the video bright and high-contrast so text remains readable even with the overlay.

---

## How the Video Works

### Automatic Fallback

If video files are not present, the hero section will **automatically display a beautiful blue gradient background** instead. The site will work perfectly without the video.

### Overlay Effect

The video has a dark overlay (60-70% opacity) applied to ensure white text remains readable. This creates a cinematic, premium feel.

### Mobile Behavior

- Video plays automatically on desktop and tablets
- Video may be blocked by autoplay policies on mobile (gradient fallback shown)
- Video is optimized for performance with lazy loading

---

## Finding or Creating Your Video

### Option 1: Stock Video

Download professional laundry/dry cleaning videos from:

- **Pexels:** https://www.pexels.com/search/videos/dry%20cleaning/
- **Pixabay:** https://pixabay.com/videos/search/laundry/
- **Unsplash:** https://unsplash.com/s/videos/laundry
- **Videvo:** https://www.videvo.net/

**Search terms:** "dry cleaning", "laundry", "clothing care", "ironing", "fashion", "closet"

### Option 2: Professional Videography

Hire a local videographer to shoot:
- Your actual facility
- Your team in action
- Real customer interactions
- Your delivery service

**Estimated Cost:** $200-500 for a professional shoot

### Option 3: Smartphone Video

Shoot your own video:
- Use a modern smartphone (iPhone 11+, flagship Android)
- Shoot in 1080p or 4K (scale down later)
- Keep the phone steady (use tripod or stabilizer)
- Film during good lighting conditions
- Keep clips short (10-20 seconds)

---

## Optimizing Your Video

### Compression Tools

After getting your video, compress it to reduce file size:

- **Online:**
  - https://www.freeconvert.com/video-compressor
  - https://www.media.io/video-compressor.html

- **Desktop Software:**
  - **HandBrake** (Free, Windows/Mac/Linux) - https://handbrake.fr/
  - **Adobe Media Encoder** (Paid, professional)

### Compression Settings (HandBrake)

**For MP4:**
1. Open HandBrake
2. Load your video file
3. Select "Fast 1080p30" preset
4. Under "Video" tab:
   - Video Codec: H.264 (x264)
   - Framerate: 30fps constant
   - Quality: RF 22-24 (lower number = better quality)
5. Under "Dimensions":
   - Set resolution to 1920x1080
6. Save as `hero-video.mp4`

**For WebM (optional):**
1. Use online converter: https://cloudconvert.com/mp4-to-webm
2. Upload your MP4
3. Select VP9 codec
4. Set quality to 80%
5. Download as `hero-video.webm`

---

## Adding the Video to Your Site

### Step 1: Place Files

Copy your compressed video files to this directory:

```
public/videos/
├── hero-video.mp4    ← Place here
├── hero-video.webm   ← Optional, place here
└── README.md         ← This file
```

### Step 2: Verify Paths

The website is already configured to look for these files:
- `/videos/hero-video.mp4`
- `/videos/hero-video.webm`

### Step 3: Test

1. Start the development server: `npm run dev`
2. Open the site in your browser
3. Video should auto-play in the hero section
4. Check console for any errors

---

## Optional: Poster Image

You can also add a poster image (shown before video loads):

**File:** `public/images/hero-poster.jpg`
**Size:** 1920x1080, optimized JPEG, under 500KB

This is the first frame users see before the video starts playing.

---

## Troubleshooting

### Video Not Playing

**Issue:** Video doesn't appear, only gradient shows
- **Check:** Files are named exactly `hero-video.mp4` (case-sensitive)
- **Check:** Files are in `public/videos/` directory
- **Check:** File size is under 10MB
- **Check:** Browser console for errors (F12)

### Video Too Large / Slow Loading

**Issue:** Page loads slowly, video takes time to appear
- **Solution:** Compress video more aggressively (target 3-5MB)
- **Solution:** Consider removing WebM version (MP4 is enough)
- **Solution:** Reduce resolution to 1280x720

### Video Blocked on Mobile

**Issue:** Video doesn't autoplay on mobile devices
- **Expected:** This is normal browser behavior for data saving
- **Solution:** Already handled - gradient fallback shows automatically

### Poor Video Quality

**Issue:** Video looks pixelated or blurry
- **Solution:** Use higher bitrate when compressing
- **Solution:** Start with higher resolution source (4K → 1080p)
- **Solution:** Ensure source video is high quality

---

## Current Status

**Video Status:** ⏳ Not yet added (using gradient fallback)

**Fallback:** Beautiful blue gradient (#22BBFF) is currently displayed and looks professional.

**Priority:** Medium - Site works great without video, but video adds premium feel.

---

## Performance Notes

### Best Practices Implemented

✅ **Lazy loading** - Video only loads when hero section is visible
✅ **Autoplay muted** - Complies with browser policies
✅ **Multiple formats** - MP4 for compatibility, WebM for efficiency
✅ **Poster image** - Smooth loading experience
✅ **Automatic fallback** - Works without video files
✅ **Mobile optimized** - Responsive and data-conscious

### Expected Impact

- **Page Load:** +0.5-1.5s (depending on file size)
- **Data Usage:** 3-10MB (first visit only, cached after)
- **User Experience:** ⭐⭐⭐⭐⭐ Premium, cinematic feel

---

## Need Help?

**Developer:** Gachengoh Marugu
**Email:** jerry@ai-agentsplus.com
**Phone:** +254 725 462 859

---

**Last Updated:** October 28, 2025
