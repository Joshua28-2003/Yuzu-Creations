const ICON_HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
const ICON_HEART_FILLED = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
const ICON_BUBBLE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-4 10H8v-2h8v2zm0-4H8V6h8v2z"/></svg>';
const ICON_EXTERNAL = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zm-5 5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-6h-2v6H9V10h6V8H9z"/></svg>';

let reactions = [];
let allComments = [];

const guestBase = (() => {
  let key = localStorage.getItem('yuzu_guest');
  if (!key) {
    key = 'g-' + Math.random().toString(36).slice(2, 12);
    localStorage.setItem('yuzu_guest', key);
  }
  return key;
})();

function visitorKey() {
  return API.user && API.user.id ? `u:${API.user.id}` : guestBase;
}

function likeCountFor(projectId) {
  return reactions.filter((r) => r.projectId === Number(projectId)).length;
}

function likedFor(projectId) {
  return reactions.some((r) => r.projectId === Number(projectId) && r.visitorKey === visitorKey());
}

function commentCountFor(projectId) {
  return allComments.filter((c) => c.projectId === Number(projectId)).length;
}

function artworkCard(project) {
  const src = project.imageUrl || '';
  const category = project.category ? `<span class="badge">${escapeHTML(project.category)}</span>` : '';
  const likes = likeCountFor(project.id);
  const comments = commentCountFor(project.id);
  return `
    <article class="art-card">
      <div class="thumb">
        ${src ? `<img src="${escapeHTML(src)}" alt="${escapeHTML(project.title || 'Artwork')}" loading="lazy" />` : ''}
      </div>
      <div class="art-body">
        ${category}
        <h3>${escapeHTML(project.title || 'Untitled')}</h3>
        <p>${escapeHTML(project.description || '')}</p>
        <div class="art-actions">
          <button type="button" class="art-react ${likedFor(project.id) ? 'liked' : ''}" data-action="like" data-id="${project.id}">
            ${likedFor(project.id) ? ICON_HEART_FILLED : ICON_HEART}
            <span class="react-count">${likes}</span>
            <span class="react-lbl">Like</span>
          </button>
          <button type="button" class="art-react" data-action="comments" data-id="${project.id}">
            ${ICON_BUBBLE}
            <span class="react-count">${comments}</span>
            <span class="react-lbl">Comments</span>
          </button>
        </div>
      </div>
    </article>`;
}

function videoCard(video) {
  const src = video.videoUrl || '';
  const category = video.category ? `<span class="badge">${escapeHTML(video.category)}</span>` : '';
  return `
    <article class="video-card">
      <div class="video-frame">
        ${src
          ? `<video src="${escapeHTML(src)}" controls preload="metadata" playsinline></video>`
          : ''}
      </div>
      <div class="video-body">
        ${category}
        <h3>${escapeHTML(video.title || 'Untitled')}</h3>
        <p>${escapeHTML(video.description || '')}</p>
      </div>
    </article>`;
}

function socialLinkCard(link) {
  const meta = metaFor(link.platform);
  if (!meta) return '';
  const href = normalizeUrl(link.url);
  if (!href) return '';
  const name = escapeHTML(link.label || meta.name);
  const displayUrl = escapeHTML(href.replace(/^https?:\/\//, '').replace(/\/+$/, ''));
  return `
    <a class="social-link ${escapeHTML(link.platform)}" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer" title="${escapeHTML(href)}">
      <span class="social-link-ico">${meta.svg}</span>
      <span class="social-link-body">
        <span class="social-link-name">${name}</span>
        <span class="social-link-url">${displayUrl}</span>
      </span>
      <span class="social-link-open">${ICON_EXTERNAL}</span>
    </a>`;
}

function renderProfile(profile) {
  const nameEl = document.getElementById('aboutName');
  if (!nameEl) return;

  const bioEl = document.getElementById('aboutBio');
  const avatarImg = document.getElementById('aboutAvatarImg');
  const greetingEl = document.getElementById('aboutGreeting');
  const footerName = document.getElementById('footerName');

  if (profile) {
    if (greetingEl) greetingEl.textContent = "Hi, I'm";
    if (profile.name) nameEl.textContent = profile.name;
    if (profile.bio && bioEl) bioEl.textContent = profile.bio;
    if (profile.avatarUrl && avatarImg) {
      avatarImg.src = profile.avatarUrl;
      avatarImg.alt = profile.name || 'Profile photo';
    } else if (avatarImg) {
      avatarImg.alt = 'Coming soon';
    }
    if (profile.name && footerName) footerName.textContent = profile.name;
  }
}

function renderHeroStats(projects, songs, videos, links, stats) {
  const el = document.getElementById('heroStats');
  if (!el) return;
  const bits = [];
  if (projects) bits.push(`<span class="hero-stat"><strong>${projects.length || 0}</strong> artworks</span>`);
  if (songs) bits.push(`<span class="hero-stat"><strong>${songs.length || 0}</strong> songs</span>`);
  if (videos) bits.push(`<span class="hero-stat"><strong>${videos.length || 0}</strong> videos</span>`);
  if (links) bits.push(`<span class="hero-stat"><strong>${links.length || 0}</strong> social links</span>`);
  if (stats && typeof stats.visits === 'number') bits.push(`<span class="hero-stat"><strong>${stats.visits}</strong> visits</span>`);
  el.innerHTML = bits.join('');
}

function bindGalleryEvents() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  grid.querySelectorAll('[data-action="like"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const projectId = Number(btn.dataset.id);
      btn.disabled = true;
      try {
        const res = await API.post('/reactions/toggle', { projectId, visitorKey: visitorKey() });
        if (res.liked) {
          reactions.push({ projectId, visitorKey: visitorKey() });
          btn.classList.add('liked');
          btn.querySelector('svg').outerHTML = ICON_HEART_FILLED;
        } else {
          reactions = reactions.filter(
            (r) => !(r.projectId === projectId && r.visitorKey === visitorKey())
          );
          btn.classList.remove('liked');
          btn.querySelector('svg').outerHTML = ICON_HEART;
        }
        btn.querySelector('.react-count').textContent = res.count;
      } catch (err) {
        toast(err.message);
      } finally {
        btn.disabled = false;
      }
    });
  });

  grid.querySelectorAll('[data-action="comments"]').forEach((btn) => {
    btn.addEventListener('click', () => openComments(Number(btn.dataset.id)));
  });
}

const MUSIC_NOTE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5l12-2v13a3 3 0 1 1-2-2.83V6.53l-8 1.33V18a3 3 0 1 1-2-2.83z"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
const ICON_PREV = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>';
const ICON_NEXT = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>';

const music = {
  queue: [],
  index: -1,
  audio: new Audio(),
  bound: false,
};

function fmtTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ensureAudioEvents() {
  if (music.bound) return;
  music.bound = true;

  const a = music.audio;

  a.addEventListener('loadedmetadata', () => {
    const total = document.getElementById('plTotal');
    if (total) total.textContent = fmtTime(a.duration);
  });

  a.addEventListener('timeupdate', () => {
    const current = document.getElementById('plCurrent');
    const seek = document.getElementById('plSeek');
    if (!current || !seek) return;
    current.textContent = fmtTime(a.currentTime);
    if (Number.isFinite(a.duration) && a.duration > 0) {
      seek.value = Math.round((a.currentTime / a.duration) * 1000);
    }
  });

  a.addEventListener('play', () => {
    updatePlayButton(true);
    updateActiveRow();
  });
  a.addEventListener('pause', () => {
    updatePlayButton(false);
    updateActiveRow();
  });
  a.addEventListener('ended', () => playIndex(music.index + 1));
}

function updatePlayButton(isPlaying) {
  const btn = document.getElementById('plPlayToggle');
  if (!btn) return;
  btn.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
  btn.title = isPlaying ? 'Pause' : 'Play';
}

function updateActiveRow() {
  document.querySelectorAll('#playlist .track').forEach((row) => {
    const i = Number(row.dataset.i);
    const isCurrent = i === music.index && music.audio.src && !music.audio.paused;
    row.classList.toggle('active', i === music.index);
    const play = row.querySelector('.track-play');
    if (play) play.innerHTML = isCurrent ? ICON_PAUSE : ICON_PLAY;
    const eq = row.querySelector('.eq-holder');
    if (i === music.index) {
      if (!eq) {
        row.insertAdjacentHTML('beforeend', '<span class="eq eq-holder"><span></span><span></span><span></span></span>');
      }
    } else if (eq) {
      eq.remove();
    }
  });
}

function playIndex(i) {
  if (!music.queue.length) return;
  const wrapped = ((i % music.queue.length) + music.queue.length) % music.queue.length;
  music.index = wrapped;
  const song = music.queue[wrapped];

  music.audio.src = song.audioUrl;
  music.audio.play().catch(() => {});

  const title = document.getElementById('plTitle');
  const artist = document.getElementById('plArtist');
  const cover = document.getElementById('plCover');
  if (title) title.textContent = song.title || 'Untitled';
  if (artist) artist.textContent = song.artist || 'Unknown artist';
  if (cover) cover.innerHTML = song.coverUrl
    ? `<img src="${escapeHTML(song.coverUrl)}" alt="${escapeHTML(song.title || '')}" />`
    : MUSIC_NOTE;
  updateActiveRow();
}

function togglePlay() {
  if (!music.queue.length) return;
  if (!music.audio.src) {
    playIndex(music.index >= 0 ? music.index : 0);
    return;
  }
  if (music.audio.paused) {
    music.audio.play().catch(() => {});
  } else {
    music.audio.pause();
  }
}

function renderMusic(songs) {
  const host = document.getElementById('musicHost');
  if (!host) return;
  if (!songs.length) {
    host.innerHTML = '<div class="empty">No songs yet. Add your own music from the dashboard.</div>';
    return;
  }

  music.queue = songs;
  if (music.index < 0 || music.index >= songs.length) music.index = 0;

  const first = songs[music.index];
  host.innerHTML = `
    <div class="player-card">
      <div class="player-current">
        <div class="player-cover" id="plCover">
          ${first.coverUrl ? `<img src="${escapeHTML(first.coverUrl)}" alt="${escapeHTML(first.title || '')}" />` : MUSIC_NOTE}
        </div>
        <div class="player-meta">
          <span class="badge">Now playing</span>
          <h3 id="plTitle">${escapeHTML(first.title || 'Untitled')}</h3>
          <p class="muted" id="plArtist">${escapeHTML(first.artist || 'Unknown artist')}</p>
          <div class="player-times">
            <span id="plCurrent">0:00</span>
            <input id="plSeek" class="pl-seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek" />
            <span id="plTotal">0:00</span>
          </div>
          <div class="player-controls">
            <button id="plPrev" class="icon-btn" title="Previous">${ICON_PREV}</button>
            <button id="plPlayToggle" class="icon-btn play" title="Play">${ICON_PLAY}</button>
            <button id="plNext" class="icon-btn" title="Next">${ICON_NEXT}</button>
          </div>
        </div>
      </div>
      <ul class="playlist" id="playlist">
        ${songs.map((s, i) => `
          <li class="track" data-i="${i}" title="${escapeHTML(s.title || '')}">
            <button class="track-play" data-i="${i}">${i === music.index ? ICON_PAUSE : ICON_PLAY}</button>
            <div class="track-info">
              <h4>${escapeHTML(s.title || 'Untitled')}</h4>
              <p>${escapeHTML(s.artist || 'Unknown artist')}</p>
            </div>
            ${i === music.index ? '<span class="eq"><span style="height:8px"></span><span style="height:4px"></span><span style="height:11px"></span></span>' : ''}
          </li>`).join('')}
      </ul>
    </div>`;

  document.getElementById('plPrev').addEventListener('click', () => playIndex(music.index - 1));
  document.getElementById('plNext').addEventListener('click', () => playIndex(music.index + 1));
  document.getElementById('plPlayToggle').addEventListener('click', togglePlay);

  const seek = document.getElementById('plSeek');
  seek.addEventListener('input', () => {
    if (Number.isFinite(music.audio.duration) && music.audio.duration > 0) {
      music.audio.currentTime = (seek.value / 1000) * music.audio.duration;
    }
  });

  document.querySelectorAll('#playlist .track-play').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i);
      if (i === music.index && !music.audio.paused) {
        music.audio.pause();
      } else {
        playIndex(i);
      }
    });
  });
}

let activeProjectId = null;
let activeProjectTitle = '';

function openComments(projectId) {
  const project = (window.__projects || []).find((p) => Number(p.id) === projectId);
  activeProjectId = projectId;
  activeProjectTitle = project ? project.title || 'Artwork' : 'Artwork';
  document.getElementById('cmArtworkTitle').textContent = activeProjectTitle;
  if (API.user) {
    document.getElementById('cmName').value = API.user.name || '';
  }
  renderCommentList();
  document.getElementById('commentModal').hidden = false;
  document.body.classList.add('modal-open');
  document.getElementById('cmText').focus();
}

function closeComments() {
  document.getElementById('commentModal').hidden = true;
  document.body.classList.remove('modal-open');
}

function renderCommentList() {
  const el = document.getElementById('cmComments');
  const items = allComments
    .filter((c) => c.projectId === activeProjectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!items.length) {
    el.innerHTML = '<div class="comment-empty">No comments yet. Be the first to say something!</div>';
    return;
  }
  el.innerHTML = items
    .map((c) => `
      <div class="comment-row">
        <div class="comment-head">
          <strong>${escapeHTML(c.name)}</strong>
          <span class="comment-date">${formatDate(c.createdAt)}</span>
        </div>
        <p>${escapeHTML(c.text)}</p>
      </div>`).join('');
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

function setupComments() {
  const closeBtn = document.getElementById('cmClose');
  if (!closeBtn) return;
  closeBtn.addEventListener('click', closeComments);
  document.getElementById('cmBackdrop').addEventListener('click', closeComments);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeComments();
  });

  document.getElementById('cmSend').addEventListener('click', postComment);
  document.getElementById('cmText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postComment();
  });
}

async function postComment() {
  const text = document.getElementById('cmText').value.trim();
  if (!text || activeProjectId == null) return toast('Write a comment first');
  const name = document.getElementById('cmName').value.trim();
  const btn = document.getElementById('cmSend');
  btn.disabled = true;
  try {
    const comment = await API.post('/comments', { projectId: activeProjectId, text, name });
    allComments.push(comment);
    document.getElementById('cmText').value = '';
    renderCommentList();
    renderGallery();
    toast('Comment posted');
  } catch (err) {
    toast(err.message);
  } finally {
    btn.disabled = false;
  }
}

function trackVisit() {
  if (sessionStorage.getItem('yuzu_visited')) return;
  sessionStorage.setItem('yuzu_visited', '1');
  API.post('/stats/visit').catch(() => {});
}

function renderGallery() {
  const galleryEl = document.getElementById('galleryGrid');
  if (!galleryEl) return;
  const projectList = window.__projects || [];
  if (projectList.length) {
    galleryEl.innerHTML = projectList.map(artworkCard).join('');
  } else {
    galleryEl.innerHTML = '<div class="empty">No artworks yet. Log in as admin to upload your first piece.</div>';
  }
  bindGalleryEvents();
}

document.addEventListener('DOMContentLoaded', async () => {
  ensureAudioEvents();
  setupComments();
  trackVisit();

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const galleryEl = document.getElementById('galleryGrid');
  const videosEl = document.getElementById('videosGrid');
  const socialsEl = document.getElementById('socialsList');

  try {
    const [profileRes, projects, links, songs, videos, comments, reactionList, stats] = await Promise.allSettled([
      API.get('/profile'),
      API.get('/projects'),
      API.get('/links'),
      API.get('/songs'),
      API.get('/videos'),
      API.get('/comments'),
      API.get('/reactions'),
      API.get('/stats'),
    ]);

    const v = (r) => (r && r.status === 'fulfilled' ? r.value : null);
    const profile = v(profileRes);
    const projectList = v(projects) || [];
    const allLinks = v(links) || [];
    const songList = v(songs) || [];
    const videoList = v(videos) || [];
    reactions = v(reactionList) || [];
    allComments = v(comments) || [];
    const statsData = v(stats);

    window.__projects = projectList;

    renderProfile(profile ? profile.profile : null);
    renderHeroStats(projectList, songList, videoList, allLinks, statsData);
    renderMusic(songList);
    renderGallery();

    if (videosEl) {
      videosEl.innerHTML = videoList.length
        ? videoList.map(videoCard).join('')
        : '<div class="empty">No videos yet. Add your own clips from the dashboard.</div>';
    }

    if (socialsEl) {
      socialsEl.innerHTML = allLinks.length
        ? allLinks.map(socialLinkCard).join('')
        : '<div class="empty">No social links yet. Log in as admin to add your Facebook, TikTok, Twitch, and more.</div>';
    }
  } catch (err) {
    if (galleryEl) galleryEl.innerHTML = '<div class="empty">Could not load content.</div>';
    if (videosEl) videosEl.innerHTML = '';
    if (socialsEl) socialsEl.innerHTML = '';
    toast(err.message);
  }
});