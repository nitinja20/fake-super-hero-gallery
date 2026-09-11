// ========== STATE ==========
let currentHero = null;
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let team = [null, null, null, null, null];
let compareList = [];

// Use allCharacters so villains also show
const characters = typeof allCharacters !== 'undefined' ? allCharacters : heroes;

// ========== RENDER CARDS ==========
function renderHeroes(list = characters) {
  const grid = document.getElementById('heroesGrid');
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:40px;">No characters found.</p>`;
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
          <span class="tag tag-${hero.alignment === 'Hero' ? 'hero' : (hero.alignment === 'Villain' ? 'anti' : 'anti')}">${hero.alignment}</span>
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

// ========== DETAIL PANEL + HERO SLIDER ==========
function getHeroIndex(hero = currentHero) {
  return hero ? characters.findIndex(h => h.id === hero.id) : -1;
}

function showDetail(hero, direction = 0) {
  if (!hero) return;
  currentHero = hero;
  document.getElementById('emptyPanel').style.display = 'none';
  const panel = document.getElementById('detailPanel');
  panel.classList.add('visible');

  const avg = Math.round(Object.values(hero.stats).reduce((a, b) => a + b, 0) / Object.keys(hero.stats).length);
  const isFav = favorites.includes(hero.id);
  const index = getHeroIndex(hero);
  const prev = characters[(index - 1 + characters.length) % characters.length];
  const next = characters[(index + 1) % characters.length];

  // Show a small sliding window of characters around the selected hero.
  const thumbs = [-2, -1, 0, 1, 2].map(offset => {
    return characters[(index + offset + characters.length) % characters.length];
  });

  const strengthsHtml = (hero.strengths || []).map(s => `<span class="power-chip strength-chip">${s}</span>`).join('');
  const weaknessesHtml = (hero.weaknesses || []).map(w => `<span class="power-chip weakness-chip">${w}</span>`).join('');

  panel.innerHTML = `
    <div class="detail-showcase">
      <img class="detail-hero-image" src="${hero.image}" alt="${hero.name}">
      <div class="detail-image-overlay"></div>
      <button class="slider-arrow slider-prev" id="prevHero" aria-label="Previous hero">‹</button>
      <button class="slider-arrow slider-next" id="nextHero" aria-label="Next hero">›</button>
      <button class="detail-favorite ${isFav ? 'liked' : ''}" id="detailFavorite" aria-label="Favorite hero">${isFav ? '♥' : '♡'}</button>
      <div class="detail-counter">${index + 1} / ${characters.length}</div>
      <div class="hero-thumbnails">
        ${thumbs.map((h, i) => `
          <button class="hero-thumb ${h.id === hero.id ? 'selected' : ''}" data-id="${h.id}" aria-label="View ${h.name}">
            <img src="${h.image}" alt="${h.name}">
          </button>
        `).join('')}
      </div>
    </div>

    <div class="detail-body">
      <div class="detail-title-row">
        <div>
          <div class="detail-name">${hero.name} <span>${hero.title || ''}</span></div>
          <div class="detail-tags">
            <span class="tag tag-${hero.type.toLowerCase()}">${hero.type}</span>
            <span class="tag tag-${hero.alignment === 'Hero' ? 'hero' : 'anti'}">${hero.alignment}</span>
          </div>
        </div>
      </div>

      <div class="detail-info">
        <div><strong>Real Name</strong><span>${hero.realName || 'Unknown'}</span></div>
        <div><strong>Origin</strong><span>${hero.origin || 'Unknown'}</span></div>
      </div>

      <div class="detail-bio">${hero.bio || ''}</div>

      <div class="detail-content-grid">
        <div class="detail-stats-card">
          <div class="stats-section">
            <h4>Power Stats <span class="avg-label">(Avg ${avg})</span></h4>
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
        </div>

        <div class="detail-abilities-card">
          <div class="stats-section">
            <h4>Powers & Abilities</h4>
            <div class="powers-list abilities-list">
              ${(hero.powers || []).map((p, i) => `<div class="ability-row"><span class="ability-icon">${['✧','ϟ','◉','◈','✦'][i % 5]}</span><span>${p}</span></div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      ${hero.strengths ? `<div class="stats-section compact-section"><h4 class="green-heading">Strengths</h4><div class="powers-list">${strengthsHtml}</div></div>` : ''}
      ${hero.weaknesses ? `<div class="stats-section compact-section"><h4 class="red-heading">Weaknesses</h4><div class="powers-list">${weaknessesHtml}</div></div>` : ''}

      <div class="detail-quote">“${hero.quote || ''}”</div>
      <div class="detail-actions">
        <button class="btn btn-primary" id="addToTeamBtn">👥 Add to Team</button>
        <button class="btn btn-secondary" id="compareBtn">⚖️ Compare</button>
      </div>
    </div>
  `;

  document.getElementById('prevHero').onclick = () => showDetail(prev, -1);
  document.getElementById('nextHero').onclick = () => showDetail(next, 1);
  document.getElementById('detailFavorite').onclick = () => toggleFavorite(hero.id, true);
  document.getElementById('addToTeamBtn').onclick = () => addToTeam(hero);
  document.getElementById('compareBtn').onclick = () => addToCompare(hero);

  panel.querySelectorAll('.hero-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = characters.find(h => h.id === Number(btn.dataset.id));
      if (selected) showDetail(selected);
    });
  });

  // Keyboard slider support while the detail panel is open.
  panel.classList.remove('detail-enter');
  void panel.offsetWidth;
  panel.classList.add('detail-enter');

  renderHeroes(getFilteredHeroes());
}

function closeDetail() {
  currentHero = null;
  document.getElementById('detailPanel').classList.remove('visible');
  document.getElementById('emptyPanel').style.display = 'block';
  renderHeroes(getFilteredHeroes());
}

document.addEventListener('keydown', (e) => {
  if (!currentHero) return;
  if (e.key === 'ArrowLeft') showDetail(characters[(getHeroIndex() - 1 + characters.length) % characters.length], -1);
  if (e.key === 'ArrowRight') showDetail(characters[(getHeroIndex() + 1) % characters.length], 1);
  if (e.key === 'Escape') closeDetail();
});

// ========== FILTERS (FIXED) ==========
function getFilteredHeroes() {
  const search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const type = document.getElementById('typeFilter').value;
  const region = document.getElementById('regionFilter').value;
  const alignment = document.getElementById('alignmentFilter').value;
  const gender = document.getElementById('genderFilter').value;

  return characters.filter(h => {
    const matchSearch = !search || 
      h.name.toLowerCase().includes(search) || 
      (h.realName && h.realName.toLowerCase().includes(search));
    
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
function toggleFavorite(id, refreshDetail = false) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderHeroes(getFilteredHeroes());
  if (refreshDetail && currentHero) showDetail(currentHero);
}

// ========== SURPRISE ==========
function surpriseMe() {
  const list = getFilteredHeroes();
  if (list.length === 0) return;
  const random = list[Math.floor(Math.random() * list.length)];
  showDetail(random);
}

// ========== TEAM ==========
function addToTeam(hero) {
  const emptyIndex = team.findIndex(t => t === null);
  if (emptyIndex === -1) {
    alert('Team is full! Remove someone first.');
    return;
  }
  if (team.some(t => t && t.id === hero.id)) {
    alert('Already on team.');
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
  let total = 0, count = 0;

  slots.forEach((slot, i) => {
    if (team[i]) {
      const avg = Math.round(Object.values(team[i].stats).reduce((a, b) => a + b, 0) / 6);
      total += avg;
      count++;
      slot.classList.add('has-hero');
      slot.innerHTML = `<img src="${team[i].image}" alt="${team[i].name}"><button class="remove" data-index="${i}">×</button>`;
      slot.querySelector('.remove').onclick = (e) => { e.stopPropagation(); removeFromTeam(i); };
    } else {
      slot.classList.remove('has-hero');
      slot.innerHTML = '';
    }
  });

  document.getElementById('teamScore').textContent = count ? Math.round(total / count) : 0;
}

// ========== COMPARE ==========
function addToCompare(hero) {
  if (compareList.find(c => c.id === hero.id)) {
    alert('Already in compare list');
    return;
  }
  if (compareList.length >= 2) {
    compareList = [compareList[1], hero];
  } else {
    compareList.push(hero);
  }
  updateCompareUI();
}

function updateCompareUI() {
  const box = document.getElementById('compareBox');
  if (!box) return;

  if (compareList.length === 0) {
    box.innerHTML = `<p style="color:#94a3b8; font-size:0.9rem;">Select heroes and click Compare</p>`;
    return;
  }

  let html = `<div style="display:flex; gap:12px; flex-wrap:wrap;">`;
  compareList.forEach((h, idx) => {
    html += `
      <div style="flex:1; min-width:140px; background:rgba(255,255,255,0.04); padding:10px; border-radius:10px;">
        <div style="font-weight:700; margin-bottom:6px;">${h.name}</div>
        ${Object.entries(h.stats).map(([k,v]) => `
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:3px;">
            <span style="color:#94a3b8;">${k}</span>
            <span>${v}</span>
          </div>
        `).join('')}
        <button onclick="removeFromCompare(${idx})" style="margin-top:8px; background:#ef4444; border:none; color:white; padding:4px 8px; border-radius:6px; cursor:pointer; font-size:0.75rem;">Remove</button>
      </div>
    `;
  });
  html += `</div>`;

  if (compareList.length === 2) {
    const a = compareList[0], b = compareList[1];
    let aWins = 0, bWins = 0;
    Object.keys(a.stats).forEach(k => {
      if (a.stats[k] > b.stats[k]) aWins++;
      else if (b.stats[k] > a.stats[k]) bWins++;
    });
    html += `<div style="margin-top:12px; text-align:center; font-weight:700; color:#a78bfa;">
      Winner: ${aWins > bWins ? a.name : bWins > aWins ? b.name : 'Tie'} (${Math.max(aWins,bWins)} categories)
    </div>`;
  }

  box.innerHTML = html;
}

function removeFromCompare(idx) {
  compareList.splice(idx, 1);
  updateCompareUI();
}

// ========== RANKINGS ==========
function renderRankings() {
  const sorted = [...characters].sort((a, b) => {
    const avgA = Object.values(a.stats).reduce((x, y) => x + y, 0);
    const avgB = Object.values(b.stats).reduce((x, y) => x + y, 0);
    return avgB - avgA;
  });

  document.getElementById('rankingList').innerHTML = sorted.slice(0, 8).map((h, i) => {
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

// ========== INIT ==========
renderHeroes();
renderRankings();
updateTeamUI();
updateCompareUI();
