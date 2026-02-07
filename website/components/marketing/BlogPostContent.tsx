/**
 * BlogPostContent Component
 *
 * Main content area for blog post pages.
 * Features: rich text content with proper typography and styling.
 *
 * @module components/marketing/BlogPostContent
 */

'use client';

import { cn } from '@/lib/utils';

interface BlogPostContentProps {
  content: React.ReactNode;
}

export function BlogPostContent({ content }: BlogPostContentProps) {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* Light Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-lorenzo-accent-teal-50 to-white" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div
            className={cn(
              'prose prose-lg max-w-none',
              'prose-headings:text-black prose-headings:font-bold',
              'prose-p:text-gray-700 prose-p:leading-relaxed',
              'prose-a:text-lorenzo-accent-teal prose-a:no-underline hover:prose-a:underline',
              'prose-strong:text-black prose-strong:font-bold',
              'prose-ul:text-gray-700 prose-ol:text-gray-700',
              'prose-li:marker:text-lorenzo-accent-teal',
              'prose-blockquote:border-l-lorenzo-accent-teal prose-blockquote:bg-lorenzo-accent-teal-50 prose-blockquote:rounded-r-xl prose-blockquote:py-4',
              'prose-img:rounded-2xl prose-img:shadow-lg'
            )}
          >
            {content}
          </div>
        </div>
      </div>
    </section>
  );
}

// Default sample content for demonstration
export const sampleBlogContent = (
  <>
    <h2>Introduction</h2>
    <p>
      Welcome to our comprehensive guide on professional garment care. Whether you're a busy
      professional, a fashion enthusiast, or simply someone who wants their clothes to last longer,
      this article will provide you with expert insights and practical tips.
    </p>

    <h2>Understanding Fabric Types</h2>
    <p>
      Different fabrics require different care approaches. Here are the main categories you should
      be aware of:
    </p>

    <h3>Natural Fibers</h3>
    <ul>
      <li>
        <strong>Cotton:</strong> Durable and breathable, but prone to shrinking if not washed
        properly
      </li>
      <li>
        <strong>Wool:</strong> Requires gentle care and should be dry cleaned for best results
      </li>
      <li>
        <strong>Silk:</strong> Delicate and requires professional cleaning for optimal care
      </li>
      <li>
        <strong>Linen:</strong> Strong but wrinkles easily, benefits from professional pressing
      </li>
    </ul>

    <h3>Synthetic Fibers</h3>
    <ul>
      <li>
        <strong>Polyester:</strong> Easy to care for, resistant to wrinkles and shrinking
      </li>
      <li>
        <strong>Nylon:</strong> Durable and quick-drying, but can be damaged by high heat
      </li>
      <li>
        <strong>Rayon:</strong> Versatile but requires careful cleaning to prevent damage
      </li>
    </ul>

    <h2>Professional Dry Cleaning vs. Home Washing</h2>
    <p>
      While home washing is convenient for everyday items, professional dry cleaning offers several
      advantages for certain garments:
    </p>

    <blockquote>
      <p>
        "Professional dry cleaning uses specialized solvents and techniques that are much gentler on
        delicate fabrics than traditional water-based washing. This helps preserve the color,
        texture, and shape of your garments for years to come."
      </p>
    </blockquote>

    <h3>When to Choose Dry Cleaning</h3>
    <ol>
      <li>Suits, blazers, and formal wear</li>
      <li>Delicate fabrics like silk, wool, and cashmere</li>
      <li>Garments with intricate details or embellishments</li>
      <li>Items with "Dry Clean Only" labels</li>
      <li>Heavily soiled or stained items that need special treatment</li>
    </ol>

    <h2>Stain Removal Tips</h2>
    <p>
      Quick action is crucial when dealing with stains. Here are some expert tips for common stain
      types:
    </p>

    <h3>For Oil-Based Stains</h3>
    <p>
      Blot (don't rub) the stain immediately with a clean cloth. Apply a small amount of dish soap
      or specialized stain remover, then bring the garment to us for professional cleaning.
    </p>

    <h3>For Water-Based Stains</h3>
    <p>
      Rinse with cold water from the back of the fabric to push the stain out. Avoid hot water, as
      it can set many types of stains permanently.
    </p>

    <h2>Storage and Maintenance</h2>
    <p>Proper storage is just as important as proper cleaning. Follow these guidelines:</p>

    <ul>
      <li>Always clean garments before storing them for extended periods</li>
      <li>Use breathable garment bags, not plastic, for long-term storage</li>
      <li>Hang items on proper hangers to maintain their shape</li>
      <li>Store in a cool, dry place away from direct sunlight</li>
      <li>Use cedar blocks or lavender sachets instead of mothballs</li>
    </ul>

    <h2>Conclusion</h2>
    <p>
      Taking care of your garments doesn't have to be complicated. By understanding your fabrics,
      knowing when to seek professional help, and following proper storage practices, you can keep
      your wardrobe looking fresh and new for years to come.
    </p>

    <p>
      At Lorenzo Dry Cleaners, we're committed to providing the highest quality garment care
      services in Nairobi. Our experienced team uses eco-friendly practices and state-of-the-art
      equipment to ensure your clothes receive the care they deserve.
    </p>

    <p>
      Have questions about caring for a specific garment? Contact us today or visit any of our 21+
      branches across Nairobi for expert advice and service you can trust.
    </p>
  </>
);
