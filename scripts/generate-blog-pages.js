#!/usr/bin/env node
/**
 * ЭТАП 2: Генератор статических страниц блога.
 * 
 * Использование:
 *   node scripts/generate-blog-pages.js
 * 
 * Результат:
 *   Создаёт файлы blog-{id}.html для опубликованных статей.
 */

const fs = require('fs');
const path = require('path');

// Читаем posts.json
const postsPath = path.join(__dirname, '../data/posts.json');
const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
const posts = (postsData.posts || []).filter(p => p.published);

console.log(`Найдено опубликованных статей: ${posts.length}`);

// Шаблон страницы
function generatePage(post) {
  const esc = (str) => String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const tagsHTML = (post.tags || [])
    .map(tag => `<span class="tag">${esc(tag)}</span>`)
    .join('\n                        ');

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  // JSON-LD Article
  const articleLD = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || '',
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Organization",
      "name": "RoboGuide"
    },
    "publisher": {
      "@type": "Organization",
      "name": "RoboGuide",
      "logo": {
        "@type": "ImageObject",
        "url": "https://planeta-ladariya.ru/images/hero-robot.jpg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://planeta-ladariya.ru/blog-${post.id}.html`
    }
  };

  // BreadcrumbList
  const breadcrumbLD = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://planeta-ladariya.ru/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Блог",
        "item": "https://planeta-ladariya.ru/blog.html"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://planeta-ladariya.ru/blog-${post.id}.html`
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(post.title)} — RoboGuide</title>
    <meta name="description" content="${esc(post.excerpt || post.title)}" />
    <link rel="canonical" href="https://planeta-ladariya.ru/blog-${esc(post.id)}.html" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>" />

    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(post.title)}" />
    <meta property="og:description" content="${esc(post.excerpt || '')}" />
    <meta property="og:url" content="https://planeta-ladariya.ru/blog-${esc(post.id)}.html" />
    <meta property="og:image" content="https://planeta-ladariya.ru/images/hero-robot.jpg" />
    <meta property="og:locale" content="ru_RU" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="stylesheet" href="css/style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

    <!-- JSON-LD Article -->
    <script type="application/ld+json">
${JSON.stringify(articleLD, null, 2)}
    </script>

    <!-- JSON-LD BreadcrumbList -->
    <script type="application/ld+json">
${JSON.stringify(breadcrumbLD, null, 2)}
    </script>

    <!-- Аналитика (ЗАМЕНИТЕ ID) -->
    <script>
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      ym(00000000, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
    </script>
    <noscript><div><img src="https://mc.yandex.ru/watch/00000000" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');</script>
</head>
<body>

    <header class="site-header">
        <div class="container header-grid">
            <div class="logo">
                <a href="index.html">
                    <span class="logo-icon">🤖</span>
                    <span class="logo-text">Robo<span class="highlight">Guide</span></span>
                </a>
            </div>
            <nav class="main-nav">
                <ul class="nav-list">
                    <li><a href="catalog.html">Каталог</a></li>
                    <li><a href="index.html#solutions">Решения</a></li>
                    <li><a href="roi-calculator.html">ROI-калькулятор</a></li>
                    <li><a href="blog.html" class="active">Блог</a></li>
                    <li><a href="about.html">О нас</a></li>
                    <li><a href="contact.html" class="btn btn-outline">Контакты</a></li>
                </ul>
            </nav>
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Открыть меню" aria-expanded="false">☰</button>
        </div>
    </header>

    <section class="blog-post-detail">
        <div class="container">
            <div class="breadcrumbs">
                <a href="index.html">Главная</a> → 
                <a href="blog.html">Блог</a> → 
                <span>${esc(post.title)}</span>
            </div>

            <article class="post-article">
                <div class="post-header">
                    <div class="post-icon-large">${esc(post.icon || '📄')}</div>
                    <div class="post-meta">
                        <span class="post-category">${esc(post.category)}</span>
                        <span class="post-date">${formatDate(post.date)}</span>
                        <span class="post-read-time">${esc(post.readTime)}</span>
                    </div>
                    <h1>${esc(post.title)}</h1>
                    <div class="post-tags">
                        ${tagsHTML}
                    </div>
                </div>
                <div class="post-body">
                    ${post.body || `<p>${esc(post.excerpt)}</p>`}
                </div>

                <div class="post-actions">
                    <a href="blog.html" class="btn btn-secondary">← Вернуться в блог</a>
                    <a href="contact.html" class="btn btn-primary">Связаться с экспертом</a>
                </div>
            </article>
        </div>
    </section>

    <footer class="site-footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-about">
                    <h4>🤖 RoboGuide</h4>
                    <p>Экспертный каталог роботов для бизнеса. Подбор, ROI-калькуляция, внедрение.</p>
                </div>
                <div class="footer-links">
                    <h4>Меню</h4>
                    <ul>
                        <li><a href="catalog.html">Каталог</a></li>
                        <li><a href="index.html#solutions">Решения</a></li>
                        <li><a href="blog.html">Блог</a></li>
                        <li><a href="about.html">О нас</a></li>
                    </ul>
                </div>
                <div class="footer-links">
                    <h4>Помощь</h4>
                    <ul>
                        <li><a href="roi-calculator.html">ROI-калькулятор</a></li>
                    </ul>
                </div>
                <div class="footer-contacts">
                    <h4>Связаться</h4>
                    <p>📧 <a href="mailto:info@planeta-ladariya.ru">info@planeta-ladariya.ru</a></p>
                    <p>📞 <a href="tel:+79964049593">+7 (996) 404-95-93</a></p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© <span data-footer-year>2026</span> RoboGuide. Все права защищены.</p>
            </div>
        </div>
    </footer>

    <script src="js/main.js"></script>

</body>
</html>`;
}

// Генерируем файлы
posts.forEach(post => {
  const filename = `blog-${post.id}.html`;
  const filepath = path.join(__dirname, '..', filename);
  const html = generatePage(post);

  fs.writeFileSync(filepath, html, 'utf-8');
  console.log(`✅ Создан: ${filename}`);
});

console.log(`\n✅ Готово! Создано ${posts.length} страниц блога.`);
console.log(`\nТеперь нужно:`);
console.log(`1. Обновить ссылки в blog.html:`);
console.log(`   blog-post.html?id=post-3 → blog-post-3.html`);
console.log(`2. Добавить 301-редиректы в .htaccess`);
console.log(`3. Обновить sitemap.xml`);