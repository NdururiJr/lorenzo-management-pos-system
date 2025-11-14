# Email Templates

This directory contains React Email templates for the Lorenzo Dry Cleaners application.

## Templates

### 1. `password-reset.tsx`
Sent when a user requests a password reset.
- Secure reset link (expires in 1 hour)
- Security warning if not requested
- Clean, professional design

### 2. `order-confirmation.tsx`
Sent when a new order is created.
- Order details summary
- Estimated completion date
- Track order button
- Branch contact information

### 3. `order-status-update.tsx`
Sent when an order's status changes.
- Color-coded status badge
- Status timeline visualization
- Custom status message
- Track order link

### 4. `receipt.tsx`
Sent when a payment is processed.
- Payment breakdown
- Outstanding balance warning (if applicable)
- PDF attachment support
- Payment method display

## Design System

All templates follow the Lorenzo Dry Cleaners design system:

- **Colors:**
  - Black (#000000) for headers and primary text
  - White (#FFFFFF) for backgrounds
  - Gray scale for secondary elements
  - Green (#10B981) for success
  - Amber (#F59E0B) for warnings
  - Red (#EF4444) for errors
  - Blue (#3B82F6) for links

- **Typography:**
  - System fonts (Apple/Google/Windows compatible)
  - Clear hierarchy with appropriate font sizes
  - High contrast for readability

- **Layout:**
  - Max width: 600px (email-safe)
  - Mobile-responsive design
  - Generous whitespace
  - Clear call-to-action buttons

## Preview Templates Locally

Install React Email CLI globally (optional):

```bash
npm install -g @react-email/cli
```

Then preview templates:

```bash
cd /home/user/lorenzo-dry-cleaners
npx email dev
```

This opens a browser at `http://localhost:3000` with live preview of all templates.

## Testing Templates

Use the test script to send test emails:

```bash
# Test all templates
npm run test:email -- --send-all your-email@example.com

# Test individual templates
npm run test:email -- --send-password-reset your-email@example.com
npm run test:email -- --send-order-confirmation your-email@example.com
npm run test:email -- --send-status-update your-email@example.com
npm run test:email -- --send-receipt your-email@example.com
```

## Customizing Templates

### Editing Templates

1. Open the template file in your editor
2. Modify the JSX and styles
3. Preview with `npx email dev`
4. Test with `npm run test:email`
5. Deploy changes

### Creating New Templates

1. Create new `.tsx` file in `/emails` directory
2. Use existing templates as reference
3. Follow React Email component structure
4. Add new function in `/services/email.ts`
5. Test thoroughly before deploying

## React Email Components

Available components from `@react-email/components`:

- `<Html>` - Root email element
- `<Head>` - Email head (for styles)
- `<Preview>` - Preview text shown in inbox
- `<Body>` - Email body
- `<Container>` - Max-width container
- `<Section>` - Layout section
- `<Row>` / `<Column>` - Grid layout
- `<Heading>` - Heading elements
- `<Text>` - Paragraph text
- `<Button>` - Call-to-action button
- `<Link>` - Hyperlink
- `<Hr>` - Horizontal rule
- `<Img>` - Images (use absolute URLs)

## Best Practices

1. **Always test in multiple email clients:**
   - Gmail (web and mobile)
   - Outlook (desktop and web)
   - Apple Mail (macOS and iOS)
   - Yahoo Mail

2. **Keep file sizes small:**
   - Avoid large images
   - Inline critical CSS
   - Minimize HTML

3. **Use inline styles:**
   - Email clients don't support external CSS
   - React Email handles this automatically

4. **Provide plain text alternative:**
   - Some email clients prefer plain text
   - Improves deliverability

5. **Test links:**
   - Use absolute URLs (not relative)
   - Test all buttons and links
   - Include tracking parameters if needed

6. **Accessibility:**
   - Use semantic HTML
   - Provide alt text for images
   - Ensure good color contrast
   - Use readable font sizes (14px minimum)

## Email Client Compatibility

Templates are tested and compatible with:

- ✅ Gmail (web, iOS, Android)
- ✅ Outlook (2013+, Office 365, web)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Thunderbird

## Resources

- [React Email Documentation](https://react.email/docs)
- [Email HTML Best Practices](https://www.caniemail.com/)
- [Email Design Inspiration](https://reallygoodemails.com/)

---

Last Updated: November 14, 2025
