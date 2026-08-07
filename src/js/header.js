const SCROLL_ANIMATION_SELECTOR = '[data-aos]';
const scrollAnimationObservers = new WeakSet();
const scrollAnimationTimers = new WeakMap();

const scrollAnimationObserver =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            updateScrollAnimation(entry.target, entry.isIntersecting);
          });
        },
        {
          root: null,
          threshold: 0.2,
        }
      )
    : null;

function clearScrollAnimationTimer(element) {
  const timerId = scrollAnimationTimers.get(element);
  if (timerId) {
    clearTimeout(timerId);
    scrollAnimationTimers.delete(element);
  }
}

function getScrollAnimationConfig(element) {
  const parsedDuration = Number.parseInt(element.getAttribute('data-aos-duration') || '900', 10);
  const parsedDelay = Number.parseInt(element.getAttribute('data-aos-delay') || '0', 10);
  const easing = element.getAttribute('data-aos-easing') || 'ease-out-cubic';
  const easingMap = {
    'ease-out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    'ease-in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    'ease-in-quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'ease-in-out-quad': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  };

  return {
    duration: Number.isNaN(parsedDuration) ? 900 : parsedDuration,
    delay: Number.isNaN(parsedDelay) ? 0 : parsedDelay,
    easing: easingMap[easing] || easing,
  };
}

function applyScrollAnimationTransition(element, delay) {
  const { duration, easing } = getScrollAnimationConfig(element);

  element.style.setProperty('transition-property', 'opacity, transform');
  element.style.setProperty('transition-duration', `${duration}ms`);
  element.style.setProperty('transition-timing-function', easing);
  element.style.setProperty('transition-delay', `${delay}ms`);
}

function updateScrollAnimation(element, isVisible) {
  if (!element || !element.matches(SCROLL_ANIMATION_SELECTOR)) return;

  const { delay } = getScrollAnimationConfig(element);
  element.classList.add('aos-init');

  clearScrollAnimationTimer(element);

  if (isVisible) {
    applyScrollAnimationTransition(element, delay);

    const timerId = window.setTimeout(() => {
      element.classList.add('aos-animate');
      scrollAnimationTimers.delete(element);
    }, delay);

    scrollAnimationTimers.set(element, timerId);
    return;
  }

  applyScrollAnimationTransition(element, 0);
  element.classList.remove('aos-animate');
}

function registerScrollAnimations(root = document) {
  const elements = root.querySelectorAll(SCROLL_ANIMATION_SELECTOR);

  elements.forEach((element) => {
    if (scrollAnimationObservers.has(element)) return;

    scrollAnimationObservers.add(element);
    updateScrollAnimation(element, false);

    if (scrollAnimationObserver) {
      scrollAnimationObserver.observe(element);
    } else {
      updateScrollAnimation(element, true);
    }
  });
}

window.refreshScrollAnimations = registerScrollAnimations;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    registerScrollAnimations();
  });
} else {
  registerScrollAnimations();
}

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const menuToggleBtn = document.getElementById('menuToggle');
  const toggleIcon = menuToggleBtn.querySelector('i');
  const mainNavigation = document.getElementById('mainNavigation');
  const body = document.body;
  const yearElement = document.getElementById('current-year');
  let lastScrollY = window.scrollY;

  // Header mobile behavior
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 0 || window.innerWidth > 576) {
      header.classList.remove('header--hidden');
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY > lastScrollY && currentScrollY > 10) {
      header.classList.add('header--hidden');
    } else if (currentScrollY < lastScrollY) {
      header.classList.remove('header--hidden');
    }

    lastScrollY = currentScrollY;
  });

  // Footer copyright
  if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.innerHTML = `&copy; ${currentYear}`;
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  menuToggleBtn.addEventListener('click', () => {
    const isOpen = mainNavigation.classList.toggle('is-open');
    body.classList.toggle('no-scroll');

    if (isOpen) {
      toggleIcon.classList.remove('ri-menu-line');
      toggleIcon.classList.add('ri-close-line');
    } else {
      toggleIcon.classList.remove('ri-close-line');
      toggleIcon.classList.add('ri-menu-line');
    }
  });

  const navItemsWithDropdown = document.querySelectorAll('.nav-item.has-dropdown');
  navItemsWithDropdown.forEach((item) => {
    const trigger = item.querySelector('.nav-trigger');

    trigger.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) {
        e.preventDefault();
        item.classList.toggle('is-expanded');

        const icon = trigger.querySelector('i');
        icon.style.transform = item.classList.contains('is-expanded')
          ? 'rotate(180deg)'
          : 'rotate(0deg)';
      }
    });
  });

  const setCurrentPageActive = () => {
    const currentPath = window.location.pathname;
    const allLinks = document.querySelectorAll('.nav-link:not(.association-link), .dropdown-link');

    allLinks.forEach((link) => {
      const linkPath = new URL(link.href, window.location.origin).pathname;

      if (currentPath === linkPath) {
        link.classList.add('active');

        const parentDropdown = link.closest('.dropdown');
        if (parentDropdown) {
          const parentTrigger = parentDropdown.previousElementSibling;
          if (parentTrigger) parentTrigger.classList.add('active');
        }
      }
    });
  };

  setCurrentPageActive();
});
