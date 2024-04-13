# havLightbox

Havoc's Vanilla JavaScript plugin for displaying images in an overlay box.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- Image Counter
- Optional Image Caption
- Thumbnail Selection
- Previous and Next Buttons

## Getting Started

This plugin requires a modern browser that supports JavaScript, HTML5, and CSS3.

### Installation

Download the plugin and place the `dist` folder within your web application. For demonstration purposes, let's assume it is placed in the `root` directory.

Add the following line in the `<head>` tag of your `index.html` file:

```html
<link rel="stylesheet" href="dist/css/havlightbox.min.css">
```

Then, add the following line at the end of your `body` tag:

```html
<script src="dist/js/havlightbox.min.js"></script>
```

### Usage

Create your image galleries like this:

```html
<div class="havlightbox-gallery">
    <img src="image1_thumbnail.png" alt="Image 1" class="havlightbox-thumbnail" data-havlightbox-image="image1.png">
    <img src="image2_thumbnail.png" alt="Image 2" class="havlightbox-thumbnail" data-havlightbox-image="image2.png">
</div>

<div class="havlightbox-gallery">
    <img src="image3_thumbnail.png" alt="Image 3" class="havlightbox-thumbnail" data-havlightbox-image="image3.png">
    <img src="image4_thumbnail.png" alt="Image 4" class="havlightbox-thumbnail" data-havlightbox-image="image4.png">
</div>

<div class="havlightbox-gallery">
    <img src="image5_thumbnail.png" alt="" class="havlightbox-thumbnail" data-havlightbox-image="image5.png">
</div>
```

> Note: The *alt* attributes are used as image captions. Adding an empty *alt* attribute will hide the image caption.

Add the following lines after the galleries:

```html
<div id="havLightbox" class="havlightbox" style="font-family: Arial, sans-serif">
    <div id="havLightboxImageCounter" class="havlightbox-image-counter"></div>
    <span class="havlightbox-close">&times;</span>
    <div class="havlightbox-image-container">
        <img src="" alt="havLightbox Image" id="havLightboxImg">
        <div id="havLightboxCaption" class="havlightbox-caption"></div>
        <div id="havLightboxThumbnailSelection" class="havlightbox-thumbnail-selection"></div>
    </div>
    <button id="havLightboxPrevBtn" class="havlightbox-prev-button">&#10094;</button>
    <button id="havLightboxNextBtn" class="havlightbox-next-button">&#10095;</button>
</div>
```

> Note: The *style* attribute in the **havLightbox** *div* container is defined to set a custom font that is used by the plugin when opening the overlay box.

Here is a complete example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>havLightbox</title>
    <link rel="stylesheet" href="dist/css/havlightbox.min.css">
</head>
<body>
    <!-- Image galleries -->
    <div class="havlightbox-gallery">
        <img src="image1_thumbnail.png" alt="Image 1" class="havlightbox-thumbnail" data-havlightbox-image="image1.png">
        <img src="image2_thumbnail.png" alt="Image 2" class="havlightbox-thumbnail" data-havlightbox-image="image2.png">
    </div>

    <div class="havlightbox-gallery">
        <img src="image3_thumbnail.png" alt="Image 3" class="havlightbox-thumbnail" data-havlightbox-image="image3.png">
        <img src="image4_thumbnail.png" alt="Image 4" class="havlightbox-thumbnail" data-havlightbox-image="image4.png">
    </div>

    <div class="havlightbox-gallery">
        <img src="image5_thumbnail.png" alt="" class="havlightbox-thumbnail" data-havlightbox-image="image5.png">
    </div>

    <!-- havLightbox container -->
    <div id="havLightbox" class="havlightbox" style="font-family: Arial, sans-serif">
        <div id="havLightboxImageCounter" class="havlightbox-image-counter"></div>
        <span class="havlightbox-close">&times;</span>
        <div class="havlightbox-image-container">
            <img src="" alt="havLightbox Image" id="havLightboxImg">
            <div id="havLightboxCaption" class="havlightbox-caption"></div>
            <div id="havLightboxThumbnailSelection" class="havlightbox-thumbnail-selection"></div>
        </div>
        <button id="havLightboxPrevBtn" class="havlightbox-prev-button">&#10094;</button>
        <button id="havLightboxNextBtn" class="havlightbox-next-button">&#10095;</button>
    </div>

    <script src="dist/js/havlightbox.min.js"></script>
</body>
</html>
```

## Contributing

Feel free to suggest features or report issues. However, please note that pull requests will not be accepted.

## License

Copyright &copy; 2024 Ren&eacute; Nicolaus

This plugin is released under the [MIT license](/LICENSE).
