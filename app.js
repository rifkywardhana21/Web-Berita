const heroContainer = document.getElementById('hero');
const articlesContainer = document.getElementById('articles');
const navLinks = document.querySelectorAll('.nav-links a');

const categoryMap = {
  latest: 'terbaru',
  national: 'nasional',
  international: 'internasional',
  business: 'ekonomi',
  sports: 'olahraga',
  technology: 'teknologi',
  entertainment: 'hiburan',
  lifestyle: 'gaya-hidup'
};

const API_BASE_URL = 'https://api-berita-indonesia.vercel.app/cnn';

let allArticles = [];
let currentCategory = 'latest';
let heroArticles = [];
let slideInterval;

function fetchArticles(category) {
  clearInterval(slideInterval);
  heroContainer.innerHTML = '';
  articlesContainer.innerHTML = '<p>Memuat berita...</p>';

  const endpoint = categoryMap[category] || 'terbaru';
  const url = `${API_BASE_URL}/${endpoint}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      allArticles = data.data.posts || [];
      renderArticles();
    })
    .catch(() => {
      articlesContainer.innerHTML = '<p>Gagal memuat berita.</p>';
    });
}

function renderArticles() {
  const limit = 50;
  const sortOrder = 'desc';

  let filtered = [...allArticles];

  filtered.sort((a, b) => {
    const dateA = new Date(a.pubDate);
    const dateB = new Date(b.pubDate);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const articles = filtered.slice(0, limit);
  heroArticles = articles.slice(0, 5);
  renderHeroSlide();
  startSlideInterval();
  renderArticleGrid(articles.slice(5));
}

function renderHeroSlide() {
  heroContainer.innerHTML = `
    <div class="hero-slider-wrapper">
      <button class="slider-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
      <div class="hero-slider" id="heroSlider">
        ${heroArticles.map(article => {
          const heroDate = new Date(article.pubDate).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
          return `
            <div class="hero-card">
              <div class="highlight-content">
                <div class="highlight-text">
                  <div class="label">Headline</div>
                  <h2>${article.title}</h2>
                  <p class="desc">${article.description || ''}</p>
                  <div class="highlight-meta">
                    <span>${heroDate}</span>
                    <a href="${article.link}" class="highlight-link" target="_blank">Baca Selengkapnya</a>
                  </div>
                </div>
                <div class="highlight-image">
                  <img src="${article.thumbnail || 'https://via.placeholder.com/600x300'}" alt="${article.title}">
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <button class="slider-btn next-btn"><i class="fas fa-chevron-right"></i></button>
    </div>
  `;

  const slider = document.getElementById('heroSlider');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  const scrollAmount = slider.clientWidth;

  prevBtn.addEventListener('click', () => {
    slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

function startSlideInterval() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  slideInterval = setInterval(() => {
    slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
    setTimeout(() => {
      if (Math.ceil(slider.scrollLeft + slider.clientWidth) >= slider.scrollWidth) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 1000);
  }, 5000);
}

function renderArticleGrid(articles) {
  articlesContainer.innerHTML = '';
  articles.forEach(article => {
    const articleEl = document.createElement('div');
    articleEl.className = 'article';
    articleEl.innerHTML = `
      <img src="${article.thumbnail || 'https://via.placeholder.com/400x200'}" alt="${article.title}">
      <div class="article-content">
        <h3>${article.title}</h3>
        <p>${new Date(article.pubDate).toLocaleDateString('id-ID')}</p>
        <a href="${article.link}" target="_blank" rel="noopener">Baca selengkapnya</a>
      </div>
    `;
    articlesContainer.appendChild(articleEl);
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    currentCategory = link.dataset.category;
    fetchArticles(currentCategory);
  });
});

fetchArticles(currentCategory);
