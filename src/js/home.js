addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.travel-suitcases');
  const cardWrapper = document.querySelector('.travel-suitcases__wrapper');
  const selectedWrapper = document.querySelector('.selected__wrapper');
  const newProductsWrapper = document.querySelector('.new-products__wrapper');

  // Travel suitcase data
  const travelSuitcaseData = [
    {
      id: 1,
      title: 'Duis vestibulum elit vel neque.',
      image: '../assets/Homepage/travel-case-gray.png',
      description: 'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
    },
    {
      id: 2,
      title: 'Neque vestibulum elit nequvel.',
      image: '../assets/Homepage/travel-case-silver.png',
      description: 'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
    },
    {
      id: 3,
      title: 'Elituis stibulum elit velneque.',
      image: '../assets/Homepage/travel-case-black.png',
      description: 'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
    },
    {
      id: 4,
      title: 'Vel vestibulum elit tuvel euqen.',
      image: '../assets/Homepage/travel-case-orange.png',
      description: 'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
    },
    {
      id: 5,
      title: 'Duis vestibulum elit vel neque.',
      image: '../assets/Homepage/travel-case-gray.png',
      description: 'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
    },
    {
      id: 6,
      title: 'Neque vestibulum elit nequvel.',
      image: '../assets/Homepage/travel-case-silver.png',
      description: 'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
    },
    {
      id: 7,
      title: 'Elituis stibulum elit velneque.',
      image: '../assets/Homepage/travel-case-black.png',
      description: 'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
    },
    {
      id: 8,
      title: 'Vel vestibulum elit tuvel euqen.',
      image: '../assets/Homepage/travel-case-orange.png',
      description: 'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
    },
  ];

  const allSuitcases = [...travelSuitcaseData, ...travelSuitcaseData];

  // Slider
  const sliderHtml = allSuitcases
    .map(
      (suitcase) => `
    <div class="travel-card" style="background-image: url(${suitcase.image})">
      <h3>${suitcase.title}</h3>
      <p>${suitcase.description}</p>
    </div>
  `
    )
    .join('');

  cardWrapper.innerHTML = sliderHtml;

  let isDragging = false;
  let startX, startY;
  let startTranslate;
  let currentTranslate = 0;
  let autoplayInterval;
  let isScrollingDirection = null;
  let cardWidth = 0;
  let gap = 0;
  let singleCardMove = 0;
  let originalSetWidth = 0;

  function updateDimensions() {
    const firstCard = cardWrapper.querySelector('.travel-card');
    if (!firstCard) return;

    const wrapperStyle = window.getComputedStyle(cardWrapper);

    cardWidth = firstCard.offsetWidth;
    gap = parseFloat(wrapperStyle.gap) || 64;
    singleCardMove = cardWidth + gap;
    originalSetWidth = singleCardMove * travelSuitcaseData.length;
  }

  function setPosition(translateValue, withTransition = true) {
    const isMobile = window.innerWidth < 768;

    cardWrapper.style.transition = withTransition ? 'transform 0.4s ease-in-out' : 'none';

    if (isMobile) {
      const mobileTranslateValue = translateValue / 2;
      cardWrapper.style.transform = `translateX(${mobileTranslateValue}px)`;
    } else {
      cardWrapper.style.transform = `translateX(${translateValue}px)`;
    }
  }
  function scrollNext() {
    currentTranslate -= singleCardMove;
    setPosition(currentTranslate);

    if (Math.abs(currentTranslate) >= originalSetWidth) {
      setTimeout(() => {
        currentTranslate = 0;
        setPosition(currentTranslate, false);
      }, 400);
    }
  }

  function startAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(scrollNext, 3000);
  }

  function startDrag(e) {
    isDragging = true;
    startX = e.pageX || e.changedTouches[0].pageX;
    startY = e.pageY || e.changedTouches[0].pageY;
    startTranslate = currentTranslate;
    isScrollingDirection = null;
    clearInterval(autoplayInterval);
    cardWrapper.style.transition = 'none';
    cardWrapper.style.cursor = 'grabbing';
  }

  function drag(e) {
    if (!isDragging) return;

    const currentX = e.pageX || e.changedTouches[0].pageX;
    const currentY = e.pageY || e.changedTouches[0].pageY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (isScrollingDirection === null) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        isScrollingDirection = 'horizontal';
      } else {
        isScrollingDirection = 'vertical';
      }
    }

    if (isScrollingDirection === 'horizontal') {
      e.preventDefault();
      currentTranslate = startTranslate + deltaX;
      setPosition(currentTranslate, false);
    }
  }

  function endDrag() {
    if (!isDragging) return;

    const wasHorizontal = isScrollingDirection === 'horizontal';

    isDragging = false;
    isScrollingDirection = null;
    cardWrapper.style.cursor = 'grab';
    if (wasHorizontal) {
      const nearestIndex = Math.round(currentTranslate / singleCardMove);
      currentTranslate = nearestIndex * singleCardMove;

      setPosition(currentTranslate, true);
      if (currentTranslate > 0) {
        setTimeout(() => {
          currentTranslate = -originalSetWidth;
          setPosition(currentTranslate, false);
        }, 400);
      } else if (Math.abs(currentTranslate) >= originalSetWidth) {
        setTimeout(() => {
          currentTranslate = 0;
          setPosition(currentTranslate, false);
        }, 400);
      }
    }
  }

  cardWrapper.addEventListener('mousedown', startDrag);
  cardWrapper.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  cardWrapper.addEventListener('mouseleave', endDrag);

  cardWrapper.addEventListener('touchstart', startDrag);
  cardWrapper.addEventListener('touchmove', drag);
  cardWrapper.addEventListener('touchend', endDrag);

  container.addEventListener('mouseenter', () => {
    if (!isDragging) {
      clearInterval(autoplayInterval);
    }
  });

  container.addEventListener('mouseleave', () => {
    if (!isDragging) {
      startAutoplay();
    }
  });

  window.addEventListener('resize', updateDimensions);

  updateDimensions();
  startAutoplay();

  // Generate product-cards
  function generateProductCards(items, filterBlockName) {
    return items
      .filter((item) => item.blocks && item.blocks.includes(filterBlockName))
      .map(
        (item) => `
        <div data-id="${item.id}" class="product-card">
          <a href="./html/product.html?id=${item.id}"><img src="${
            item.imageUrl
          }" alt="${item.name}"></a>
          ${item.salesStatus ? '<span>SALE</span>' : ''}
          <a href="./html/product.html?id=${item.id}"><h3>${item.name}</h3></a>
          <p>$${item.price}</p>
          <button class="add-to-cart">Add to Cart</button>
        </div>
      `
      )
      .join('');
  }

  // Wait for the data to be fetched
  async function initHomePage() {
    const products = await window.getData();

    if (!products.length) {
      return;
    }

    if (selectedWrapper) {
      selectedWrapper.innerHTML = generateProductCards(products, 'Selected Products');
    }
    if (newProductsWrapper) {
      newProductsWrapper.innerHTML = generateProductCards(products, 'New Products Arrival');
    }
  }

  // Initialize the home page
  initHomePage();
});
