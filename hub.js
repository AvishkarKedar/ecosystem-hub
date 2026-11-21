// State
let currentFilter = 'all';
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.filter-tab');
const projectCards = document.querySelectorAll('.project-card');
const countDisplay = document.getElementById('countDisplay');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');

// Filter Logic
function applyFilters() {
  const query = (searchInput.value || '').toLowerCase().trim();
  let visibleCount = 0;

  projectCards.forEach(card => {
    const category = card.getAttribute('data-category');
    const searchData = (card.getAttribute('data-search') || '').toLowerCase();
    const textContent = card.innerText.toLowerCase();

    const matchesFilter = (currentFilter === 'all') || (category === currentFilter);
    const matchesQuery = !query || searchData.includes(query) || textContent.includes(query);

    if (matchesFilter && matchesQuery) {
      card.style.display = 'block';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  countDisplay.textContent = `${visibleCount} hosted website${visibleCount === 1 ? '' : 's'}`;
  emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
}

// Filter Tabs
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.getAttribute('data-filter');
    applyFilters();
  });
});

// Search Input
if (searchInput) {
  searchInput.addEventListener('input', applyFilters);
}

// Keyboard Shortcuts (/ to focus search, Esc to clear)
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    if (searchInput) searchInput.focus();
  } else if (e.key === 'Escape' && document.activeElement === searchInput) {
    if (searchInput) {
      searchInput.value = '';
      searchInput.blur();
    }
    applyFilters();
  }
});

// Reset Filters
function resetFilters() {
  if (searchInput) searchInput.value = '';
  currentFilter = 'all';
  filterTabs.forEach(t => t.classList.remove('active'));
  if (filterTabs[0]) filterTabs[0].classList.add('active');
  applyFilters();
}

// Copy Email
function copyEmail() {
  const email = 'avishkarkedar@gmail.com';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email)
      .then(showToast)
      .catch(() => fallbackCopy(email));
  } else {
    fallbackCopy(email);
  }
}

function fallbackCopy(text) {
  const temp = document.createElement('textarea');
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(temp);
  showToast();
}

function showToast() {
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }
}

// Bind click events unobtrusively (Zero CSP violations)
function initClickBindings() {
  const copyBtn = document.getElementById('copyEmailBtn');
  if (copyBtn) copyBtn.addEventListener('click', copyEmail);

  const copyRowBtn = document.getElementById('copyEmailRowBtn');
  if (copyRowBtn) copyRowBtn.addEventListener('click', copyEmail);

  document.querySelectorAll('.contact-row-action').forEach(btn => {
    btn.addEventListener('click', copyEmail);
  });

  document.querySelectorAll('#emptyState button').forEach(btn => {
    btn.addEventListener('click', resetFilters);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClickBindings);
} else {
  initClickBindings();
}
