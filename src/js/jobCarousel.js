document.addEventListener('DOMContentLoaded', () => {
  const rolesContainer = document.getElementById('rolesCarousel');
  const searchInput = document.getElementById('rolesSearch');
  const searchBtn = document.querySelector('.search-icon-btn');
  const dataUrl = '../data/positions.json';

  let allJobs = [];
  let swiperInstance = null; // Păstrăm instanța caruselului

  // Funcție pentru inițializarea Swiper
  function initSwiper(jobsCount) {
    // Dacă există deja un carusel, îl distrugem pentru a-l reface cu noile date
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
    }

    // Swiper are nevoie de minim slide-uri egale cu slidesPerView pentru un loop perfect.
    // Deoarece afișăm 3 pe desktop, activăm loop-ul infinit doar dacă avem >= 3 joburi.
    const shouldLoop = jobsCount >= 3;

    swiperInstance = new Swiper('.roles-swiper', {
      // Setări de bază
      centeredSlides: true,
      grabCursor: true, // Arată iconița de "mână" pentru drag
      loop: shouldLoop,

      // Rotație automată la timp
      autoplay: {
        delay: 3500, // Se schimbă la 3.5 secunde
        disableOnInteraction: false, // Continuă autoplay-ul chiar și după ce tragi de el
      },

      // Setări Responsive (Afișăm maxim 3)
      breakpoints: {
        0: {
          slidesPerView: 1.2, // Pe mobil arătăm 1 card și o bucată din următorul
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 3, // Afișăm fix 3 pe desktop
          spaceBetween: 40, // Gap mai mare între carduri
        },
      },
    });
  }

  function renderRoles(roles) {
    if (!rolesContainer) return;
    rolesContainer.innerHTML = '';

    // 1. Cazul Empty State (Niciun rezultat)
    if (roles.length === 0) {
      // Dacă nu sunt rezultate, distrugem swiper-ul să nu se comporte ciudat
      if (swiperInstance) swiperInstance.destroy(true, true);

      rolesContainer.innerHTML = `
        <div class="empty-state-card shade" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 6rem 2rem; border-radius: 2.4rem; background: #ffffff; text-align: center; border: 1px dashed #00c288;">
          <i class="ri-ghost-line" style="font-size: 5.6rem; color: #00c288; margin-bottom: 1rem; display: inline-block;"></i>
          <h3 style="font-size: 2.4rem; color: #101828; margin-bottom: 1rem;">Hopa! 🕵️‍♂️</h3>
          <p style="font-size: 1.6rem; color: #667085;">Am căutat prin toate birourile, dar se pare că acest rol a luat o pauză lungă de cafea. Încearcă un alt termen!</p>
        </div>
      `;
      return;
    }

    // 2. Generarea cardurilor
    roles.forEach((job) => {
      // Swiper necesită ca fiecare element să fie un "swiper-slide"
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';

      slide.innerHTML = `
        <a href="/html/job-details.html?id=${job.id}" class="role-card">
          <div class="card-img-wrapper">
            <img src="${job.image || './assets/placeholder.jpg'}" alt="${job.title}">
          </div>
          <div class="card-gradient"></div>
          <div class="card-hover-overlay">
            <div class="apply-btn-mock">
              <span>Aplică</span>
              <i class="ri-arrow-right-up-line"></i>
            </div>
          </div>
          <h3 class="card-title">${job.title}</h3>
        </a>
      `;

      rolesContainer.appendChild(slide);
    });

    // 3. Inițializăm caruselul după ce am adăugat slide-urile în DOM
    initSwiper(roles.length);
  }

  // Logica de căutare
  function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm.length >= 2) {
      const filteredJobs = allJobs.filter((job) => job.title.toLowerCase().includes(searchTerm));
      renderRoles(filteredJobs);
    } else {
      renderRoles(allJobs);
    }
  }

  searchInput?.addEventListener('input', handleSearch);
  searchBtn?.addEventListener('click', handleSearch);

  async function fetchAndRenderRoles() {
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) throw new Error(`Eroare HTTP! Status: ${response.status}`);

      allJobs = await response.json();
      renderRoles(allJobs);
    } catch (error) {
      console.error('Eroare:', error);
      if (rolesContainer) {
        rolesContainer.innerHTML = `<p style="text-align: center;">Nu am putut încărca pozițiile.</p>`;
      }
    }
  }

  fetchAndRenderRoles();
});
