# Email HTML Editor System

A hybrid email template and visual editor system for creating and customizing professional HTML email newsletters. Built for the Ganance Heir smartwatch campaign, this system provides both a production-ready email template and an interactive web-based editor for visual customization.

## Features

- **Visual Email Editor**: Real-time WYSIWYG editor with live preview
- **Customizable Themes**: Easy color and typography customization
- **Image Management**: Upload custom images or generate them with AI
- **AI Image Generation**: Generate images using DALL-E, Unsplash, or placeholders
- **Responsive Design**: Mobile-first approach with preview controls for different screen sizes
- **Email-Compatible HTML**: Table-based layout with inline styles for maximum email client compatibility
- **Configuration System**: Save and load theme configurations as JSON files (including images)
- **Component Toggle**: Show/hide email sections as needed
- **Export Functionality**: Download production-ready HTML with embedded images

## Project Structure

```
Email-HTML/
├── email-template.html      # Production-ready email template
├── editor.html              # Visual editor interface
├── editor.js                # Editor functionality and logic
├── editor.css               # Editor interface styles
├── config.json              # Default configuration file
├── images/                  # Image assets directory
│   └── .gitkeep
└── README.md                # This file
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (optional, but recommended for best results)

### Installation

1. Clone or download this repository
2. Add your image assets to the `images/` directory
3. Open `editor.html` in your web browser

### Using a Local Server (Recommended)

For the best experience, especially to avoid CORS issues with the iframe preview, serve the files using a local web server:

**Option 1: Using Python**
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option 2: Using Node.js**
```bash
npx http-server -p 8000
```

Then navigate to `http://localhost:8000/editor.html`

## Usage Guide

### Using the Visual Editor

1. **Open the Editor**: Open `editor.html` in your browser
2. **Customize Colors**: Use the color pickers in the "Colors" section to adjust your theme
3. **Change Typography**: Select different fonts for headings and body text
4. **Edit Content**: Update text content in the "Content" section
5. **Manage Images**: Upload or generate images (see Image Management below)
6. **Toggle Components**: Show or hide email sections using the "Components" checkboxes
7. **Preview Responsively**: Test your email at different screen sizes (Desktop/Tablet/Mobile)
8. **Export HTML**: Click "Export HTML" to download your customized email template

### Image Management

The editor provides two ways to add images to your email template:

#### Uploading Images

1. Click the **Upload** button next to any image control
2. Select an image file from your computer
3. The image will be converted to base64 and embedded in the email
4. Preview updates automatically

#### Generating Images with AI

1. Click the **Generate** button next to any image control
2. Enter a descriptive prompt for the image you want
3. Choose a generation service:
   - **Placeholder** (Free): Creates a simple colored placeholder
   - **Unsplash** (Free): Searches Unsplash for matching stock photos
   - **DALL-E** (Requires API Key): Generates custom AI images using OpenAI's DALL-E
4. Click **Generate Image**
5. The generated image will be embedded in your email

**Note about DALL-E**: To use DALL-E, you need an OpenAI API key:
- Sign up at [platform.openai.com](https://platform.openai.com)
- Create an API key in your account settings
- Enter it in the editor when generating images
- Your API key is stored locally and only sent to OpenAI

**Supported Images**:
- Hero Image (600x400px recommended)
- Product Detail Image (270x270px recommended)
- Feature Icons (60x60px each)

All images are automatically converted to base64 format and embedded directly in the HTML, ensuring they display in email clients without requiring external hosting.

### Saving and Loading Configurations

**Save Configuration:**
1. Customize your email template
2. Click "Save Config" button
3. A JSON file will be downloaded with your current settings

**Load Configuration:**
1. Click "Load Config" button
2. Select a previously saved JSON configuration file
3. Your settings will be applied automatically

### Configuration File Format

The `config.json` file uses the following structure:

```json
{
  "colors": {
    "primary": "#000000",
    "secondary": "#ffffff",
    "text": "#333333",
    "background": "#ffffff"
  },
  "fonts": {
    "heading": "'Helvetica Neue', Helvetica, Arial, sans-serif",
    "body": "'Helvetica Neue', Helvetica, Arial, sans-serif"
  },
  "content": {
    "logoText": "GANANCE",
    "heroTitle": "MAKE YOUR FAVORITE\nWATCH SMART",
    "productName": "Ganance Heir (Pre-Order)",
    "productDescription": "...",
    "ctaText": "PRE-ORDER NOW",
    "featuresTitle": "Your Style. Our Tech."
  },
  "components": {
    "header": true,
    "hero": true,
    "productIntro": true,
    "productDetail": true,
    "features": true,
    "footer": true
  },
  "images": {
    "hero-image": "data:image/jpeg;base64,...",
    "product-image": "data:image/jpeg;base64,...",
    "feature-icon-1": "data:image/png;base64,...",
    "feature-icon-2": "data:image/png;base64,...",
    "feature-icon-3": "data:image/png;base64,..."
  }
}
```

**Note**: Images are stored as base64-encoded data URLs. Config files with images may be large (500KB - 2MB depending on image sizes).

## Email Template Structure

The email template includes the following sections:

1. **Header**: Company logo and branding
2. **Hero Section**: Large banner with overlay text
3. **Product Introduction**: Product name, description, and CTA button
4. **Product Details**: Product specifications with image
5. **Features Section**: Three-column feature cards
6. **Footer**: Social media links and copyright

All sections use:
- Table-based layout for email client compatibility
- Inline CSS styles
- CSS custom properties (converted to inline on export)
- Data attributes for easy editing
- Responsive design with media queries

## Working with Images

The editor provides built-in image management, so you don't need to manually add images to the `images/` directory. Instead, use the visual editor to:

- **Upload your own images**: Click "Upload" buttons in the Images section
- **Generate AI images**: Click "Generate" buttons to create images from text prompts

Images are automatically embedded as base64 data in the exported HTML, eliminating the need for external hosting.

### Image Specifications

For best results, use these dimensions:
- **Hero image**: 600px width minimum (maintains aspect ratio)
- **Product detail**: 270x270px (square)
- **Feature icons**: 60x60px (small squares)

### External Image Hosting (Optional)

If you prefer to host images externally instead of embedding them:

1. Upload images to your hosting service (CDN, web server, etc.)
2. Get the public URL for each image
3. Manually edit the exported HTML to replace base64 data with URLs

## Email Client Compatibility

This template is designed for maximum compatibility with email clients:

- **Gmail**: Full support
- **Outlook**: Table-based layout ensures proper rendering
- **Apple Mail**: Full support
- **Yahoo Mail**: Full support
- **Mobile clients**: Responsive design adapts to screen size

### Best Practices

- Always test your email in multiple email clients before sending
- Use inline styles (automatically done on export)
- Keep total width at 600px for desktop view
- Avoid JavaScript and complex CSS
- Use web-safe fonts or font stacks
- Host images on a reliable CDN

## Customization

### Modifying the Template

To add new sections or modify the template:

1. Edit `email-template.html`
2. Add `data-component` attributes to new sections
3. Add `data-editable` attributes to editable elements
4. Update `editor.html` to include controls for new elements
5. Update `editor.js` to handle new controls

### Styling the Editor

To customize the editor interface:

1. Edit `editor.css`
2. Modify colors, fonts, or layout as needed
3. The editor uses a purple gradient theme by default

## Technical Details

### CSS Variables

The template uses CSS custom properties for theming:
- `--primary-color`: Primary brand color
- `--secondary-color`: Secondary/background color
- `--text-color`: Body text color
- `--background-color`: Email background color
- `--heading-font`: Font family for headings
- `--body-font`: Font family for body text

### JavaScript Architecture

The `EmailEditor` class handles:
- Live preview updates via iframe communication
- Color picker synchronization
- Content editing
- Component visibility toggling
- Responsive preview controls
- Configuration save/load
- HTML export with inline style conversion

## Troubleshooting

### Preview Not Updating

If the live preview isn't working:
- Ensure you're using a local web server
- Check browser console for CORS errors
- Refresh the page and try again

### Export Issues

If HTML export fails:
- Check that all required fields have values
- Ensure browser allows file downloads
- Try using a different browser

### Images Not Showing

If images don't appear:
- Verify image files exist in the `images/` directory
- Check image file names match template references
- Ensure images are in a supported format (JPG, PNG, GIF)

## License

This project is provided as-is for use in email marketing campaigns.

## Contributing

To contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions, please refer to:
- HTML email best practices: [htmlemailcheck.com](https://www.htmlemailcheck.com/check/)
- Email client compatibility: [caniemail.com](https://www.caniemail.com/)

## Changelog

### Version 1.1.0
- Added image upload functionality
- Added AI image generation with multiple services (Placeholder, Unsplash, DALL-E)
- Images now embedded as base64 in exported HTML
- Image preview thumbnails in editor
- Images included in configuration save/load

### Version 1.0.0
- Initial release
- Visual editor with live preview
- Color and typography customization
- Configuration save/load
- HTML export functionality
- Responsive preview controls
- Component visibility toggles
