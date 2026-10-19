/**
 * ЭТАП 3: JSON-LD Organization и WebSite
 * Подключается на всех страницах для базовой структурированной разметки.
 */
(function() {
  'use strict';

  // Organization
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "RoboGuide",
    "url": "https://planeta-ladariya.ru",
    "logo": "https://planeta-ladariya.ru/images/hero-robot.jpg",
    "description": "Экспертный каталог роботов для бизнеса. Подбор, ROI-калькуляция, внедрение.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU",
      "addressRegion": "Республика Башкортостан",
      "addressLocality": "с. Месягутово",
      "postalCode": "452530",
      "streetAddress": "ул. И.Усова, д. 18, кв. 1"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-996-404-95-93",
      "contactType": "customer service",
      "email": "info@planeta-ladariya.ru",
      "areaServed": "RU",
      "availableLanguage": "Russian"
    },
    "sameAs": [
      "https://t.me/Ladaria7529",
      "https://vk.ru/it.super.jump"
    ]
  };

  // WebSite с поиском
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "RoboGuide",
    "url": "https://planeta-ladariya.ru",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://planeta-ladariya.ru/catalog.html?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Вставляем в head
  function insertSchema(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      insertSchema(organization);
      insertSchema(website);
    });
  } else {
    insertSchema(organization);
    insertSchema(website);
  }
})();