/*!
 * havLightbox v0.1 (https://www.havocspage.net)
 * Copyright 2024 René Nicolaus
 * Licensed under MIT (https://github.com/Havoc2/havLightbox/blob/main/LICENSE)
 */

document.addEventListener('DOMContentLoaded', (event) => {
  function openHavLightbox(gallery, imageSrc) {
    if (!gallery) {
      console.error('Gallery element not found.');
      return;
    }

    // Convert relative image source to absolute image source
    var absoluteImageSource = new URL(imageSrc, window.location.href).href;

    var havLightbox = document.querySelector('.havlightbox');
    var havLightboxImgContainer = havLightbox.querySelector('.havlightbox-image-container');
    var havLightboxImg = havLightboxImgContainer.querySelector('img');
    var havLightboxCaption = havLightbox.querySelector('.havlightbox-caption');
    var havLightboxImageCounter = havLightbox.querySelector('.havlightbox-image-counter');
    var havLightboxThumbnailSelection = havLightbox.querySelector('.havlightbox-thumbnail-selection');

    // Check if essential elements exist
    if (!havLightbox || !havLightboxImgContainer || !havLightboxImg || !havLightboxCaption || !havLightboxImageCounter || !havLightboxThumbnailSelection) {
      console.error('Essential elements not found for this gallery.');
      return;
    }

    var havLightboxImages = [];
    var havLightboxCaptions = [];
    var havLightboxCurrentImageIndex = 0;

    // Populate arrays with image sources and captions for this gallery
    var havLightboxThumbnails = gallery.querySelectorAll('.havlightbox-thumbnail');
    havLightboxThumbnails.forEach((havLightboxThumbnail) => {
      havLightboxImages.push(new URL(havLightboxThumbnail.dataset.havlightboxImage, window.location.href).href);
      havLightboxCaptions.push(havLightboxThumbnail.getAttribute('alt'));
    });

    // Set current image index by matching the image source for this gallery
    havLightboxCurrentImageIndex = havLightboxImages.indexOf(absoluteImageSource);

    if (havLightboxCurrentImageIndex === -1) {
      console.error('Image source not found in the images array.');
      return;
    }

    havLightbox.style.display = 'block';
    havLightboxImg.src = absoluteImageSource;
    havLightboxCaption.innerText = havLightboxCaptions[havLightboxCurrentImageIndex];
    havLightboxImageCounter.innerText = (havLightboxCurrentImageIndex + 1) + ' / ' + havLightboxImages.length;

    havLightboxThumbnailSelection.innerHTML = '';
    havLightboxImages.forEach((imageUrl, index) => {
      var thumbnail = document.createElement('img');
      thumbnail.src = imageUrl;
      thumbnail.alt = (index + 1);
      thumbnail.classList.add('havlightbox-thumbnail-selection-item');
      if (index === havLightboxCurrentImageIndex) {
        thumbnail.classList.add('selected');
      }
      thumbnail.addEventListener('click', () => {
        var clickedIndex = Array.from(thumbnail.parentNode.children).indexOf(thumbnail);
        if (clickedIndex !== havLightboxCurrentImageIndex) {
          havLightboxCurrentImageIndex = clickedIndex;
          document.querySelectorAll('.havlightbox-thumbnail-selection-item').forEach((item) => {
            item.classList.remove('selected');
          });
          thumbnail.classList.add('selected');
          havLightboxImg.src = havLightboxImages[havLightboxCurrentImageIndex];
          havLightboxCaption.innerText = havLightboxCaptions[havLightboxCurrentImageIndex];
          havLightboxImageCounter.innerText = (havLightboxCurrentImageIndex + 1) + ' / ' + havLightboxImages.length;
        }
      });
      havLightboxThumbnailSelection.appendChild(thumbnail);
    });

    havLightbox.addEventListener('click', (event) => {
      if (event.target === havLightbox) {
        closeHavLightbox();
      }
    });

    setTimeout(() => {
      havLightbox.classList.add('open');
    }, 50);

    var havLightboxPrevBtn = havLightbox.querySelector('.havlightbox-prev-button');
    var havLightboxNextBtn = havLightbox.querySelector('.havlightbox-next-button');

    havLightboxPrevBtn.addEventListener('click', () => {
      --havLightboxCurrentImageIndex;
      if (havLightboxCurrentImageIndex < 0) {
        havLightboxCurrentImageIndex = havLightboxImages.length - 1;
      }

      havLightboxImg.src = havLightboxImages[havLightboxCurrentImageIndex];
      havLightboxCaption.innerText = havLightboxCaptions[havLightboxCurrentImageIndex];
      havLightboxImageCounter.innerText = (havLightboxCurrentImageIndex + 1) + ' / ' + havLightboxImages.length;

      updateHavLightboxThumbnailSelectionItems(havLightboxCurrentImageIndex);
      updateHavLightboxButtons(havLightbox, havLightboxImages);
    });

    havLightboxNextBtn.addEventListener('click', () => {
      ++havLightboxCurrentImageIndex;
      if (havLightboxCurrentImageIndex >= havLightboxImages.length) {
        havLightboxCurrentImageIndex = 0;
      }

      havLightboxImg.src = havLightboxImages[havLightboxCurrentImageIndex];
      havLightboxCaption.innerText = havLightboxCaptions[havLightboxCurrentImageIndex];
      havLightboxImageCounter.innerText = (havLightboxCurrentImageIndex + 1) + ' / ' + havLightboxImages.length;

      updateHavLightboxThumbnailSelectionItems(havLightboxCurrentImageIndex);
      updateHavLightboxButtons(havLightbox, havLightboxImages);
    });

    updateHavLightboxImageCounter(havLightbox, havLightboxImages);
    updateHavLightboxThumbnailSelection(havLightbox, havLightboxImages);
    updateHavLightboxButtons(havLightbox, havLightboxImages);
  }

  function closeHavLightbox() {
    var havLightbox = document.querySelector('.havlightbox');
    var havLightboxImg = havLightbox.querySelector('.havlightbox-image-container img');
    var havLightboxCaption = havLightbox.querySelector('.havlightbox-caption');
    var havLightboxImageCounter = havLightbox.querySelector('.havlightbox-image-counter');

    havLightbox.classList.remove('open');

    var havLightboxPrevBtn = havLightbox.querySelector('.havlightbox-prev-button');
    var havLightboxNextBtn = havLightbox.querySelector('.havlightbox-next-button');
    havLightboxPrevBtn.style.display = 'none';
    havLightboxNextBtn.style.display = 'none';

    havLightboxCaption.innerText = '';
    havLightboxImageCounter.innerText = '';

    havLightbox.querySelectorAll('.havlightbox-thumbnail-selection-item').forEach((item) => {
      item.classList.remove('selected');
    });

    setTimeout(() => {
      havLightboxImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      havLightbox.style.display = 'none';
    }, 500);
  }

  function updateHavLightboxButtons(havLightbox, havLightboxImages) {
    var havLightboxPrevBtn = havLightbox.querySelector('.havlightbox-prev-button');
    var havLightboxNextBtn = havLightbox.querySelector('.havlightbox-next-button');
    if (havLightboxImages.length < 2) {
      havLightboxPrevBtn.style.display = 'none';
      havLightboxNextBtn.style.display = 'none';
    } else {
      havLightboxPrevBtn.style.display = 'block';
      havLightboxNextBtn.style.display = 'block';
    }
  }

  function updateHavLightboxImageCounter(havLightbox, havLightboxImages) {
    var havLightboxImageCounter = havLightbox.querySelector('.havlightbox-image-counter');
    if (havLightboxImages.length < 2) {
      havLightboxImageCounter.style.display = 'none';
    } else {
      havLightboxImageCounter.style.display = 'block';
    }
  }

  function updateHavLightboxThumbnailSelection(havLightbox, havLightboxImages) {
    var havLightboxThumbnailSelection = havLightbox.querySelector('.havlightbox-thumbnail-selection');
    if (havLightboxImages.length < 2) {
      havLightboxThumbnailSelection.style.display = 'none';
    } else {
      havLightboxThumbnailSelection.style.display = 'flex';
    }
  }

  function updateHavLightboxThumbnailSelectionItems(havLightboxCurrentImageIndex) {
    // Update selection highlight for thumbnails
    document.querySelectorAll('.havlightbox-thumbnail-selection-item').forEach((item, index) => {
      if (index === havLightboxCurrentImageIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  var havLightboxGalleries = document.querySelectorAll('.havlightbox-gallery');

  // Add click event listener to each image in each gallery
  havLightboxGalleries.forEach(havLightboxGallery => {
    var havLightboxThumbnails = havLightboxGallery.querySelectorAll('.havlightbox-thumbnail');
    havLightboxThumbnails.forEach(havLightboxThumbnail => {
      havLightboxThumbnail.addEventListener('click', () => {
        openHavLightbox(havLightboxGallery, havLightboxThumbnail.dataset.havlightboxImage);
      });
    });
  });

  // Function to close havLightbox with escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeHavLightbox();
    }
  });

  // Add event listener to close button for havLightbox
  var havLightboxCloseButton = document.querySelector('.havlightbox-close');
  havLightboxCloseButton.addEventListener('click', closeHavLightbox);
});
