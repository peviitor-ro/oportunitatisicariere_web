document.addEventListener('DOMContentLoaded', function () {
  const catalogListEl = document.querySelector('.catalog__products');
  const bestSetsListEl = document.querySelector('.best-sets__wrapper');
  const showingTextEl = document.querySelector('.showing');
  const paginationPagesEl = document.querySelector('.pagination__pages');
  const prevButton = document.querySelector('.pagination__prev');
  const nextButton = document.querySelector('.pagination__next');
  const searchInput = document.querySelector('.search-product');
  const sortSelect = document.querySelector('.sorting');
  const saleCheckbox = document.querySelector('input[name="sale"]');
  const clearFiltersButton = document.querySelector('.clear-filters');
  const hideFiltersButton = document.querySelector('.hide-filters');
  const filterInputsRow = document.querySelector('#filter-inputs-row');

  let activeFilters = {
    size: 'default',
    color: 'default',
    category: 'default',
    sale: false,
  };

  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  const itemsPerPage = 12;

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

  function generateProductCards(items) {
    if (!items.length) {
      return '<li>No products found matching your criteria.</li>';
    }
    return items
      .map(
        (item) => `
        <li data-id="${item.id}" class="product-card">
          <a href="./product.html?id=${item.id}"><img src="${item.imageUrl}" alt="${item.name}"></a>
          ${item.salesStatus ? '<span>SALE</span>' : ''}
          <a href="./product.html?id=${item.id}"><h3>${item.name}</h3></a>
          <p>$${item.price}</p>
          <button class="add-to-cart">Add to Cart</button>
        </li>`
      )
      .join('');
  }

  async function initCatalogPage() {
    if (catalogListEl) catalogListEl.innerHTML = '<p>Loading...</p>';

    try {
      const products = await window.getData();
      if (!products?.length) {
        if (catalogListEl) {
          catalogListEl.innerHTML = '<p>No products found.</p>';
        }
        return;
      }

      allProducts = products;
      filteredProducts = products;

      populateBestSets(allProducts);
      populateCustomFilters(allProducts);

      // URL Params Logic
      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromURL = urlParams.get('category');

      if (categoryFromURL) {
        updateFilterState('category', categoryFromURL);
      } else {
        displayCatalogProducts();
      }

      setupEventListeners();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function populateBestSets(products) {
    if (bestSetsListEl) {
      const setsOnly = products.filter((p) => p.category?.toLowerCase().includes('sets'));
      const source = setsOnly.length > 0 ? setsOnly : products;

      const randomItems = [...source].sort(() => 0.5 - Math.random()).slice(0, 5);

      const setsHtml = randomItems
        .map(
          (item) => `
        <div class="top-seller-card">
          <a href="./html/product.html?id=${item.id}">
            <img src="${item.imageUrl}" alt="${item.name}">
          </a>
          <div class="top-seller-card__info">
            <p>${item.name}</p>
            <div class="rating">${generateRatingStars(item.rating)}</div>
            <p>$${item.price}</p>
          </div>
        </div>`
        )
        .join('');
      bestSetsListEl.innerHTML = setsHtml;
    }
  }

  function populateCustomFilters(products) {
    const sizes = [
      ...new Set(products.flatMap((p) => p.size.split(',').map((s) => s.trim()))),
    ].sort((a, b) => a.localeCompare(b));
    const colors = [...new Set(products.map((p) => p.color))].sort((a, b) => a.localeCompare(b));
    const categories = [...new Set(products.map((p) => p.category))].sort((a, b) =>
      a.localeCompare(b)
    );

    renderDropdownOptions('size', sizes);
    renderDropdownOptions('color', colors);
    renderDropdownOptions('category', categories);
  }

  function renderDropdownOptions(type, options) {
    const container = document.querySelector(
      `.filter-group[data-type="${type}"] .dropdown-options`
    );
    if (!container) return;

    let html =
      '<li class="is-selected" data-value="default"><button class="dropdown-option-btn" type="button">Choose option</button></li>';

    options.forEach((opt) => {
      const label = opt.charAt(0).toUpperCase() + opt.slice(1);
      html += `<li data-value="${opt}"><button class="dropdown-option-btn" type="button">${label}</button></li>`;
    });

    container.innerHTML = html;
  }

  function setupEventListeners() {
    document.addEventListener('click', function (e) {
      const button = e.target.closest('.dropdown-options button');
      if (button) {
        const li = button.parentElement;
        const ul = li.parentElement;
        const filterGroup = ul.closest('.filter-group');
        const type = filterGroup.dataset.type;
        const value = li.dataset.value;

        activeFilters[type] = value;

        ul.querySelectorAll('li').forEach((item) => item.classList.remove('is-selected'));
        li.classList.add('is-selected');

        const mainBtn = filterGroup.querySelector('.dropdown-selected');
        mainBtn.textContent = button.textContent;

        applyFiltersAndDisplay();
      }
    });

    saleCheckbox.addEventListener('change', (e) => {
      activeFilters.sale = e.target.checked;
      applyFiltersAndDisplay();
    });

    sortSelect.addEventListener('change', applyFiltersAndDisplay);

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchSubmit();
      }
    });

    clearFiltersButton.addEventListener('click', resetFilters);

    hideFiltersButton.addEventListener('click', () => {
      const isHidden = filterInputsRow.style.display === 'none';
      filterInputsRow.style.display = isHidden ? 'flex' : 'none';
      hideFiltersButton.textContent = isHidden ? 'Hide filters' : 'Show filters';
    });

    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        displayCatalogProducts();
      }
    });
    nextButton.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        displayCatalogProducts();
      }
    });
    paginationPagesEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('pagination__page')) {
        currentPage = Number(e.target.dataset.page);
        displayCatalogProducts();
      }
    });
  }

  function updateFilterState(type, value) {
    const filterGroup = document.querySelector(`.filter-group[data-type="${type}"]`);
    if (!filterGroup) return;

    const li = filterGroup.querySelector(`li[data-value="${value}"]`);
    if (li) {
      activeFilters[type] = value;

      filterGroup.querySelectorAll('li').forEach((i) => i.classList.remove('is-selected'));
      li.classList.add('is-selected');
      filterGroup.querySelector('.dropdown-selected').textContent =
        li.querySelector('button').textContent;

      applyFiltersAndDisplay();
    }
  }

  function resetFilters() {
    activeFilters = {
      size: 'default',
      color: 'default',
      category: 'default',
      sale: false,
    };

    if (saleCheckbox) saleCheckbox.checked = false;
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';

    const filterGroups = document.querySelectorAll('.filter-group');

    filterGroups.forEach((group) => {
      group.querySelectorAll('li').forEach((li) => li.classList.remove('is-selected'));

      const defaultLi = group.querySelector('li[data-value="default"]');

      if (defaultLi) {
        defaultLi.classList.add('is-selected');
        const defaultButtonText = defaultLi.querySelector('button')?.textContent || 'Choose option';

        const mainDropdownBtn = group.querySelector('.dropdown-selected');
        if (mainDropdownBtn) {
          mainDropdownBtn.textContent = defaultButtonText;
        }
      }
    });

    applyFiltersAndDisplay();
  }

  function applyFiltersAndDisplay() {
    let tempProducts = [...allProducts];

    if (activeFilters.size !== 'default') {
      tempProducts = tempProducts.filter((p) => p.size.includes(activeFilters.size));
    }
    if (activeFilters.color !== 'default') {
      tempProducts = tempProducts.filter((p) => p.color === activeFilters.color);
    }
    if (activeFilters.category !== 'default') {
      tempProducts = tempProducts.filter((p) => p.category === activeFilters.category);
    }
    if (activeFilters.sale) {
      tempProducts = tempProducts.filter((p) => p.salesStatus === true);
    }

    // Sorting logic
    const sortValue = sortSelect.value;
    switch (sortValue) {
      case 'price-asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'popularity-desc':
        tempProducts.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'popularity-asc':
        tempProducts.sort((a, b) => a.popularity - b.popularity);
        break;
      case 'rating-desc':
        tempProducts.sort((a, b) => b.rating - a.rating);
        break;
    }

    filteredProducts = tempProducts;
    currentPage = 1;
    displayCatalogProducts();
  }

  function handleSearchSubmit() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) return;
    const foundProduct = allProducts.find((p) => p.name.toLowerCase().includes(searchTerm));

    if (foundProduct) {
      window.location.href = `./product.html?id=${foundProduct.id}`;
    } else {
      alert('Product not found');
    }
  }

  function displayCatalogProducts() {
    const totalFiltered = filteredProducts.length;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    const pageItems = filteredProducts.slice(startIndex, endIndex);

    catalogListEl.innerHTML = generateProductCards(pageItems);
    updateShowingText(totalFiltered, startIndex, pageItems.length);
    updatePaginationControls(totalPages);
  }

  function updateShowingText(totalFiltered, startIndex, pageItemsLength) {
    if (totalFiltered === 0) {
      showingTextEl.textContent = 'Showing 0 Results';
      return;
    }
    showingTextEl.textContent = `Showing ${startIndex + 1}-${
      startIndex + pageItemsLength
    } of ${totalFiltered} Results`;
  }

  function updatePaginationControls(totalPages) {
    paginationPagesEl.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'pagination__page';
      if (i === currentPage) btn.classList.add('active');
      btn.textContent = i;
      btn.dataset.page = i;
      paginationPagesEl.appendChild(btn);
    }
    prevButton.style.display = currentPage === 1 ? 'none' : 'block';
    nextButton.style.display = currentPage === totalPages || totalPages === 0 ? 'none' : 'block';
  }

  initCatalogPage();
});
