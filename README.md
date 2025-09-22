# havLightbox

Havoc's Vanilla JavaScript plugin for displaying images in an overlay lightbox.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Modern Dialog API**: Uses native HTML `<dialog>` element for better accessibility
- **Responsive Design**: Automatically adapts to different screen sizes and orientations
- **Touch Support**: Swipe gestures for navigation on mobile devices
- **Keyboard Navigation**: Arrow keys for previous / next navigation
- **Image Counter**: Shows current position in gallery (e.g., "1 / 3")
- **Optional Captions**: Display custom captions for each image
- **Smooth Animations**: CSS-based animations for opening / closing
- **Theme Support**: Automatic light / dark theme detection
- **Zero Dependencies**: Pure vanilla JavaScript, no external libraries required

## Getting Started

This plugin requires a modern browser that supports JavaScript ES6+, HTML5 `<dialog>` element, and CSS3.

### Installation

Download the plugin files and include them in your project:

```html
<link rel="stylesheet" href="dist/css/havLightbox.css">
<script src="dist/js/havLightbox.js"></script>
```

### Usage

#### Method 1: Simple Image Array

```javascript
// Initialize havLightbox (optional - will auto-initialize on first use)
havLightboxInit();

const images = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg'
];

havLightboxOpen('My Gallery', images, 0);
```

#### Method 2: Images with Captions

```javascript
const imagesWithCaptions = [
  { src: 'image1.jpg', caption: 'Image 1' },
  { src: 'image2.jpg', caption: 'Image 2' },
  { src: 'image3.jpg', caption: 'Image 3' }
];

havLightboxOpen('My Gallery', imagesWithCaptions, 0);
```

#### Method 3: Click Handler Integration

```html
<img src="thumbnail1.jpg" alt="Thumbnail 1" onclick="openGallery(0)">
<img src="thumbnail2.jpg" alt="Thumbnail 2" onclick="openGallery(1)">
<img src="thumbnail3.jpg" alt="Thumbnail 3" onclick="openGallery(2)">

<script>
const images = [
  { src: 'image1.jpg', caption: 'Image 1' },
  { src: 'image2.jpg', caption: 'Image 2' },
  { src: 'image3.jpg', caption: 'Image 3' }
];

function openGallery(index) {
  havLightboxOpen('My Gallery', images, index);
}
</script>
```

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>havLightbox</title>
  <link rel="stylesheet" href="dist/css/havLightbox.css">
</head>
<body>
  <h1>My Gallery</h1>

  <div class="gallery">
    <img src="thumbnail1.jpg" alt="Thumbnail 1" onclick="openGallery(0)" style="cursor: pointer; margin: 5px;">
    <img src="thumbnail2.jpg" alt="Thumbnail 2" onclick="openGallery(1)" style="cursor: pointer; margin: 5px;">
    <img src="thumbnail3.jpg" alt="Thumbnail 3" onclick="openGallery(2)" style="cursor: pointer; margin: 5px;">
  </div>

  <script src="dist/js/havLightbox.js"></script>
  <script>
      const images = [
        { src: 'image1.jpg', caption: 'Image 1' },
        { src: 'image2.jpg', caption: 'Image 2' },
        { src: 'image3.jpg', caption: 'Image 3' }
      ];

      function openGallery(startIndex) {
        havLightboxOpen('My Gallery', images, startIndex);
      }
  </script>
</body>
</html>
```

## API Reference

### Global Functions

#### `havLightboxInit(options)`
Initializes havLightbox with optional configuration.

**Parameters:**
- `options` (Object, optional): Configuration options
  - `titleFallback` (String): Default title when none provided (default: "havlightbox")
  - `template` (String): Custom HTML template for the havLightbox dialog structure
  - `document` (Document): Document object to use (default: `window.document`)

**Returns:** havLightbox instance object

#### `havLightboxOpen(title, images, startIndex, options)`
Opens havLightbox with specified images.

**Parameters:**
- `title` (String): Title to display in the header
- `images` (Array): Array of image sources (strings or objects with `src` and `caption`)
- `startIndex` (Number, optional): Index of image to start with (default: 0)
- `options` (Object, optional): Configuration options (same as `havLightboxInit`)

#### `havLightboxClose()`
Closes the currently open havLightbox.

#### `havLightboxUpdateLayout()`
Manually triggers a layout update (useful after dynamic content changes).

#### `havLightboxGetCurrentIndex()`
Returns the current image index.

**Returns:** Number - Current image index

#### `havLightboxGetImages()`
Returns a copy of the current images array.

**Returns:** Array - Copy of current images

### Navigation

- **Keyboard**: Use left / right arrow keys to navigate
- **Touch**: Swipe left / right on mobile devices
- **Mouse**: Click the navigation buttons (&larr; &rarr;)
- **Close**: Click the &times; button, press Escape, or click the backdrop

### Theme Support

havLightbox automatically detects and adapts to light / dark themes based on:
- `data-theme` attribute on `:root` or `body`
- CSS classes: `.theme-dark`, `.theme-light`, `.dark-mode`, `.light-mode`
- System preference via `prefers-color-scheme`

## Contributing

Feel free to suggest features or report issues. However, please note that pull requests will not be accepted.

## License

Copyright &copy; 2024-2025 Ren&eacute; Nicolaus

This plugin is released under the [MIT license](LICENSE).