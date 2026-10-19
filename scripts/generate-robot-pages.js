#!/usr/bin/env node
/**
 * ЭТАП 2: Генератор статических страниц роботов.
 * 
 * Использование:
 *   node scripts/generate-robot-pages.js
 * 
 * Результат:
 *   Создаёт файлы robot-{slug}.html в корне проекта.
 */

const fs = require('fs');
const path = require('path');

// Читаем robots.json
const robotsPath = path.join(__dirname, '../data/robots.json');
const robotsData = JSON.parse(fs.readFileSync(robotsPath, 'utf-8'));
const robots = robotsData.robots || [];

console.log(`Найдено роботов: ${robots.length}`);

// Шаблон страницы
function generatePage(robot) {
  // Escape для безопасного вывода в HTML
  const esc = (str) => String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const escJSON = (str) => String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');

  // Формируем specs для вывода
  const specsHTML = Object.entries(robot.specs || {})
    .map(([key, value]) => `<li><strong>${esc(key)}:</strong> ${esc(value)}</li>`)
    .join('\n                            ');

  const tagsHTML = (robot.tags || [])
    .map(tag => `<span class="tag">${esc(tag)}</span>`)
    .join('\n                            ');

  // Похожие роботы (берём 3 из той же категории, кроме текущего)
  const similar = robots
    .filter(r => r.id !== robot.id && r.category === robot.category)
    .slice(0, 3);

  const similarHTML = similar.length > 0
    ? similar.map(r => `
                        <div class="robot-card">
                            <div class="robot-image">
                                ${r.image 
                                  ? `<img src="${esc(r.image)}" alt="${esc(r.name)} — ${esc(r.category || 'робот')} для бизнеса" loading="lazy" width="300" height="220" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span class="robot-image-fallback" style="display:none;">${esc(r.icon || '🤖')}</span>`
                                  : esc(r.icon || '🤖')
                                }
                            </div>
                            <h4>${esc(r.name)}</h4>
                            <p class="robot-price">${esc(r.price || 'Цена по запросу')}</p>
                            <a href="robot-${esc(r.slug)}.html" class="btn btn-small">Подробнее →</a>
                        </div>
    `).join('')
    : '<p style="color:#94A3B8;">Похожих моделей пока нет</p>';

  // ROI примерный расчёт
  const priceNum = robot.priceValue || 0;
  const monthlySavings = Math.round(priceNum * 0.03);
  const paybackMonths = priceNum > 0 ? Math.ceil(priceNum / monthlySavings) : 0;
  const roi = priceNum > 0 ? Math.round(((monthlySavings * 36 - priceNum) / priceNum) * 100) : 0;

  function formatPrice(num) {
    return new Intl.NumberFormat('ru-RU').format(num) + ' ₽';
  }

  const roiCostStr = priceNum > 0 ? formatPrice(priceNum) : '—';
  const roiSavingsStr = priceNum > 0 ? formatPrice(monthlySavings) + ' / мес' : '—';
  const roiPaybackStr = priceNum > 0 ? `${paybackMonths} месяцев` : '—';
  const roiPercentStr = priceNum > 0 ? (roi > 0 ? `+${roi}%` : `${roi}%`) : '—';

  // JSON-LD Product schema
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": robot.name,
    "description": robot.description || '',
    "image": robot.image ? `https://planeta-ladariya.ru/${robot.image}` : '',
    "brand": {
      "@type": "Brand",
      "name": robot.brand || 'Без бренда'
    },
    "offers": {
      "@type": "Offer",
      "url": `https://planeta-ladariya.ru/robot-${robot.slug}.html`,
      "priceCurrency": robot.priceCurrency || "RUB",
      "price": robot.priceValue || 0,
      "availability": robot.availability === "InStock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "RoboGuide"
      }
    }
  };

  if (robot.priceValue === 0 || !robot.priceValue) {
    jsonLD.offers.priceSpecification = {
      "@type": "PriceSpecification",
      "price": 0,
      "priceCurrency": "RUB",
      "valueAddedTaxIncluded": true
    };
  }

  // BreadcrumbList JSON-LD
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
        "name": "Каталог",
        "item": "https://planeta-ladariya.ru/catalog.html"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": robot.name,
        "item": `https://planeta-ladariya.ru/robot-${robot.slug}.html`
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(robot.name)} — цена, характеристики, окупаемость — RoboGuide</title>
    <meta name="description" content="${esc(robot.name)} — ${esc((robot.description || '').slice(0, 140))} Цена: ${esc(robot.price || 'по запросу')}. Расчёт окупаемости, подбор и внедрение." />
    <link rel="canonical" href="https://planeta-ladariya.ru/robot-${esc(robot.slug)}.html" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>" />

    <meta property="og:type" content="product" />
    <meta property="og:title" content="${esc(robot.name)} — цена и характеристики — RoboGuide" />
    <meta property="og:description" content="${esc((robot.description || '').slice(0, 160))}" />
    <meta property="og:url" content="https://planeta-ladariya.ru/robot-${esc(robot.slug)}.html" />
    <meta property="og:image" content="https://planeta-ladariya.ru/${esc(robot.image || 'images/hero-robot.jpg')}" />
    <meta property="og:locale" content="ru_RU" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="stylesheet" href="css/style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

    <!-- JSON-LD Product -->
    <script type="application/ld+json">
${JSON.stringify(jsonLD, null, 2)}
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
                    <li><a href="blog.html">Блог</a></li>
                    <li><a href="about.html">О нас</a></li>
                    <li><a href="contact.html" class="btn btn-outline">Контакты</a></li>
                </ul>
            </nav>
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Открыть меню" aria-expanded="false">☰</button>
        </div>
    </header>

    <section class="robot-detail">
        <div class="container">
            <!-- Хлебные крошки -->
            <div class="breadcrumbs">
                <a href="index.html">Главная</a> → 
                <a href="catalog.html">Каталог</a> → 
                <span>${esc(robot.name)}</span>
            </div>

            <div class="detail-grid">
                <!-- Левая колонка: картинка/иконка -->
                <div class="detail-image">
                    ${robot.image
                        ? `<img src="${esc(robot.image)}" alt="${esc(robot.name)} — ${esc(robot.category || 'робот')} для бизнеса, характеристики и цена" loading="eager" width="600" height="450" style="width:100%; border-radius:16px; object-fit:cover;" />`
                        : `<div class="detail-icon">${esc(robot.icon || '🤖')}</div>`
                    }
                </div>

                <!-- Правая колонка: информация -->
                <div class="detail-info">
                    <h1 class="detail-name">${esc(robot.name)}</h1>
                    <p class="detail-category">${esc(robot.category || 'Без категории')}</p>
                    <p class="detail-price">${esc(robot.price || 'Цена по запросу')}</p>
                    <p class="detail-description">${esc(robot.description || '')}</p>

                    <!-- Характеристики -->
                    <div class="detail-specs">
                        <h3>📋 Характеристики</h3>
                        <ul>
                            ${specsHTML || '<li>Характеристики уточняются</li>'}
                        </ul>
                    </div>

                    <!-- Кнопки действий -->
                    <div class="detail-actions">
                        <a href="contact.html" class="btn btn-primary">Запросить цену</a>
                        <a href="roi-calculator.html" class="btn btn-secondary">Рассчитать ROI</a>
                        <button class="btn btn-outline" onclick="alert('Функция сравнения будет доступна в следующей версии')">Добавить к сравнению</button>
                    </div>

                    <!-- Теги -->
                    <div class="detail-tags">
                        ${tagsHTML || `<span class="tag">${esc(robot.category)}</span>`}
                    </div>
                </div>
            </div>

            <!-- Блок ROI (окупаемость) -->
            <div class="detail-roi">
                <h3>📊 Прогноз окупаемости</h3>
                <div class="roi-grid">
                    <div class="roi-item">
                        <span class="roi-label">Стоимость робота</span>
                        <span class="roi-value">${roiCostStr}</span>
                    </div>
                    <div class="roi-item">
                        <span class="roi-label">Экономия в месяц</span>
                        <span class="roi-value">${roiSavingsStr}</span>
                    </div>
                    <div class="roi-item">
                        <span class="roi-label">Окупаемость</span>
                        <span class="roi-value highlight">${roiPaybackStr}</span>
                    </div>
                    <div class="roi-item">
                        <span class="roi-label">ROI за 3 года</span>
                        <span class="roi-value">${roiPercentStr}</span>
                    </div>
                </div>
                <p class="roi-note">* Расчёт примерный. Точные цифры зависят от вашего бизнеса. <a href="roi-calculator.html">Рассчитать точный ROI →</a></p>
            </div>

            <!-- Похожие роботы -->
            <div class="similar-robots">
                <h3>🔄 Похожие модели</h3>
                <div class="robots-grid">
                    ${similarHTML}
                </div>
            </div>
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
robots.forEach(robot => {
  if (!robot.slug) {
    console.warn(`⚠️  Пропущен робот без slug: ${robot.name}`);
    return;
  }

  const filename = `robot-${robot.slug}.html`;
  const filepath = path.join(__dirname, '..', filename);
  const html = generatePage(robot);

  fs.writeFileSync(filepath, html, 'utf-8');
  console.log(`✅ Создан: ${filename}`);
});

console.log(`\n✅ Готово! Создано ${robots.length} страниц.`);
console.log(`\nТеперь нужно:`);
console.log(`1. Обновить ссылки в catalog.html и index.html:`);
console.log(`   robot-detail.html?id=unitree-g1 → robot-unitree-g1.html`);
console.log(`2. Добавить 301-редиректы со старых ?id= URL (через .htaccess или meta refresh)`);
console.log(`3. Обновить sitemap.xml`);
console.log(`4. Заменить ID Метрики и GA4 в сгенерированных файлах`);
