document.addEventListener('DOMContentLoaded', function () {
  const mainImg = document.querySelector('#main-product-image');
  const productName = document.querySelector('.product-info__title');
  const productNameReview = document.querySelector('.title-review');
  const productRatingSpan = document.querySelectorAll('.rating');
  const productPrice = document.querySelector('.product-info__price');
  const relatedProducts = document.querySelector('.related-products__list');

  function initCartForm() {
    const cartForm = document.querySelector('.cart-form');
    const quantitySpan = document.getElementById('quantity');
    const submitButton = cartForm ? cartForm.querySelector('.add-to-cart-btn') : null;

    if (!cartForm || !quantitySpan || !submitButton) {
      console.warn('Cart form elements not found on this page.');
      return;
    }

    cartForm.addEventListener('submit', function (event) {
      event.preventDefault();
      console.log('Main product form submitted.');

      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');

      if (!productId) {
        console.error('Product ID not found in URL.');
        return;
      }

      const quantity = parseInt(quantitySpan.textContent.trim(), 10);

      if (isNaN(quantity) || quantity < 1) {
        console.error('Invalid quantity selected:', quantity);
        return;
      }

      if (typeof window.getCart !== 'function' || typeof window.saveCart !== 'function') {
        console.error('Cart functions (getCart, saveCart) not found.');
        return;
      }
      const cart = window.getCart();

      const existingProductIndex = cart.findIndex((item) => item.id === productId);

      if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity = quantity;
        console.log('Product quantity updated in cart.');
      } else {
        cart.push({ id: productId, quantity });
        console.log('New product added to cart.');
      }

      window.saveCart(cart);
      window.updateCartCounter();
      window.showFlashMessage('Cart updated', 'success');
      submitButton.textContent = 'Added!';
      submitButton.disabled = true;

      setTimeout(() => {
        submitButton.textContent = 'Add To Cart';
        submitButton.disabled = false;
      }, 2000);
    });
  }

  async function initCatalogPage() {
    const products = await window.getData();

    if (!products || !products.length) {
      console.error('No products found');
      return;
    }

    if (relatedProducts) {
      relatedProducts.innerHTML = generateProductCards(products, 'You May Also Like');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idFromURL = urlParams.get('id');
    const product = products.find((p) => p.id === idFromURL);

    if (product) {
      console.log(product);

      mainImg.src = product.imageUrl;
      productName.textContent = product.name;
      productNameReview.textContent = `1 review for ${product.name}`;
      productPrice.textContent = `$${product.price}`;

      if (productRatingSpan && product.rating) {
        productRatingSpan.forEach((span) => {
          span.innerHTML = generateRatingStars(product.rating);
        });
      }
    }
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.tab-list button[data-tab-target]');
    const tabPanels = document.querySelectorAll('.tab-panel[id]');

    if (tabs.length === 0 || tabPanels.length === 0) {
      return;
    }

    function handleTabClick(event) {
      const clickedTab = event.currentTarget;
      const targetPanelId = clickedTab.getAttribute('data-tab-target');
      const targetPanel = document.querySelector(targetPanelId);

      if (!targetPanel) return;

      tabs.forEach((tab) => {
        tab.setAttribute('aria-selected', 'false');
        tab.classList.remove('active');
      });

      tabPanels.forEach((panel) => {
        panel.hidden = true;
      });

      clickedTab.classList.add('active');
      targetPanel.hidden = false;
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', handleTabClick);
    });
  }

  function initQuantitySelector() {
    const quantitySpan = document.getElementById('quantity');
    const increaseBtn = document.querySelector('.quantity-btn[aria-label="Increase quantity"]');
    const decreaseBtn = document.querySelector('.quantity-btn[aria-label="Decrease quantity"]');

    if (!quantitySpan || !increaseBtn || !decreaseBtn) return;

    let currentQuantity = parseInt(quantitySpan.textContent.trim(), 10);

    increaseBtn.addEventListener('click', () => {
      currentQuantity++;
      quantitySpan.textContent = ` ${currentQuantity} `;
    });

    decreaseBtn.addEventListener('click', () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        quantitySpan.textContent = ` ${currentQuantity} `;
      }
    });
  }

  function generateRatingStars(rating) {
    let starsHtml = '';
    const roundedRating = Math.round(rating);
    const emptyStarPath = '/assets/empty-rating.png';
    const filledStarPath = '/assets/filled-rating.png';

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        starsHtml += `<img src="${filledStarPath}" alt="Filled Star">`;
      } else {
        starsHtml += `<img src="${emptyStarPath}" alt="Empty Star">`;
      }
    }
    return starsHtml;
  }

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

  function initStarRatingInput() {
    const ratingContainer = document.querySelector('.star-rating-input');
    const ratingSpan = ratingContainer ? ratingContainer.querySelector('span') : null;

    if (!ratingSpan) return;

    const emptyStarPath = '/assets/empty-rating.png';
    const filledStarPath = '/assets/filled-rating.png';
    let currentRating = 0;

    ratingSpan.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
      const starImg = document.createElement('img');
      starImg.src = emptyStarPath;
      starImg.alt = 'Empty Star';
      starImg.dataset.value = i;
      starImg.style.cursor = 'pointer';
      ratingSpan.appendChild(starImg);
    }

    const allStars = ratingSpan.querySelectorAll('img');

    const updateStars = (ratingValue) => {
      allStars.forEach((star) => {
        const starValue = parseInt(star.dataset.value, 10);
        if (starValue <= ratingValue) {
          star.src = filledStarPath;
          star.alt = 'Filled Star';
        } else {
          star.src = emptyStarPath;
          star.alt = 'Empty Star';
        }
      });
    };

    ratingSpan.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG') {
        currentRating = parseInt(e.target.dataset.value, 10);
        updateStars(currentRating);
      }
    });

    ratingSpan.addEventListener('mouseover', (e) => {
      if (e.target.tagName === 'IMG') {
        const hoverValue = parseInt(e.target.dataset.value, 10);
        updateStars(hoverValue);
      }
    });

    ratingSpan.addEventListener('mouseout', () => {
      updateStars(currentRating);
    });
  }

  initCatalogPage();
  initTabs();
  initQuantitySelector();
  initStarRatingInput();
  initCartForm();
});
