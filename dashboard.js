const $ = (id) => document.getElementById(id);

let user = null;
let editId = null;
let platforms = [];
let links = [];
let videos = [];
let editSongId = null;
let editSongUrl = '';
let editVideoId = null;
let editVideoUrl = '';
let pendingAvatarUrl = '';
let feedback = [];
let adminUsers = [];
let banTargetId = null;
let feedbackFilter = '';

function requireAuth() {
  if (!API.token || !API.user) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

async function api(fn, ...args) {
  try {
    return await fn(...args);
  } catch (err) {
    if (err.status === 401) {
      API.clearSession();
      window.location.href = 'login.html';
      return null;
    }
    toast(err.message);
    return null;
  }
}

/* ============================= TABS ============================= */

function showPage(name) {
  document.querySelectorAll('.dash-page').forEach((s) => s.classList.toggle('hidden', s.dataset.page !== name));
  document.querySelectorAll('.dash-tab').forEach((b) => b.classList.toggle('active', b.dataset.page === name));
}

function setupTabs() {
  const tabs = $('adminTabs');
  if (!tabs) return;
  tabs.querySelectorAll('.dash-tab').forEach((btn) => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });
}

/* ============================= ARTWORKS ============================= */

function projectItemHTML(p) {
  const src = p.imageUrl || '';
  return `
    <div class="proj-item" data-id="${p.id}">
      <div class="p-thumb">
        ${src ? `<img src="${escapeHTML(src)}" alt="${escapeHTML(p.title)}" />` : ''}
      </div>
      <div class="p-info">
        <h4>${escapeHTML(p.title || 'Untitled')}</h4>
        <p>${escapeHTML(p.category || '')}${p.description ? ' - ' + escapeHTML(p.description) : ''}</p>
        <p class="p-stats">
          <span class="p-stat-chip">${countFor('reactions', p.id)} likes</span>
          <span class="p-stat-chip">${countFor('comments', p.id)} comments</span>
        </p>
      </div>
      <div class="p-actions">
        <button class="btn btn-outline btn-sm js-edit" title="Edit">Edit</button>
        <button class="btn btn-danger btn-sm js-del" title="Delete">Delete</button>
      </div>
    </div>`;
}

let overviewReactions = [];
let overviewComments = [];

function countFor(kind, projectId) {
  const list = kind === 'reactions' ? overviewReactions : overviewComments;
  return list.filter((x) => x.projectId === Number(projectId)).length;
}

function renderProjects(list) {
  const el = $('projectsList');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<div class="empty">No artworks yet. Open "Upload Artwork" and add your first piece.</div>';
    return;
  }
  el.innerHTML = list.map(projectItemHTML).join('');

  el.querySelectorAll('.js-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.closest('.proj-item').dataset.id);
      startEdit(list.find((p) => p.id === id));
    });
  });

  el.querySelectorAll('.js-del').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.closest('.proj-item').dataset.id);
      if (!window.confirm('Delete this artwork?')) return;
      const ok = await api(() => API.del(`/projects/${id}`));
      if (ok !== null) {
        toast('Artwork deleted');
        await refreshProjects();
      }
    });
  });
}

function resetForm() {
  editId = null;
  $('projectFormTitle').textContent = 'Add artwork';
  $('projectSubmitBtn').textContent = 'Add artwork';
  $('projectCancelEdit').classList.add('hidden');
  $('projectForm').reset();
  $('pImagePreview').style.display = 'none';
  $('pImagePreviewImg').src = '';
}

function startEdit(p) {
  editId = p.id;
  $('pTitle').value = p.title || '';
  $('pCategory').value = p.category || '';
  $('pDescription').value = p.description || '';
  $('pImage').value = '';
  if (p.imageUrl) {
    $('pImagePreviewImg').src = p.imageUrl;
    $('pImagePreview').style.display = 'block';
  } else {
    $('pImagePreview').style.display = 'none';
  }
  $('projectFormTitle').textContent = 'Edit artwork';
  $('projectSubmitBtn').textContent = 'Save changes';
  $('projectCancelEdit').classList.remove('hidden');
  showPage('artworks');
}

function setupProjectForm() {
  $('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('pTitle').value.trim();
    if (!title) return toast('Title is required');

    const file = $('pImage').files[0];
    const btn = $('projectSubmitBtn');
    btn.disabled = true;

    try {
      let imageUrl = editId && $('pImagePreviewImg').src && !file ? $('pImagePreviewImg').src : '';
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        const upload = await API.request('/upload', { method: 'POST', body: fd });
        imageUrl = upload.url;
      }

      const payload = {
        title,
        category: $('pCategory').value.trim(),
        description: $('pDescription').value.trim(),
        imageUrl,
      };

      if (editId != null) {
        const result = await api(() => API.patch(`/projects/${editId}`, payload));
        if (result) toast('Changes saved');
      } else {
        payload.userId = user.id;
        const result = await api(() => API.post('/projects', payload));
        if (result) toast('Artwork added to the gallery');
      }

      resetForm();
      await refreshProjects();
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  $('pImage').addEventListener('change', () => {
    const file = $('pImage').files[0];
    if (!file) return;
    $('pImagePreviewImg').src = URL.createObjectURL(file);
    $('pImagePreview').style.display = 'block';
  });

  $('projectCancelEdit').addEventListener('click', resetForm);
}

async function refreshProjects() {
  const list = await api(() => API.get('/projects/mine'));
  if (list) renderProjects(list);
}

/* ============================= LINKS ============================= */

function linkRowHTML(l, index) {
  const options = platforms
    .map((p) => `<option value="${escapeHTML(p)}" ${l.platform === p ? 'selected' : ''}>${escapeHTML(p)}</option>`)
    .join('');
  return `
    <div class="link-row" data-index="${index}">
      <div class="lr-top">
        <select class="lr-platform" aria-label="Platform">${options}</select>
        <input class="lr-label" type="text" placeholder="Label (e.g. TikTok)" value="${escapeHTML(l.label || '')}" />
        <div class="lr-actions">
          <button type="button" class="btn btn-outline btn-sm js-open-link">Open</button>
          <button type="button" class="btn btn-outline btn-sm js-save-link" ${l.id ? '' : 'disabled'}>Save</button>
          <button type="button" class="btn btn-danger btn-sm js-del-link">Delete</button>
        </div>
      </div>
      <input class="lr-url" type="url" placeholder="https://www.facebook.com/yourname  /  https://www.tiktok.com/@yourname  /  https://www.twitch.tv/yourname" value="${escapeHTML(l.url || '')}" />
    </div>`;
}

function bindLinkRowActions(row) {
  row.querySelector('.js-del-link').addEventListener('click', async () => {
    const index = Number(row.dataset.index);
    const link = links[index];
    if (link.id == null) {
      row.remove();
      links.splice(index, 1);
      updateLinkCount();
      return;
    }
    if (!window.confirm('Delete this link?')) return;
    const ok = await api(() => API.del(`/links/${link.id}`));
    if (ok !== null) {
      toast('Link deleted');
      await refreshLinks();
    }
  });

  row.querySelector('.js-open-link').addEventListener('click', () => {
    const typed = normalizeUrl(row.querySelector('.lr-url').value.trim());
    if (!typed) return toast('No URL set yet');
    window.open(typed, '_blank', 'noopener');
  });

  const btn = row.querySelector('.js-save-link');
  const doSave = async () => {
    const index = Number(row.dataset.index);
    const link = links[index];
    const payload = {
      platform: row.querySelector('.lr-platform').value,
      label: row.querySelector('.lr-label').value.trim() || row.querySelector('.lr-platform').value,
      url: normalizeUrl(row.querySelector('.lr-url').value.trim()),
    };
    if (!payload.url) return toast('Type a URL and press Save');
    btn.disabled = true;
    const fn = link.id != null
      ? () => API.patch(`/links/${link.id}`, payload)
      : () => API.post(`/links`, payload);
    const result = await api(fn);
    btn.disabled = false;
    if (result) {
      toast(link.id != null ? 'Link updated' : 'Link saved');
      await refreshLinks();
    }
  };
  btn.addEventListener('click', doSave);
  row.querySelector('.lr-url').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSave();
    }
  });
}

function renderLinks() {
  const el = $('linksList');
  if (!el) return;
  if (!links.length) {
    el.innerHTML = '<div class="empty">No links yet. Click "Add link", paste your URL, then press Save (or Enter).</div>';
    return;
  }
  el.innerHTML = links.map((l, i) => linkRowHTML(l, i)).join('');
  el.querySelectorAll('.link-row').forEach(bindLinkRowActions);
}

function updateLinkCount() {
  const el = $('statLinks');
  if (el) el.textContent = links.length;
}

function addNewLinkRow() {
  const el = $('linksList');
  if (el.querySelector('.empty')) el.innerHTML = '';
  const link = { id: null, platform: platforms[0] || 'website', label: '', url: '' };
  links.push(link);
  el.insertAdjacentHTML('beforeend', linkRowHTML(link, links.length - 1));
  const row = el.lastElementChild;
  row.querySelector('.js-save-link').disabled = false;
  bindLinkRowActions(row);
  showPage('links');
  $('linksPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function refreshLinks() {
  const list = await api(() => API.get('/links'));
  if (list) {
    links = list;
    updateLinkCount();
    renderLinks();
  }
}

/* ============================= SONGS ============================= */

function songItemHTML(s) {
  return `
    <div class="song-item" data-id="${s.id}">
      <audio class="song-preview" controls preload="none" src="${escapeHTML(s.audioUrl || '')}"></audio>
      <div class="song-info">
        <h4>${escapeHTML(s.title || 'Untitled')}</h4>
        <p>${escapeHTML(s.artist || 'Unknown artist')}</p>
      </div>
      <div class="p-actions">
        <button class="btn btn-outline btn-sm js-song-edit" title="Edit">Edit</button>
        <button class="btn btn-danger btn-sm js-song-del" title="Delete">Delete</button>
      </div>
    </div>`;
}

function renderSongs(list) {
  const el = $('songsList');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<div class="empty">No songs yet. Open "Upload Music" and add your first track.</div>';
    return;
  }
  el.innerHTML = list.map(songItemHTML).join('');

  el.querySelectorAll('.js-song-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.closest('.song-item').dataset.id);
      startEditSong(list.find((s) => s.id === id));
    });
  });

  el.querySelectorAll('.js-song-del').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.closest('.song-item').dataset.id);
      if (!window.confirm('Delete this song from the playlist?')) return;
      const ok = await api(() => API.del(`/songs/${id}`));
      if (ok !== null) {
        toast('Song deleted');
        resetSongForm();
        await refreshSongs();
      }
    });
  });
}

function resetSongForm() {
  editSongId = null;
  editSongUrl = '';
  $('songFormTitle').textContent = 'Add song';
  $('songSubmitBtn').textContent = 'Add song';
  $('songCancelBtn').classList.add('hidden');
  $('songForm').reset();
}

function startEditSong(song) {
  editSongId = song.id;
  editSongUrl = song.audioUrl || '';
  $('sTitle').value = song.title || '';
  $('sArtist').value = song.artist || '';
  $('songFormTitle').textContent = 'Edit song';
  $('songSubmitBtn').textContent = 'Save changes';
  $('songCancelBtn').classList.remove('hidden');
  showPage('music');
  $('musicPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupSongForm() {
  $('songForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('sTitle').value.trim();
    if (!title) return toast('Title is required');

    const file = $('sAudio').files[0];
    const btn = $('songSubmitBtn');
    btn.disabled = true;

    try {
      let audioUrl = editSongUrl;
      if (file) {
        const fd = new FormData();
        fd.append('audio', file);
        const upload = await API.request('/upload/audio', { method: 'POST', body: fd });
        audioUrl = upload.url;
      } else if (!audioUrl) {
        toast('Please choose an audio file');
        btn.disabled = false;
        return;
      }

      const payload = {
        title,
        artist: $('sArtist').value.trim(),
        audioUrl,
      };

      if (editSongId != null) {
        const result = await api(() => API.patch(`/songs/${editSongId}`, payload));
        if (result) toast('Song updated');
      } else {
        payload.userId = user.id;
        const result = await api(() => API.post('/songs', payload));
        if (result) toast('Song added to the playlist');
      }

      resetSongForm();
      await refreshSongs();
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  $('songCancelBtn').addEventListener('click', resetSongForm);
}

async function refreshSongs() {
  const list = await api(() => API.get('/songs'));
  if (list) renderSongs(list);
}

/* ============================= VIDEOS ============================= */

function videoItemHTML(v) {
  return `
    <div class="song-item" data-id="${v.id}">
      <video class="song-preview video-pre" controls preload="metadata" src="${escapeHTML(v.videoUrl || '')}"></video>
      <div class="song-info">
        <h4>${escapeHTML(v.title || 'Untitled')}</h4>
        <p>${escapeHTML(v.category || '')}${v.description ? ' - ' + escapeHTML(v.description) : ''}</p>
      </div>
      <div class="p-actions">
        <button class="btn btn-outline btn-sm js-video-edit" title="Edit">Edit</button>
        <button class="btn btn-danger btn-sm js-video-del" title="Delete">Delete</button>
      </div>
    </div>`;
}

function renderVideos(list) {
  const el = $('videosList');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<div class="empty">No videos yet. Open "Upload Video" and add your first clip.</div>';
    return;
  }
  el.innerHTML = list.map(videoItemHTML).join('');

  el.querySelectorAll('.js-video-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.closest('.song-item').dataset.id);
      startEditVideo(list.find((v) => v.id === id));
    });
  });

  el.querySelectorAll('.js-video-del').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.closest('.song-item').dataset.id);
      if (!window.confirm('Delete this video?')) return;
      const ok = await api(() => API.del(`/videos/${id}`));
      if (ok !== null) {
        toast('Video deleted');
        resetVideoForm();
        await refreshVideos();
      }
    });
  });
}

function resetVideoForm() {
  editVideoId = null;
  editVideoUrl = '';
  $('videoFormTitle').textContent = 'Add video';
  $('videoSubmitBtn').textContent = 'Add video';
  $('videoCancelBtn').classList.add('hidden');
  $('videoForm').reset();
  $('vPreview').style.display = 'none';
  $('vPreviewVideo').src = '';
}

function startEditVideo(video) {
  editVideoId = video.id;
  editVideoUrl = video.videoUrl || '';
  $('vTitle').value = video.title || '';
  $('vCategory').value = video.category || '';
  $('vDescription').value = video.description || '';
  $('vFile').value = '';
  if (video.videoUrl) {
    $('vPreviewVideo').src = video.videoUrl;
    $('vPreview').style.display = 'block';
  } else {
    $('vPreview').style.display = 'none';
  }
  $('videoFormTitle').textContent = 'Edit video';
  $('videoSubmitBtn').textContent = 'Save changes';
  $('videoCancelBtn').classList.remove('hidden');
  showPage('videos');
  $('videoPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupVideoForm() {
  $('videoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('vTitle').value.trim();
    if (!title) return toast('Title is required');

    const file = $('vFile').files[0];
    const btn = $('videoSubmitBtn');
    btn.disabled = true;

    try {
      let videoUrl = editVideoUrl;
      if (file) {
        const fd = new FormData();
        fd.append('video', file);
        const upload = await API.request('/upload/video', { method: 'POST', body: fd });
        videoUrl = upload.url;
      } else if (!videoUrl) {
        toast('Please choose a video file');
        btn.disabled = false;
        return;
      }

      const payload = {
        title,
        category: $('vCategory').value.trim(),
        description: $('vDescription').value.trim(),
        videoUrl,
      };

      if (editVideoId != null) {
        const result = await api(() => API.patch(`/videos/${editVideoId}`, payload));
        if (result) toast('Video updated');
      } else {
        payload.userId = user.id;
        const result = await api(() => API.post('/videos', payload));
        if (result) toast('Video uploaded');
      }

      resetVideoForm();
      await refreshVideos();
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  $('vFile').addEventListener('change', () => {
    const file = $('vFile').files[0];
    if (!file) return;
    $('vPreviewVideo').src = URL.createObjectURL(file);
    $('vPreview').style.display = 'block';
  });

  $('videoCancelBtn').addEventListener('click', resetVideoForm);
}

async function refreshVideos() {
  const list = await api(() => API.get('/videos/mine'));
  if (list) renderVideos(list);
}

/* ============================= OVERVIEW ============================= */

function statCard(label, value) {
  return `
    <div class="stat-card">
      <div class="num">${value}</div>
      <div class="lbl">${escapeHTML(label)}</div>
    </div>`;
}

async function loadOverview() {
  const [statsRes, usersRes, commentsRes, reactionsRes] = await Promise.all([
    api(() => API.get('/stats')),
    api(() => API.get('/stats/users')),
    api(() => API.get('/comments')),
    api(() => API.get('/reactions')),
  ]);

  overviewComments = commentsRes || [];
  overviewReactions = reactionsRes || [];

  const stats = statsRes || {};
  $('overviewStats').innerHTML =
    statCard('Artworks', stats.projects || 0) +
    statCard('Songs', stats.songs || 0) +
    statCard('Videos', stats.videos || 0) +
    statCard('Social links', stats.links || 0) +
    statCard('Registered accounts', stats.users || 0) +
    statCard('Reactions', stats.reactions || 0) +
    statCard('Comments', stats.comments || 0) +
    statCard('Visitors', stats.visits || 0);

  renderUsers(usersRes || []);
  renderModComments(overviewComments);
}

function renderUsers(users) {
  const el = $('usersList');
  if (!el) return;
  adminUsers = users || [];
  if (!users.length) {
    el.innerHTML = '<div class="empty">No accounts yet.</div>';
    return;
  }
  el.innerHTML = users
    .map((u) => {
      const banned = !!u.banned;
      const pill = banned
        ? '<span class="p-stat-chip chip-danger">Banned</span>'
        : (u.permanentBan ? '' : '');
      let banNote = '';
      if (banned) {
        const until = u.permanentBan || !u.banUntil
          ? 'permanently'
          : `until ${new Date(u.banUntil).toLocaleDateString()}`;
        banNote = `<p class="ban-note">Banned ${escapeHTML(until)}${u.banReason ? ` - &quot;${escapeHTML(u.banReason)}&quot;` : ''}</p>`;
      }
      const actions = u.role === 'admin'
        ? ''
        : banned
          ? '<button class="btn btn-outline btn-sm js-unban" title="Remove the ban and recover this account">Unban</button>'
          : '<button class="btn btn-danger btn-sm js-ban" title="Ban this account">Ban</button>';
      return `
      <div class="user-row" data-id="${u.id}">
        <span class="dash-avatar user-av" ${u.avatarUrl ? `style="background-image:url('${escapeHTML(u.avatarUrl)}')"` : ''}>${u.avatarUrl ? '' : escapeHTML(initials(u.name))}</span>
        <div class="user-info">
          <h4>${escapeHTML(u.name || '')} ${u.role === 'admin' ? '<span class="role-badge">Admin</span>' : '<span class="role-badge viewer">Viewer</span>'} ${pill}</h4>
          <p>${escapeHTML(u.email || '')} &middot; Joined ${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '?'}</p>
          ${banNote}
        </div>
        <div class="p-actions">${actions}</div>
      </div>`;
    }).join('');

  el.querySelectorAll('.js-ban').forEach((btn) => {
    btn.addEventListener('click', () => openBanModal(Number(btn.closest('.user-row').dataset.id), users));
  });

  el.querySelectorAll('.js-unban').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.closest('.user-row').dataset.id);
      if (!window.confirm('Remove this ban and recover the account?')) return;
      const res = await api(() => API.post(`/admin/users/${id}/unban`, {}));
      if (res) {
        toast('Ban removed - account recovered');
        await loadOverview();
      }
    });
  });
}

function fmtCommentDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function renderModComments(comments) {
  const el = $('modCommentsList');
  const countEl = $('modCommentCount');
  if (!el) return;
  if (countEl) countEl.textContent = `(${comments.length})`;
  if (!comments.length) {
    el.innerHTML = '<div class="empty">No comments yet. Visitors can comment on your artworks.</div>';
    return;
  }
  const list = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 30);
  el.innerHTML = list
    .map((c) => `
      <div class="mod-comment" data-id="${c.id}">
        <div class="comment-head">
          <strong>${escapeHTML(c.name)}</strong>
          <span class="comment-date">${fmtCommentDate(c.createdAt)}</span>
        </div>
        <p>${escapeHTML(c.text)}</p>
        <div class="mod-comment-actions">
          <button type="button" class="btn btn-danger btn-sm js-mod-del">Delete</button>
        </div>
      </div>`).join('');

  el.querySelectorAll('.js-mod-del').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.closest('.mod-comment').dataset.id);
      if (!window.confirm('Delete this comment?')) return;
      const ok = await api(() => API.del(`/comments/${id}`));
      if (ok !== null) {
        toast('Comment deleted');
        await loadOverview();
      }
    });
  });
}

/* ============================= FEEDBACK + BANS ============================= */

function openBanModal(id, users) {
  banTargetId = id;
  const u = users.find((x) => x.id === id);
  if (!u) return;
  $('banUserName').textContent = u.name || '?';
  $('banUserEmail').textContent = u.email || '';
  $('banPeriod').value = 'days';
  $('banAmount').value = '7';
  $('banReason').value = '';
  syncBanAmount();
  $('banModal').hidden = false;
  document.body.classList.add('modal-open');
}

function closeBanModal() {
  $('banModal').hidden = true;
  document.body.classList.remove('modal-open');
}

function syncBanAmount() {
  const period = $('banPeriod').value;
  const amountWrap = $('banAmountWrap');
  if (period === 'forever') {
    amountWrap.style.display = 'none';
    return;
  }
  amountWrap.style.display = '';
  const spec = { days: [1, 30], months: [1, 12], years: [1, 10] }[period];
  const input = $('banAmount');
  input.min = spec[0];
  input.max = spec[1];
  const val = Number(input.value);
  if (val < spec[0] || val > spec[1]) input.value = spec[1];
  const label = period === 'days' ? 'days' : period === 'months' ? 'months' : 'years';
  $('banAmountHint').textContent = `${label.charAt(0).toUpperCase() + label.slice(1)}: 1 to ${spec[1]}`;
}

function setupBanModal() {
  $('banPeriod').addEventListener('change', syncBanAmount);
  $('banClose').addEventListener('click', closeBanModal);
  $('banCancel').addEventListener('click', closeBanModal);
  $('banBackdrop').addEventListener('click', closeBanModal);
  $('banConfirm').addEventListener('click', async () => {
    const period = $('banPeriod').value;
    const body = { period, reason: $('banReason').value.trim() };
    if (period !== 'forever') body.amount = Number($('banAmount').value);
    $('banConfirm').disabled = true;
    try {
      const res = await api(() => API.post(`/admin/users/${banTargetId}/ban`, body));
      if (res) {
        toast('Account banned');
        closeBanModal();
        await Promise.all([loadOverview(), loadFeedback()]);
      }
    } finally {
      $('banConfirm').disabled = false;
    }
  });
}

const KIND_LABEL = { report: 'Report', appeal: 'Appeal', feedback: 'General' };

function feedbackItemHTML(f, usersById, index) {
  const kind = f.kind && KIND_LABEL[f.kind] ? f.kind : 'feedback';
  const kindLabel = KIND_LABEL[f.kind] || KIND_LABEL.feedback;
  const resolved = f.status === 'resolved';
  const date = f.createdAt ? fmtCommentDate(f.createdAt) : '';
  const target = usersById[f.email];
  const canRecover = kind === 'appeal' && target && target.banned;
  const actions = `
    <button class="btn btn-outline btn-sm js-fb-toggle">${resolved ? 'Reopen' : 'Mark resolved'}</button>
    <button class="btn btn-danger btn-sm js-fb-del">Delete</button>`;
  return `
    <div class="fb-item" data-index="${index}">
      <div class="fb-head">
        <span class="chip chip-${kind}">${escapeHTML(kindLabel)}</span>
        <strong>${escapeHTML(f.name || '?')}</strong>
        <span class="comment-date">${escapeHTML(f.email || '')}</span>
        <span class="chip ${resolved ? 'chip-resolved' : 'chip-pending'}">${resolved ? 'Resolved' : 'Pending'}</span>
      </div>
      ${f.subject ? `<h4 class="fb-subject">${escapeHTML(f.subject)}</h4>` : ''}
      <p class="fb-text">${escapeHTML(f.text)}</p>
      <div class="fb-foot">
        <span class="comment-date">${date}</span>
        <div class="mod-comment-actions">
          ${canRecover ? '<button class="btn btn-primary btn-sm js-fb-unban" data-email="' + escapeHTML(f.email) + '">Unban &amp; recover</button>' : ''}
          ${actions}
        </div>
      </div>
    </div>`;
}

function renderFeedback() {
  const el = $('feedbackList');
  const countEl = $('feedbackCount');
  const badge = $('feedbackTabBadge');
  if (!el) return;

  const pending = feedback.filter((f) => f.status !== 'resolved').length;
  if (badge) badge.textContent = pending ? ` (${pending})` : '';
  if (countEl) countEl.textContent = `(${feedback.length})`;

  const items = feedbackFilter ? feedback.filter((f) => f.status === feedbackFilter) : feedback;
  if (!items.length) {
    el.innerHTML = '<div class="empty">No messages ' + (feedbackFilter ? 'with this status' : 'yet') + '. Visitors can reach you from the Feedback page.</div>';
    return;
  }

  const usersById = {};
  adminUsers.forEach((u) => { usersById[u.email] = u; });

  el.innerHTML = items.map((f, i) => feedbackItemHTML(f, usersById, i)).join('');

  el.querySelectorAll('.js-fb-unban').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const index = Number(btn.closest('.fb-item').dataset.index);
      const f = items[index];
      const target = usersById[f.email];
      if (!target) return toast('No account matches this appeal');
      if (!window.confirm('Approve this appeal? The account will be unbanned and the message marked resolved.')) return;
      const res = await api(() => API.post(`/admin/users/${target.id}/unban`, {}));
      if (res) {
        await api(() => API.post(`/feedback/${f.id}/resolve`, {}));
        toast('Appeal approved - account recovered');
        await Promise.all([loadOverview(), loadFeedback()]);
      }
    });
  });

  el.querySelectorAll('.js-fb-toggle').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const index = Number(btn.closest('.fb-item').dataset.index);
      const f = items[index];
      const res = await api(() => API.post(`/feedback/${f.id}/resolve`, {}));
      if (res) {
        toast('Message updated');
        await loadFeedback();
      }
    });
  });

  el.querySelectorAll('.js-fb-del').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const index = Number(btn.closest('.fb-item').dataset.index);
      const f = items[index];
      if (!window.confirm('Delete this message?')) return;
      const ok = await api(() => API.del(`/feedback/${f.id}`));
      if (ok !== null) {
        toast('Message deleted');
        await loadFeedback();
      }
    });
  });
}

async function loadFeedback() {
  const list = await api(() => API.get('/feedback'));
  if (list) feedback = list;
  renderFeedback();
}

/* ============================= PROFILE + CROP ============================= */

function renderDashUser() {
  const img = $('dashAvatar');
  const fallback = $('dashAvatarFallback');
  if (user.avatarUrl) {
    img.src = user.avatarUrl;
    img.classList.remove('hidden');
    fallback.classList.add('hidden');
  } else {
    img.classList.add('hidden');
    fallback.textContent = initials(user.name);
    fallback.classList.remove('hidden');
  }
}

function fillProfileForm() {
  $('pfName').value = user.name || '';
  $('pfBio').value = user.bio || '';
  if (user.avatarUrl) {
    $('pfAvatarPreviewImg').src = user.avatarUrl;
    $('pfAvatarPreview').style.display = 'block';
  }
}

function setupProfileForm() {
  const avatarPreview = $('pfAvatarPreview');
  const avatarPreviewImg = $('pfAvatarPreviewImg');

  $('pfAvatar').addEventListener('change', () => {
    const file = $('pfAvatar').files[0];
    if (!file) return;
    avatarPreviewImg.src = URL.createObjectURL(file);
    avatarPreview.style.display = 'block';
    openCrop(file);
  });

  $('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      let avatarUrl = user.avatarUrl || '';
      if (pendingAvatarUrl) avatarUrl = pendingAvatarUrl;

      const payload = {
        name: $('pfName').value.trim(),
        bio: $('pfBio').value.trim(),
        avatarUrl,
      };

      const currentPassword = $('pfCurrent').value;
      const newPassword = $('pfNew').value;
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const result = await api(() => API.patch('/profile/admin/me', payload));
      if (result && result.user) {
        user = result.user;
        pendingAvatarUrl = '';
        API.setSession(API.token, { ...API.user, name: user.name, role: user.role });
        $('welcomeMsg').textContent = `Welcome back, ${user.name}`;
        $('pfCurrent').value = '';
        $('pfNew').value = '';
        renderDashUser();
        toast('Profile saved - visitors will see the update');
      }
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

/* ---- Cropping editor ---- */

const CROP_SIZE = 400;
const crop = { file: null, img: null, zoom: 1, dx: 0, dy: 0, base: 0, dragging: false, lastX: 0, lastY: 0 };

function openCrop(file) {
  const img = $('cropImg');
  crop.file = file;
  crop.zoom = 1;
  crop.dx = 0;
  crop.dy = 0;
  img.onload = () => {
    requestAnimationFrame(() => {
      computeCropBase();
      positionCropImg();
    });
  };
  img.src = URL.createObjectURL(file);
  $('cropModal').hidden = false;
  document.body.classList.add('modal-open');
}

function closeCrop() {
  $('cropModal').hidden = true;
  document.body.classList.remove('modal-open');
}

function cropStageSize() {
  const stage = $('cropStage');
  return { w: stage.clientWidth, h: stage.clientHeight };
}

function computeCropBase() {
  const { w, h } = cropStageSize();
  const iw = crop.img.naturalWidth;
  const ih = crop.img.naturalHeight;
  if (!iw || !ih) return;
  crop.base = Math.max(w / iw, h / ih);
}

function cropDisplayDims() {
  const s = crop.base * crop.zoom;
  return { w: crop.img.naturalWidth * s, h: crop.img.naturalHeight * s };
}

function clampCropPan() {
  const { w, h } = cropStageSize();
  const d = cropDisplayDims();
  const maxDx = Math.max(0, (d.w - w) / 2);
  const maxDy = Math.max(0, (d.h - h) / 2);
  crop.dx = Math.max(-maxDx, Math.min(maxDx, crop.dx));
  crop.dy = Math.max(-maxDy, Math.min(maxDy, crop.dy));
}

function positionCropImg() {
  const { w, h } = cropStageSize();
  const d = cropDisplayDims();
  clampCropPan();
  crop.img.style.width = d.w + 'px';
  crop.img.style.height = d.h + 'px';
  crop.img.style.left = w / 2 - d.w / 2 + crop.dx + 'px';
  crop.img.style.top = h / 2 - d.h / 2 + crop.dy + 'px';
}

function setupCrop() {
  const stage = $('cropStage');
  const img = $('cropImg');
  crop.img = img;

  stage.addEventListener('pointerdown', (e) => {
    crop.dragging = true;
    crop.lastX = e.clientX;
    crop.lastY = e.clientY;
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!crop.dragging) return;
    crop.dx += e.clientX - crop.lastX;
    crop.dy += e.clientY - crop.lastY;
    crop.lastX = e.clientX;
    crop.lastY = e.clientY;
    positionCropImg();
  });

  stage.addEventListener('pointerup', () => { crop.dragging = false; });
  stage.addEventListener('pointercancel', () => { crop.dragging = false; });

  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    crop.zoom = Math.max(1, Math.min(8, crop.zoom * factor));
    positionCropImg();
  }, { passive: false });

  $('cropClose').addEventListener('click', closeCrop);
  $('cropCancel').addEventListener('click', closeCrop);
  $('cropBackdrop').addEventListener('click', closeCrop);

  $('cropApply').addEventListener('click', applyCrop);
}

function applyCrop() {
  const img = crop.img;
  if (!img.naturalWidth) return toast('Please choose a photo first');
  const { w, h } = cropStageSize();
  const s = crop.base * crop.zoom;
  const d = cropDisplayDims();
  const offsetX = w / 2 - d.w / 2 + crop.dx;
  const offsetY = h / 2 - d.h / 2 + crop.dy;
  const sx = -offsetX / s;
  const sy = -offsetY / s;
  const ssize = w / s;

  const canvas = document.createElement('canvas');
  canvas.width = CROP_SIZE;
  canvas.height = CROP_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, sx, sy, ssize, ssize, 0, 0, CROP_SIZE, CROP_SIZE);

  const btn = $('cropApply');
  btn.disabled = true;
  canvas.toBlob(async (blob) => {
    try {
      const fd = new FormData();
      fd.append('image', blob, 'avatar.jpg');
      const upload = await API.request('/upload', { method: 'POST', body: fd });
      pendingAvatarUrl = upload.url;
      $('pfAvatarPreviewImg').src = upload.url;
      $('pfAvatarPreview').style.display = 'block';
      closeCrop();
      toast('Photo cropped - press "Save profile" to apply it');
    } catch (err) {
      toast(err.message);
      closeCrop();
    } finally {
      btn.disabled = false;
    }
  }, 'image/jpeg', 0.92);
}

/* ============================= VIEWER / INIT ============================= */

function enterViewerMode() {
  $('viewerNotice').classList.remove('hidden');
  $('adminTabs').classList.add('hidden');
  document.querySelectorAll('.dash-page').forEach((s) => s.classList.add('hidden'));
  $('dashboardSub').textContent = 'You are viewing this site as a guest.';
  $('welcomeMsg').textContent = 'Welcome';
}

document.addEventListener('DOMContentLoaded', async () => {
  $('year').textContent = new Date().getFullYear();
  if (!requireAuth()) return;

  const me = await api(() => API.get('/auth/me'));
  if (!me || !me.user) return;
  user = me.user;
  API.setSession(API.token, { ...API.user, name: user.name, role: user.role });
  $('welcomeMsg').textContent = `Welcome back, ${user.name}`;
  renderDashUser();

  if (user.role !== 'admin') {
    enterViewerMode();
    return;
  }

  $('dashboardSub').textContent = 'Manage your artworks, music, videos, links and profile.';

  const platformRes = await api(() => API.get('/links/platforms'));
  platforms = (platformRes && platformRes.platforms) || [];

  setupTabs();
  setupCrop();
  setupProjectForm();
  setupProfileForm();
  setupSongForm();
  setupVideoForm();
  setupBanModal();
  const filterEl = $('feedbackFilter');
  if (filterEl) {
    filterEl.addEventListener('change', (e) => {
      feedbackFilter = e.target.value;
      renderFeedback();
    });
  }
  fillProfileForm();
  $('addLinkBtn').addEventListener('click', addNewLinkRow);

  showPage('overview');
  loadOverview();
  loadFeedback();
  await Promise.all([refreshProjects(), refreshLinks(), refreshSongs(), refreshVideos()]);
});