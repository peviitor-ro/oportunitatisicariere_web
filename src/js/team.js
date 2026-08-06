document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements & State
  const teamNavbar = document.querySelector('#teamNavbar');
  const membersWrapper = document.querySelector('#teamWrapper');
  const loadMoreBtn = document.querySelector('#loadMoreBtn');

  const ITEMS_PER_PAGE = 9;
  const AOS_ANIMATION = 'fade-up';
  const AOS_DELAY_STEP = 90;

  let teamMembers = [];
  let currentTeamMembers = [];
  let currentPage = 1;
  let currentActiveTeam = '';

  const preferredTeam = sessionStorage.getItem('preferredTeam');

  const months = [
    'Ianuarie',
    'Februarie',
    'Martie',
    'Aprilie',
    'Mai',
    'Iunie',
    'Iulie',
    'August',
    'Septembrie',
    'Octombrie',
    'Noiembrie',
    'Decembrie',
  ];
  const shortMonths = months.map((el) => el.slice(0, 3));

  // Compute full years of experience since a join date
  function calculateYearsOfExp(joinedAt) {
    if (!joinedAt) return null;

    const joinDate = new Date(joinedAt);
    if (Number.isNaN(joinDate.getTime())) return null;

    const todayDate = new Date();
    let yearsOfExp = todayDate.getFullYear() - joinDate.getFullYear();
    const isAnniversaryDay =
      todayDate.getMonth() > joinDate.getMonth() ||
      (todayDate.getMonth() === joinDate.getMonth() && todayDate.getDate() >= joinDate.getDate());

    if (!isAnniversaryDay) yearsOfExp -= 1;

    return Math.max(yearsOfExp, 0);
  }

  function calculateMonthsOfExp(joinedAt) {
    if (!joinedAt) return null;

    const joinDate = new Date(joinedAt);
    if (Number.isNaN(joinDate.getTime())) return null;

    const todayDate = new Date();
    let monthsOfExp =
      (todayDate.getFullYear() - joinDate.getFullYear()) * 12 +
      (todayDate.getMonth() - joinDate.getMonth());

    if (todayDate.getDate() < joinDate.getDate()) monthsOfExp -= 1;

    return Math.max(monthsOfExp, 0);
  }

  function yearsOfExpeLabel(yearsOfExp, monthsOfExp) {
    if (yearsOfExp === null) return '';
    if (yearsOfExp >= 1) {
      return yearsOfExp === 1 ? '1 an' : `${yearsOfExp} ani`;
    }

    if (monthsOfExp === null) return '';
    if (monthsOfExp < 1) return '1 lună';
    return monthsOfExp === 1 ? '1 lună' : `${monthsOfExp} luni`;
  }

  // Full date for Tooltip
  function fullJoinDate(joinedAt) {
    if (!joinedAt) return null;

    const joinDate = new Date(joinedAt);
    if (Number.isNaN(joinDate.getTime())) return null;

    const day = joinDate.getDate();
    const month = shortMonths[joinDate.getMonth()];
    const year = joinDate.getFullYear();

    return `${day} • ${month} • ${year}`;
  }

  // Path resolver
  const resolvePath = (targetPath) => {
    const depth = window.location.pathname.includes('/html/') ? '../' : './';
    const cleanPath = targetPath.replace(/^(\.\/|\/)/, '');
    return `${depth}${cleanPath}`;
  };

  // Fetch data
  function loadTeamMembers() {
    fetch(resolvePath('data/volunteers.json'))
      .then((response) => response.json())
      .then((data) => {
        teamMembers = data
          .map((member) => {
            const activeRoles = member.roles.filter((role) => role.status === true);
            if (activeRoles.length === 0) return null;
            return { ...member, roles: activeRoles };
          })
          .filter((member) => member !== null);

        initializeTeams();
      })
      .catch((error) => console.error('Eroare la încărcarea voluntarilor:', error));
  }

  // Initialize teams navigation
  function initializeTeams() {
    const teams = [
      ...new Set(teamMembers.flatMap((member) => member.roles.map((role) => role.team))),
    ];

    let firstButton = null;
    let hasActiveBtn = false;

    for (const team of teams) {
      const li = document.createElement('li');
      const button = document.createElement('button');

      button.type = 'button';
      button.classList.add('team-btn');
      button.textContent = team;

      if (!firstButton) firstButton = button;

      button.addEventListener('click', () => {
        document.querySelectorAll('.team-btn').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        currentPage = 1;
        currentActiveTeam = team;

        filterAndSortTeam(team);
        membersWrapper.innerHTML = '';
        renderMembersBatch();
      });

      li.appendChild(button);
      teamNavbar.appendChild(li);

      if (preferredTeam === team) {
        button.classList.add('active');
        hasActiveBtn = true;
        currentActiveTeam = team;
      }
    }

    if ((!preferredTeam || !hasActiveBtn) && firstButton) {
      firstButton.classList.add('active');
      currentActiveTeam = firstButton.textContent;
    }

    if (currentActiveTeam) {
      filterAndSortTeam(currentActiveTeam);
      renderMembersBatch();
    }
  }

  // Filter and sort team members
  function filterAndSortTeam(selectedTeam) {
    const filteredMembers = teamMembers.filter((member) =>
      member.roles.some((role) => role.team === selectedTeam)
    );

    currentTeamMembers = filteredMembers.sort((a, b) => {
      const aIsLeader = a.roles.some((role) => role.team === selectedTeam && role.teamLead);
      const bIsLeader = b.roles.some((role) => role.team === selectedTeam && role.teamLead);
      return bIsLeader - aIsLeader;
    });
  }

  // Render members batch
  function renderMembersBatch() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const membersToRender = currentTeamMembers.slice(startIndex, endIndex);

    membersToRender.forEach((member, index) => {
      const role = member.roles.find((r) => r.team === currentActiveTeam);
      if (!role) return;

      // 1. Fixed element tag to <div> to match main SCSS layout
      const card = document.createElement('div');
      card.classList.add('member-card');

      // 2. Attach AOS attributes directly on card creation
      card.setAttribute('data-aos', AOS_ANIMATION);
      card.setAttribute('data-aos-delay', `${(index % 3) * AOS_DELAY_STEP}`);
      card.setAttribute('data-aos-duration', '700');
      card.setAttribute('data-aos-easing', 'ease-out-cubic');

      const isLeader = role.teamLead;
      if (isLeader) {
        card.classList.add('member-card--leader');
      }

      const socials = member.socials || {};

      let socialHTML = '';
      if (socials.linkedin) {
        socialHTML += `
          <a href="${socials.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="ri-linkedin-fill"></i></a>`;
      }

      if (socials.github) {
        socialHTML += `
          <a href="${socials.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="ri-github-fill"></i></a>`;
      }

      if (socials.discord) {
        socialHTML += `
          <a href="${socials.discord}" target="_blank" rel="noopener noreferrer" aria-label="Discord"><i class="ri-discord-fill"></i></a>`;
      }

      const avatarPath = resolvePath(member.avatar);

      const leaderBadgeHTML = `
      <span class="badge-leader"${isLeader ? '' : ' aria-hidden="true"'}>
        <i class="ri-vip-crown-fill"></i> Team Lead
      </span>
      `;

      const yearsOfExperience = calculateYearsOfExp(member.joinedAt);
      const monthsOfExperience = calculateMonthsOfExp(member.joinedAt);
      const experienceLabel = yearsOfExpeLabel(yearsOfExperience, monthsOfExperience);
      const join = fullJoinDate(member.joinedAt);

      const experienceBadgeHTML =
        experienceLabel && join
          ? `
            <span class="badge-experience" tabindex="0">
              <i class="ri-calendar-check-line"></i> Experiență: ${experienceLabel}
              <span class="badge-experience__tooltip" role="tooltip">${join}</span>
            </span>
          `
          : '';

      card.innerHTML = `
      <div class="member-card__img-wrapper">
        <img src="${avatarPath}" alt="${member.name}" loading="lazy" />
      </div>
      <div class="member-card__content">
        ${leaderBadgeHTML}
        ${experienceBadgeHTML}
        <div class="member-card__name-position">
          <h4 class="name">${member.name}</h4>
          <p class="role">${role.position}</p>
        </div>
        <div class="social-links">
          ${socialHTML}
        </div>
      </div>
    `;

      membersWrapper.appendChild(card);
    });

    // 3. Reliable AOS refresh timing for dynamically injected elements
    if (typeof AOS !== 'undefined') {
      setTimeout(() => {
        AOS.refresh();
      }, 50);
    }

    if (endIndex >= currentTeamMembers.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  }

  // Event listeners
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      renderMembersBatch();
    });
  }

  membersWrapper.addEventListener('click', (event) => {
    const link = event.target.closest('a');

    if (link) {
      const hrefValue = link.getAttribute('href');

      if (hrefValue === '#') {
        event.preventDefault();
      }
    }
  });

  // Initialization
  loadTeamMembers();
});