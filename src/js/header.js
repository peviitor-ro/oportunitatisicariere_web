document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const menuToggleBtn = document.getElementById('menuToggle');
  const toggleIcon = menuToggleBtn.querySelector('i');
  const mainNavigation = document.getElementById('mainNavigation');
  const body = document.body;

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
