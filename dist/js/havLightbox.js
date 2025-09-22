/*!
 * havLightbox v0.3 (https://havoc.de)
 * Copyright (c) 2024-2025 René Nicolaus
 * Licensed under MIT (https://github.com/Havoc7891/havLightbox/blob/main/LICENSE)
 */

(function (global) {
  if (typeof global === "undefined") {
    return;
  }

  const havLightboxDefaults = {
    titleFallback: "havlightbox",
    template: `
<dialog class="havlightbox" id="havlightbox" aria-label="havlightbox">
  <div class="havlightbox-backdrop" data-close></div>
  <section class="havlightbox-sheet" role="document">
    <header class="havlightbox-header">
      <div class="havlightbox-header-title">
        <strong id="havlightbox-title" aria-live="polite"></strong>
      </div>
      <button class="icon-btn" type="button" data-close aria-label="Close">
        &times;
      </button>
    </header>
    <div class="havlightbox-content">
      <img id="havlightbox-image" src="" alt="havlightbox image" />
    </div>
    <footer class="havlightbox-actions">
      <button class="icon-btn nav" data-prev aria-label="Previous image">
        &lsaquo;
      </button>
      <div id="havlightbox-caption" class="havlightbox-caption"></div>
      <button class="icon-btn nav" data-next aria-label="Next image">
        &rsaquo;
      </button>
    </footer>
  </section>
</dialog>`
  };

  let havLightboxInstance;
  let havLightboxDoc;
  let havLightboxOptions = { ...havLightboxDefaults };
  let havLightboxDialog;
  let havLightboxImage;
  let havLightboxTitleElement;
  let havLightboxCaptionElement;
  let havLightboxSheet;
  let havLightboxContent;
  let havLightboxNavPrev;
  let havLightboxNavNext;
  let havLightboxBackdrop;

  let havLightboxImageRequestId = 0;

  let havLightboxSources = [];
  let havLightboxIndex = 0;
  let havLightboxSavedScrollY = 0;

  let havLightboxTouchStartX = 0;
  let havLightboxTouchStartY = 0;
  let havLightboxTouchEndX = 0;
  let havLightboxTouchEndY = 0;
  let havLightboxMinSwipeDistance = 50;

  function havLightboxEnsureDialog(doc, opts) {
    const existing = doc.querySelector("#havlightbox");
    if (existing) {
      return existing;
    }
    const template = doc.createElement("template");
    template.innerHTML = opts.template.trim();
    const dialog = template.content.firstElementChild;
    const container = doc.body || doc.documentElement;
    container.appendChild(dialog);
    return dialog;
  }

  function havLightboxSetTitle(title, index, length) {
    if (!havLightboxTitleElement) {
      return;
    }
    const fallback =
      havLightboxOptions && typeof havLightboxOptions.titleFallback === "string"
        ? havLightboxOptions.titleFallback
        : havLightboxDefaults.titleFallback;
    const fallbackTitle =
      typeof fallback === "string" && fallback.trim()
        ? fallback.trim()
        : "havlightbox";
    const safeTitle =
      typeof title === "string" && title.trim() ? title.trim() : fallbackTitle;
    const count = length && length > 1 ? ` (${index + 1} / ${length})` : "";
    havLightboxTitleElement.textContent = safeTitle + count;
  }

  function havLightboxUpdateLayout() {
    if (
      !havLightboxDialog ||
      !havLightboxDialog.open ||
      !havLightboxSheet ||
      !havLightboxImage
    ) {
      return;
    }

    if (
      havLightboxImage.naturalWidth <= 0 ||
      havLightboxImage.naturalHeight <= 0
    ) {
      return;
    }

    const applyLayout = () => {
      const isMobileMode =
        global.innerWidth <= 900 || global.innerHeight <= 720;

      const headerElement = havLightboxDialog.querySelector(
        ".havlightbox-header"
      );
      const actionsElement = havLightboxDialog.querySelector(
        ".havlightbox-actions"
      );
      const sheetStyles = havLightboxSheet
        ? global.getComputedStyle(havLightboxSheet)
        : null;

      const headerRect = headerElement
        ? headerElement.getBoundingClientRect()
        : { width: 0, height: 0 };
      const actionsRect = actionsElement
        ? actionsElement.getBoundingClientRect()
        : { width: 0, height: 0 };

      const sheetPaddingHorizontal = sheetStyles
        ? (parseFloat(sheetStyles.paddingLeft || "0") || 0) +
          (parseFloat(sheetStyles.paddingRight || "0") || 0)
        : 0;
      const sheetPaddingVertical = sheetStyles
        ? (parseFloat(sheetStyles.paddingTop || "0") || 0) +
          (parseFloat(sheetStyles.paddingBottom || "0") || 0)
        : 0;
      const sheetBorderHorizontal = sheetStyles
        ? (parseFloat(sheetStyles.borderLeftWidth || "0") || 0) +
          (parseFloat(sheetStyles.borderRightWidth || "0") || 0)
        : 0;
      const sheetBorderVertical = sheetStyles
        ? (parseFloat(sheetStyles.borderTopWidth || "0") || 0) +
          (parseFloat(sheetStyles.borderBottomWidth || "0") || 0)
        : 0;

      const browserHeight =
        headerRect.height +
        actionsRect.height +
        sheetPaddingVertical +
        sheetBorderVertical;
      havLightboxSheet.style.setProperty(
        "--havlightbox-height",
        Math.max(0, Math.ceil(browserHeight)) + "px"
      );

      const minViewportPadding = 16;
      const viewportPaddingX = Math.max(
        minViewportPadding,
        Math.round(global.innerWidth * 0.02)
      );
      const viewportPaddingY = Math.max(
        minViewportPadding,
        Math.round(global.innerHeight * 0.02)
      );
      const viewportWidthLimit = Math.max(
        0,
        Math.floor(global.innerWidth - viewportPaddingX * 2)
      );
      const viewportHeightLimit = Math.max(
        0,
        Math.floor(global.innerHeight - viewportPaddingY * 2)
      );

      if (havLightboxSheet) {
        havLightboxSheet.style.setProperty(
          "--havlightbox-viewport-padding-x",
          viewportPaddingX + "px"
        );
        havLightboxSheet.style.setProperty(
          "--havlightbox-viewport-padding-y",
          viewportPaddingY - 1 + "px"
        );
      }

      const naturalWidth = havLightboxImage.naturalWidth || 0;
      const naturalHeight = havLightboxImage.naturalHeight || 0;
      if (naturalWidth <= 0 || naturalHeight <= 0) {
        return;
      }

      const availableImageWidth = Math.max(
        0,
        viewportWidthLimit - sheetPaddingHorizontal - sheetBorderHorizontal
      );
      const availableImageHeight = Math.max(
        0,
        viewportHeightLimit - browserHeight
      );

      const widthScale =
        naturalWidth > 0 && availableImageWidth > 0
          ? availableImageWidth / naturalWidth
          : Number.POSITIVE_INFINITY;
      const heightScale =
        naturalHeight > 0 && availableImageHeight > 0
          ? availableImageHeight / naturalHeight
          : Number.POSITIVE_INFINITY;

      let scale = Math.min(1, widthScale, heightScale);
      if (!Number.isFinite(scale) || scale <= 0) {
        const fallbackScales = [widthScale, heightScale].filter(
          (value) => Number.isFinite(value) && value > 0
        );
        scale = fallbackScales.length ? Math.min(1, ...fallbackScales) : 1;
      }

      const scaledWidth = Math.max(
        0,
        Math.floor(naturalWidth * Math.min(1, scale))
      );
      const scaledHeight = Math.max(
        0,
        Math.floor(naturalHeight * Math.min(1, scale))
      );

      const clampedWidth =
        availableImageWidth > 0
          ? Math.min(scaledWidth, Math.floor(availableImageWidth))
          : scaledWidth;
      const clampedHeight =
        availableImageHeight > 0
          ? Math.min(scaledHeight, Math.floor(availableImageHeight))
          : scaledHeight;

      if (isMobileMode) {
        havLightboxImage.style.removeProperty("max-width");
        havLightboxImage.style.removeProperty("max-height");
        havLightboxImage.style.removeProperty("width");
        havLightboxImage.style.removeProperty("height");

        if (havLightboxSheet) {
          const mobileMaxHeight = Math.max(
            0,
            viewportHeightLimit - browserHeight
          );
          havLightboxSheet.style.setProperty(
            "--mobile-max-height",
            mobileMaxHeight + "px"
          );
        }
      } else {
        havLightboxImage.style.maxWidth =
          clampedWidth > 0 ? clampedWidth + "px" : "";
        havLightboxImage.style.maxHeight =
          clampedHeight > 0 ? clampedHeight + "px" : "";
      }

      const maxTrackWidth = Math.max(
        0,
        viewportWidthLimit - sheetPaddingHorizontal - sheetBorderHorizontal
      );

      const actionsStyles = actionsElement
        ? global.getComputedStyle(actionsElement)
        : null;
      const actionsPaddingHorizontal = actionsStyles
        ? (parseFloat(actionsStyles.paddingLeft || "0") || 0) +
          (parseFloat(actionsStyles.paddingRight || "0") || 0)
        : 0;
      const navPrevWidth = havLightboxNavPrev
        ? havLightboxNavPrev.getBoundingClientRect().width
        : 0;
      const navNextWidth = havLightboxNavNext
        ? havLightboxNavNext.getBoundingClientRect().width
        : 0;
      const minimumBrowserWidth = Math.ceil(
        actionsPaddingHorizontal + navPrevWidth + navNextWidth
      );

      let browserWidth = 0;
      if (clampedWidth > 0) {
        browserWidth = clampedWidth;
      } else if (scaledWidth > 0) {
        browserWidth = scaledWidth;
      } else if (naturalWidth > 0) {
        browserWidth = naturalWidth;
      }

      browserWidth = Math.max(browserWidth, minimumBrowserWidth);

      if (maxTrackWidth > 0 && browserWidth > maxTrackWidth) {
        browserWidth = maxTrackWidth;
      }

      if (havLightboxSheet) {
        if (isMobileMode) {
          const actualImageWidth = Math.max(clampedWidth, scaledWidth);
          const minCaptionWidth = 300;
          const maxAllowedWidth = viewportWidthLimit * 0.95;

          let mobileWidth;
          if (actualImageWidth >= minCaptionWidth) {
            mobileWidth = Math.min(actualImageWidth, maxAllowedWidth);
          } else {
            mobileWidth = Math.min(minCaptionWidth, maxAllowedWidth);
          }

          if (mobileWidth > 0) {
            havLightboxSheet.style.setProperty(
              "--havlightbox-browser-width",
              mobileWidth + "px"
            );
          } else {
            havLightboxSheet.style.removeProperty(
              "--havlightbox-browser-width"
            );
          }
        } else {
          if (browserWidth > 0) {
            havLightboxSheet.style.setProperty(
              "--havlightbox-browser-width",
              browserWidth + "px"
            );
          } else {
            havLightboxSheet.style.removeProperty(
              "--havlightbox-browser-width"
            );
          }
        }
      }
    };

    global.requestAnimationFrame(() => {
      applyLayout();
      global.requestAnimationFrame(applyLayout);
    });
  }

  function havLightboxSetImageByIndex(index) {
    if (
      !havLightboxImage ||
      !Array.isArray(havLightboxSources) ||
      !havLightboxSources.length
    ) {
      return;
    }

    havLightboxIndex = Math.max(
      0,
      Math.min(index, havLightboxSources.length - 1)
    );
    const entry = havLightboxSources[havLightboxIndex];
    const nextSrc = typeof entry === "string" ? entry : entry?.src;
    const nextCaption =
      typeof entry === "object" && entry !== null ? entry.caption || "" : "";

    if (havLightboxCaptionElement) {
      havLightboxCaptionElement.textContent = nextCaption;
    }

    havLightboxImage.style.removeProperty("max-width");
    havLightboxImage.style.removeProperty("max-height");
    havLightboxImage.style.removeProperty("width");
    havLightboxImage.style.removeProperty("height");
    havLightboxImage.style.opacity = "0";
    if (havLightboxContent) {
      havLightboxContent.classList.add("loading");
    }

    const requestId = ++havLightboxImageRequestId;

    const reveal = () => {
      if (requestId !== havLightboxImageRequestId) {
        return;
      }
      havLightboxImage.style.opacity = "1";
      if (havLightboxContent) {
        havLightboxContent.classList.remove("loading");
      }

      const runLayout = () => {
        if (requestId !== havLightboxImageRequestId) {
          return;
        }
        if (
          havLightboxImage.naturalWidth > 0 &&
          havLightboxImage.naturalHeight > 0
        ) {
          global.requestAnimationFrame(() => {
            if (requestId !== havLightboxImageRequestId) {
              return;
            }
            havLightboxUpdateLayout();
          });
        } else {
          global.requestAnimationFrame(runLayout);
        }
      };

      if (typeof havLightboxImage.decode === "function") {
        havLightboxImage
          .decode()
          .then(() => {
            if (requestId !== havLightboxImageRequestId) {
              return;
            }
            if (
              havLightboxImage.naturalWidth > 0 &&
              havLightboxImage.naturalHeight > 0
            ) {
              runLayout();
            } else {
              global.requestAnimationFrame(runLayout);
            }
          })
          .catch(runLayout);
      } else {
        runLayout();
      }
    };

    if (
      havLightboxImage.src === nextSrc &&
      havLightboxImage.complete &&
      havLightboxImage.naturalWidth > 0
    ) {
      reveal();
      return;
    }

    havLightboxImage.src = nextSrc || "";
    if (havLightboxImage.complete && havLightboxImage.naturalWidth > 0) {
      reveal();
    } else {
      havLightboxImage.addEventListener("load", reveal, { once: true });
      const handleError = () => {
        if (requestId !== havLightboxImageRequestId) {
          return;
        }
        havLightboxImage.style.opacity = "1";
        if (havLightboxContent) {
          havLightboxContent.classList.remove("loading");
        }
      };

      havLightboxImage.addEventListener("error", handleError, { once: true });
    }
  }

  function havLightboxNavigatePrevious() {
    if (!havLightboxSources.length) {
      return;
    }
    havLightboxIndex =
      (havLightboxIndex - 1 + havLightboxSources.length) %
      havLightboxSources.length;
    havLightboxSetImageByIndex(havLightboxIndex);
    const baseTitle = (havLightboxTitleElement?.textContent || "").replace(
      /\s*\(\d+\s*\/\s*\d+\)$/,
      ""
    );
    havLightboxSetTitle(baseTitle, havLightboxIndex, havLightboxSources.length);
  }

  function havLightboxNavigateNext() {
    if (!havLightboxSources.length) {
      return;
    }
    havLightboxIndex = (havLightboxIndex + 1) % havLightboxSources.length;
    havLightboxSetImageByIndex(havLightboxIndex);
    const baseTitle = (havLightboxTitleElement?.textContent || "").replace(
      /\s*\(\d+\s*\/\s*\d+\)$/,
      ""
    );
    havLightboxSetTitle(baseTitle, havLightboxIndex, havLightboxSources.length);
  }

  function havLightboxHandleKeydown(event) {
    if (!havLightboxDialog || !havLightboxDialog.open) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      havLightboxNavigatePrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      havLightboxNavigateNext();
    }
  }

  function havLightboxHandleTouchStart(event) {
    if (!havLightboxDialog || !havLightboxDialog.open) {
      return;
    }

    const touch = event.touches[0];
    havLightboxTouchStartX = touch.clientX;
    havLightboxTouchStartY = touch.clientY;
  }

  function havLightboxHandleTouchEnd(event) {
    if (!havLightboxDialog || !havLightboxDialog.open) {
      return;
    }

    const touch = event.changedTouches[0];
    havLightboxTouchEndX = touch.clientX;
    havLightboxTouchEndY = touch.clientY;

    const deltaX = havLightboxTouchEndX - havLightboxTouchStartX;
    const deltaY = havLightboxTouchEndY - havLightboxTouchStartY;

    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > havLightboxMinSwipeDistance
    ) {
      if (deltaX > 0) {
        havLightboxNavigatePrevious();
      } else {
        havLightboxNavigateNext();
      }
    }
  }

  function havLightboxEnsureInitialization(options) {
    if (!havLightboxInstance) {
      havLightboxInit(options || {});
    }
    return havLightboxInstance;
  }

  function havLightboxClose() {
    if (!havLightboxDialog || !havLightboxDialog.open) {
      return;
    }
    havLightboxDialog.classList.add("closing");
    havLightboxDialog.addEventListener(
      "animationend",
      () => {
        havLightboxDialog.classList.remove("closing");
        havLightboxDialog.close();
      },
      { once: true }
    );
  }

  function havLightboxOpen(title, images, startIndex = 0) {
    if (!havLightboxEnsureInitialization()) {
      return;
    }

    if (!havLightboxDialog || !havLightboxImage) {
      return;
    }

    havLightboxSources = Array.isArray(images) ? images : [];
    if (!havLightboxSources.length) {
      return;
    }

    havLightboxIndex = Math.max(
      0,
      Math.min(startIndex, havLightboxSources.length - 1)
    );

    const multipleSources = havLightboxSources.length > 1;
    if (havLightboxNavPrev) {
      havLightboxNavPrev.hidden = !multipleSources;
    }
    if (havLightboxNavNext) {
      havLightboxNavNext.hidden = !multipleSources;
    }

    havLightboxSetTitle(title, havLightboxIndex, havLightboxSources.length);
    havLightboxSetImageByIndex(havLightboxIndex);

    havLightboxSavedScrollY =
      global.scrollY ||
      (havLightboxDoc && havLightboxDoc.documentElement
        ? havLightboxDoc.documentElement.scrollTop
        : 0);

    const scrollBarWidth =
      global.innerWidth - havLightboxDoc.documentElement.clientWidth;
    if (scrollBarWidth > 0 && havLightboxDoc?.body) {
      havLightboxDoc.body.style.setProperty("--sbw", `${scrollBarWidth}px`);
    } else if (havLightboxDoc?.body) {
      havLightboxDoc.body.style.removeProperty("--sbw");
    }

    if (havLightboxDoc?.body) {
      havLightboxDoc.body.classList.add("havlightbox-open");
    }

    havLightboxDialog.showModal();
  }

  function havLightboxInit(options = {}) {
    if (havLightboxInstance) {
      return havLightboxInstance;
    }

    const doc = options.document || global.document;
    if (!doc) {
      return null;
    }

    havLightboxDoc = doc;
    havLightboxOptions = { ...havLightboxDefaults, ...options };

    havLightboxDialog = havLightboxEnsureDialog(doc, havLightboxOptions);
    const qs = (sel, root = doc) => root.querySelector(sel);

    havLightboxImage = qs("#havlightbox-image", havLightboxDialog);
    havLightboxTitleElement = qs("#havlightbox-title", havLightboxDialog);
    havLightboxCaptionElement = qs("#havlightbox-caption", havLightboxDialog);
    havLightboxSheet = qs(".havlightbox-sheet", havLightboxDialog);
    havLightboxContent = qs(".havlightbox-content", havLightboxDialog);
    havLightboxNavPrev = qs("[data-prev]", havLightboxDialog);
    havLightboxNavNext = qs("[data-next]", havLightboxDialog);
    havLightboxBackdrop = qs(".havlightbox-backdrop", havLightboxDialog);

    havLightboxDialog.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        havLightboxClose();
      });
    });

    if (havLightboxBackdrop) {
      havLightboxBackdrop.addEventListener("click", havLightboxClose);
    }

    havLightboxDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      havLightboxClose();
    });

    havLightboxDialog.addEventListener("close", () => {
      havLightboxDialog.classList.remove("closing");
      if (havLightboxDoc?.body) {
        havLightboxDoc.body.classList.remove("havlightbox-open");
        havLightboxDoc.body.style.removeProperty("--sbw");
      }
      if (havLightboxSheet) {
        havLightboxSheet.style.removeProperty("--havlightbox-browser-width");
      }
      if (havLightboxDoc) {
        havLightboxDoc.documentElement.scrollTop = 0;
        havLightboxDoc.body.scrollTop = 0;
      }
      if (typeof havLightboxSavedScrollY === "number") {
        global.scrollTo(0, havLightboxSavedScrollY);
      }
    });

    havLightboxDialog.addEventListener("show", () => {
      if (havLightboxDoc?.body) {
        havLightboxDoc.body.classList.add("havlightbox-open");
      }
    });

    if (havLightboxNavPrev) {
      havLightboxNavPrev.addEventListener("click", () => {
        havLightboxNavigatePrevious();
      });
    }

    if (havLightboxNavNext) {
      havLightboxNavNext.addEventListener("click", () => {
        havLightboxNavigateNext();
      });
    }

    global.addEventListener("keydown", havLightboxHandleKeydown);

    if (havLightboxDialog) {
      havLightboxDialog.addEventListener(
        "touchstart",
        havLightboxHandleTouchStart,
        { passive: true }
      );
      havLightboxDialog.addEventListener(
        "touchend",
        havLightboxHandleTouchEnd,
        { passive: true }
      );
    }

    global.addEventListener("resize", () => {
      if (havLightboxDialog && havLightboxDialog.open) {
        havLightboxUpdateLayout();
      }
    });

    havLightboxInstance = {
      open: havLightboxOpen,
      close: havLightboxClose,
      updateLayout: havLightboxUpdateLayout,
      dialog: havLightboxDialog,
      get currentIndex() {
        return havLightboxIndex;
      },
      get images() {
        return Array.isArray(havLightboxSources) ? [...havLightboxSources] : [];
      }
    };

    return havLightboxInstance;
  }

  global.havLightboxInit = havLightboxInit;
  global.havLightboxOpen = (title, images, startIndex = 0, options) => {
    if (!havLightboxEnsureInitialization(options)) {
      return;
    }
    havLightboxOpen(title, images, startIndex);
  };
  global.havLightboxClose = () => {
    if (!havLightboxInstance) {
      return;
    }
    havLightboxClose();
  };
  global.havLightboxUpdateLayout = () => {
    if (!havLightboxInstance) {
      return;
    }
    havLightboxUpdateLayout();
  };
  global.havLightboxGetCurrentIndex = () => havLightboxIndex;
  global.havLightboxGetImages = () =>
    Array.isArray(havLightboxSources) ? [...havLightboxSources] : [];
})(typeof window !== "undefined" ? window : undefined);
