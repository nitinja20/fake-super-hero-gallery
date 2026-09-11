// ========== STATE ==========
let currentHero = null;
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let team = [null, null, null, null, null];

// ========== RENDER HERO CARDS ==========
function renderHeroes(list = heroes) {
  const grid = document.getElementById('heroesGrid');
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:40px;">No heroes found.</p>`;
    return;
  }

  list.forEach(hero => {
    const isFav = favorites.includes(hero.id);
    const card = document.createElement('div');
    card.className = `hero-card ${currentHero?.id === hero.id ? 'active' : ''}`;
    card.innerHTML = `
      <button class="heart-btn ${isFav ? 'liked' : ''}" data-id="${hero.id}">${isFav ? '❤️' : '🤍'}</button>
      <img src="${hero.image}" alt="${hero.name}" loading="lazy">
      <div class="card-body">
        <div class="card-name">${hero.name}</div>
        <div class="card-real">${hero.realName}</div>
        <div class="card-tags">
          <span class="tag tag-${hero.type.toLowerCase()}">${hero.type}</span>
          <span class="tag tag-${hero.alignment === 'Hero' ? 'hero' : 'anti'}">${hero.alignment}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('heart-btn')) return;
      showDetail(hero);
    });

    card.querySelector('.heart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(hero.id);
    });

    grid.appendChild(card);
  });
}

// ========== DETAIL PANEL ==========
function showDetail(hero) {
  currentHero = hero;
  document.getElementById('emptyPanel').style.display = 'none';
  const panel = document.getElementById('detailPanel');
  panel.classList.add('visible');

  const avg = Math.round(Object.values(hero.stats).reduce((a, b) => a + b, 0) / 6);

  panel.innerHTML = `
    <div class="detail-header">
      <img src="${hero.image}" alt="${hero.name}">
      <button class="detail-close" id="closeDetail">×</button>
    </div>
    <div class="detail-body">
      <div class="detail-name">${hero.name} <span>${hero.title}</span></div>
      <div class="detail-tags">
        <span class="tag tag-${hero.type.toLowerCase()}">${hero.type}</span>
        <span class="tag tag-${hero.alignment === 'Hero' ? 'hero' : 'anti'}">${hero.alignment}</span>
      </div>
      <div class="detail-info">
        <div><strong>Real Name</strong> ${hero.realName}</div>
        <div><strong>Origin</strong> ${hero.origin}</div>
      </div>
      <div class="detail-bio">${hero.bio}</div>
      <div class="stats-section">
        <h4>Power Stats <span style="color:#94a3b8; font-weight:400; font-size:0.82rem;">(Avg ${avg})</span></h4>
        <div class="stat-bars">
          ${Object.entries(hero.stats).map(([key, val]) => `
            <div class="stat-row">
              <div class="stat-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${val}%"></div></div>
              <div class="stat-value">${val}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="stats-section">
        <h4>Powers & Abilities</h4>
        <div class="powers-list">
          ${hero.powers.map(p => `<span class="power-chip">${p}</span>`).join('')}
        </div>
      </div>
      <div class="detail-quote">“${hero.quote}”</div>
      <div class="detail-actions">
        <button class="btn btn-primary" id="addToTeamBtn">➕ Add to Team</button>
        <button class="btn btn-secondary" id="shareBtn">🔗 Share</button>
      </div>
    </div>
  `;

  document.getElementById('closeDetail').onclick = closeDetail;
  document.getElementById('addToTeamBtn').onclick = () => addToTeam(hero);
  document.getElementById('shareBtn').onclick = () => {
    navigator.clipboard.writeText(`${hero.name} – ${hero.title}\n"${hero.quote}"\n\nFrom Fake Superhero Gallery`);
    alert('Hero info copied!');
  };

  renderHeroes(getFilteredHeroes());
}

function closeDetail() {
  currentHero = null;
  document.getElementById('detailPanel').classList.remove('visible');
  document.getElementById('emptyPanel').style.display = 'block';
  renderHeroes(getFilteredHeroes());
}

// ========== FILTERS ==========
function getFilteredHeroes() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const type = document.getElementById('typeFilter').value;
  const region = document.getElementById('regionFilter').value;
  const alignment = document.getElementById('alignmentFilter').value;
  const gender = document.getElementById('genderFilter').value;

  return heroes.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search) || h.realName.toLowerCase().includes(search);
    const matchType = type === 'all' || h.type === type;
    const matchRegion = region === 'all' || h.region === region;
    const matchAlign = alignment === 'all' || h.alignment === alignment;
    const matchGender = gender === 'all' || h.gender === gender;
    return matchSearch && matchType && matchRegion && matchAlign && matchGender;
  });
}

function applyFilters() {
  renderHeroes(getFilteredHeroes());
}

// ========== FAVORITES ==========
function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderHeroes(getFilteredHeroes());
}

// ========== SURPRISE ==========
function surpriseMe() {
  const list = getFilteredHeroes();
  if (list.length === 0) return;
  const random = list[Math.floor(Math.random() * list.length)];
  showDetail(random);
  setTimeout(() => {
    const active = document.querySelector('.hero-card.active');
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

// ========== TEAM ==========
function addToTeam(hero) {
  const emptyIndex = team.findIndex(t => t === null);
  if (emptyIndex === -1) {
    alert('Team is full! Remove someone first.');
    return;
  }
  if (team.some(t => t && t.id === hero.id)) {
    alert('This hero is already on your team.');
    return;
  }
  team[emptyIndex] = hero;
  updateTeamUI();
}

function removeFromTeam(index) {
  team[index] = null;
  updateTeamUI();
}

function updateTeamUI() {
  const slots = document.querySelectorAll('.team-slot');
  let total = 0;
  let count = 0;

  slots.forEach((slot, i) => {
    if (team[i]) {
      const avg = Math.round(Object.values(team[i].stats).reduce((a, b) => a + b, 0) / 6);
      total += avg;
      count++;
      slot.classList.add('has-hero');
      slot.innerHTML = `
        <img src="${team[i].image}" alt="${team[i].name}">
        <button class="remove" data-index="${i}">×</button>
      `;
      slot.querySelector('.remove').onclick = (e) => {
        e.stopPropagation();
        removeFromTeam(i);
      };
    } else {
      slot.classList.remove('has-hero');
      slot.innerHTML = '';
    }
  });

  const score = count ? Math.round(total / count) : 0;
  document.getElementById('teamScore').textContent = score;
}

// ========== RANKINGS ==========
function renderRankings() {
  const sorted = [...heroes].sort((a, b) => {
    const avgA = Object.values(a.stats).reduce((x, y) => x + y, 0);
    const avgB = Object.values(b.stats).reduce((x, y) => x + y, 0);
    return avgB - avgA;
  });

  const list = document.getElementById('rankingList');
  list.innerHTML = sorted.slice(0, 6).map((h, i) => {
    const avg = Math.round(Object.values(h.stats).reduce((a, b) => a + b, 0) / 6);
    return `
      <div class="rank-item">
        <div class="rank-num">${i + 1}</div>
        <img src="${h.image}" alt="${h.name}">
        <div class="rank-name">${h.name}</div>
        <div class="rank-bar"><div class="rank-bar-fill" style="width:${avg}%"></div></div>
        <div class="rank-score">${avg}</div>
      </div>
    `;
  }).join('');
}

// ========== EVENTS ==========
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('typeFilter').addEventListener('change', applyFilters);
document.getElementById('regionFilter').addEventListener('change', applyFilters);
document.getElementById('alignmentFilter').addEventListener('change', applyFilters);
document.getElementById('genderFilter').addEventListener('change', applyFilters);

document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('typeFilter').value = 'all';
  document.getElementById('regionFilter').value = 'all';
  document.getElementById('alignmentFilter').value = 'all';
  document.getElementById('genderFilter').value = 'all';
  applyFilters();
});

document.getElementById('surpriseBtn').addEventListener('click', surpriseMe);
document.getElementById('buildTeamBtn').addEventListener('click', () => {
  document.getElementById('teamSection').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('saveTeamBtn').addEventListener('click', () => {
  const names = team.filter(t => t).map(t => t.name);
  if (names.length === 0) {
    alert('Add some heroes first!');
    return;
  }
  alert(`Team saved!\n\n${names.join(' • ')}`);
});

// Smooth nav scroll
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ========== INIT ==========
renderHeroes();
renderRankings();
updateTeamUI();
