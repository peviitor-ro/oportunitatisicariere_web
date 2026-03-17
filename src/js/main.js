document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('.header');
  const userBtn = document.getElementById('user');
  const cartBtn = document.getElementById('cart');

  window.showFlashMessage = function (message, type = 'success') {
    if (document.querySelector('.flash-message')) {
      return;
    }
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message flash-message--${type}`;
    flashMessage.textContent = message;
    document.body.appendChild(flashMessage);
    setTimeout(() => {
      flashMessage.classList.add('is-visible');
    }, 10);
    setTimeout(() => {
      flashMessage.classList.remove('is-visible');
      flashMessage.addEventListener('transitionend', () => {
        if (flashMessage.parentNode) {
          flashMessage.parentNode.removeChild(flashMessage);
        }
      });
    }, 2000);
  };

  window.getCart = function () {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  };

  window.saveCart = function (cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  window.updateCartCounter = function () {
    const cart = window.getCart();

    // Safety check in case cartBtn doesn't exist on this page
    if (!cartBtn) return;

    let counter = cartBtn.querySelector('.cart-quantity');
    if (cart.length > 0) {
      if (!counter) {
        counter = document.createElement('span');
        counter.classList.add('cart-quantity');
        cartBtn.appendChild(counter);
      }
      counter.textContent = cart.length;
    } else {
      counter?.remove();
    }
  };

  async function fetchAllProducts() {
    const url = '../assets/data.json';
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      return data.data ? data.data : data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }
  window.getData = fetchAllProducts;

  // Keeping the header scroll effect since it's just visual styling
  if (header) {
    const handleScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  document.body.addEventListener('click', function (event) {
    const clickedButton = event.target.closest('.add-to-cart');
    if (clickedButton) {
      event.preventDefault();
      if (event.target.closest('.cart-form')) {
        return;
      }

      const productCard = clickedButton.closest('.product-card[data-id]');
      const productId = productCard?.dataset.id;

      if (productId) {
        const cart = window.getCart();
        const isAlreadyInCart = cart.some((item) => item.id === productId);
        if (isAlreadyInCart) {
          window.showFlashMessage('Product is already in cart', 'danger');
        } else {
          cart.push({ id: productId, quantity: 1 });
          window.saveCart(cart);
          window.updateCartCounter();
          window.showFlashMessage('Product added to cart', 'success');
        }
      }
    }
  });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function showValidationError(input, message) {
    input.classList.add('is-invalid');
    const errorSpan = input.nextElementSibling;

    if (errorSpan?.classList.contains('form-error-message')) {
      errorSpan.textContent = message;
    }
  }

  function clearValidationError(input) {
    input.classList.remove('is-invalid');
    const errorSpan = input.nextElementSibling;

    if (errorSpan?.classList.contains('form-error-message')) {
      errorSpan.textContent = '';
    }
  }

  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach((input) => {
      clearValidationError(input);
      if (input.value.trim() === '') {
        isValid = false;
        showValidationError(input, 'This field is required.');
      } else if (input.type === 'email' && !emailRegex.test(input.value)) {
        isValid = false;
        showValidationError(input, 'Please enter a valid email address.');
      }
    });

    if (form.id === 'sign-up-form') {
      const password = form.querySelector('input[name="password"]');
      const repeatPassword = form.querySelector('input[name="repeat-password"]');

      if (password?.value !== repeatPassword?.value) {
        isValid = false;
        if (repeatPassword) {
          showValidationError(repeatPassword, 'Passwords do not match.');
        }
      }
    }
    return isValid;
  }

  const contactEmailInput = document.getElementById('email');

  if (contactEmailInput) {
    contactEmailInput.addEventListener('blur', function () {
      const emailValue = this.value;

      if (emailValue.trim() === '') {
        clearValidationError(this);
        return;
      }

      if (!emailRegex.test(emailValue)) {
        showValidationError(this, 'Please enter a valid email address.');
      } else {
        clearValidationError(this);
      }
    });
  }

  document.body.addEventListener('submit', function (event) {
    const form = event.target;

    if (form.classList.contains('cart-form')) {
      return;
    }
    if (form.closest('#auth-dialog')) {
      return;
    }

    event.preventDefault();
    const isValid = validateForm(form);

    if (isValid) {
      console.log('Form is valid:', form.id);
      form.reset();
      window.showFlashMessage('Form Submitted Successfully', 'success');
    } else {
      console.log('Form is invalid:', form.id);
    }
  });

  document.body.addEventListener('input', function (event) {
    const input = event.target.closest('input, textarea');
    if (input && input.classList.contains('is-invalid')) {
      if (input.value.trim() !== '') {
        clearValidationError(input);
      }
    }
  });

  const authDialog = document.getElementById('auth-dialog');
  const signInView = document.getElementById('sign-in-view');
  let dialogToggle = true;

  // Sign-up HTML
  const signUpHTML = `
  <div class="dialog-wrapper" id="sign-up-view" style="display:none;">
    <button class="dialog-close-btn" type="button" aria-label="Close dialog">&times;</button>
    <h2>Sign up</h2>
    <form action="" id="sign-up-form" novalidate>
      <div class="input-group">
        <label for="sign-up-email">Email Address <span class="highlight-rose">*</span></label>
        
        <input type="email" name="email" id="sign-up-email" required pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" title="Use a valid email address" autocomplete="email">
        
        <span class="form-error-message" aria-live="polite"></span>
      </div>
      <div class="input-group">
        <label for="sign-up-password">Password <span class="highlight-rose">*</span></label>
        <input type="password" name="password" id="sign-up-password" required autocomplete="new-password">
        <button class="toggle-visibility" type="button">
          <img src="/assets/hidden.png" alt="password-hidden" />
        </button>
        <span class="form-error-message" aria-live="polite"></span>
      </div>
      <div class="input-group">
        <label for="repeat-password">Repeat Password <span class="highlight-rose">*</span></label>
        <input type="password" name="repeat-password" id="repeat-password" required autocomplete="new-password">
        <button class="toggle-visibility" type="button">
          <img src="/assets/hidden.png" alt="password-hidden" />
        </button>
        <span class="form-error-message" aria-live="polite"></span>
      </div>
      <button type="submit">Sign up</button>
    </form>
    <p>
      Already have an account?
      <button class="form-toggle">Sign in</button>
    </p>
  </div>
  `;

  if (userBtn) {
    userBtn.addEventListener('click', function () {
      if (!dialogToggle) {
        authDialog.close();
      } else {
        authDialog.show();
        resetToSignInView();
      }
      dialogToggle = !dialogToggle;
    });
  }

  function resetToSignInView() {
    const signUpView = document.getElementById('sign-up-view');
    signUpView?.remove();

    if (signInView) {
      signInView.style.display = 'flex';
      signInView.classList.remove('fade-in', 'fade-out');
      signInView.querySelectorAll('.is-invalid').forEach((el) => clearValidationError(el));
    }
  }

  if (authDialog) {
    function handleDialogClose(event) {
      if (event.target === authDialog || event.target.closest('.dialog-close-btn')) {
        authDialog.close();
        dialogToggle = true;
      }
    }

    function handlePasswordToggle(event) {
      const btn = event.target.closest('.toggle-visibility');
      if (!btn) return;

      event.preventDefault();
      const inputGroup = btn.closest('.input-group');
      if (!inputGroup) return;

      const passwordInput = inputGroup.querySelector('input');
      const icon = btn.querySelector('img');

      if (!passwordInput || !icon) return;

      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.src = '/assets/shown.png';
        icon.alt = 'password-shown';
      } else {
        passwordInput.type = 'password';
        icon.src = '/assets/hidden.png';
        icon.alt = 'password-hidden';
      }
    }

    function handleAuthViewToggle(event) {
      const btn = event.target.closest('.form-toggle');
      if (!btn) return;

      const currentView = btn.closest('.dialog-wrapper');
      if (!currentView) return;

      let nextView;

      if (currentView.id === 'sign-in-view') {
        if (!document.getElementById('sign-up-view')) {
          authDialog.insertAdjacentHTML('beforeend', signUpHTML);
        }
        nextView = document.getElementById('sign-up-view');

        currentView.classList.add('fade-out');
        currentView.addEventListener(
          'animationend',
          () => {
            currentView.style.display = 'none';
            currentView.classList.remove('fade-out');
            if (nextView) {
              nextView.style.display = 'flex';
              nextView.classList.add('fade-in');
            }
          },
          { once: true }
        );
      } else if (currentView.id === 'sign-up-view') {
        nextView = signInView;
        currentView.classList.add('fade-out');
        currentView.addEventListener(
          'animationend',
          () => {
            currentView.remove();
            if (nextView) {
              nextView.style.display = 'flex';
              nextView.classList.add('fade-in');
            }
          },
          { once: true }
        );
      }

      if (nextView) {
        nextView.addEventListener('animationend', (e) => e.target.classList.remove('fade-in'), {
          once: true,
        });
      }
    }

    authDialog.addEventListener('click', function (event) {
      handleDialogClose(event);
      handlePasswordToggle(event);
      handleAuthViewToggle(event);
    });

    authDialog.addEventListener('submit', function (event) {
      event.preventDefault();
      const form = event.target;
      const isValid = validateForm(form);

      if (isValid) {
        console.log('Valid auth form submitted:', form.id);
        form.reset();
        authDialog.close();
        dialogToggle = true;
        window.showFlashMessage('Form Submitted Successfully', 'success');
      } else {
        console.log('Invalid auth form submitted:', form.id);
      }
    });
  }

  // Initialize the cart counter
  window.updateCartCounter();
});
