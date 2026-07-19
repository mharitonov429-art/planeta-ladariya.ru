// ============================================================
// МОБИЛЬНОЕ МЕНЮ
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const navList = document.querySelector('.nav-list');

    if (toggleBtn && navList) {
        toggleBtn.addEventListener('click', function () {
            if (navList.style.display === 'flex') {
                navList.style.display = 'none';
            } else {
                navList.style.display = 'flex';
                navList.style.flexDirection = 'column';
                navList.style.position = 'absolute';
                navList.style.top = '72px';
                navList.style.left = '0';
                navList.style.right = '0';
                navList.style.background = 'white';
                navList.style.padding = '24px';
                navList.style.boxShadow = '0 4px 24px rgba(0,0,0,0.1)';
                navList.style.gap = '16px';
            }
        });
    }
});

// ============================================================
// ЗАГРУЗКА КАТАЛОГА РОБОТОВ ИЗ JSON
// ============================================================
async function loadRobots() {
    try {
        const response = await fetch('/data/robots.json');
        if (!response.ok) throw new Error('Не удалось загрузить каталог');
        const robots = await response.json();
        return robots;
    } catch (error) {
        console.error('Ошибка загрузки роботов:', error);
        return [];
    }
}

// ============================================================
// ФИЛЬТРАЦИЯ РОБОТОВ
// ============================================================
function filterRobots(robots, category) {
    if (!category || category === 'all') return robots;
    return robots.filter(robot => robot.category === category);
}

// ============================================================
// ОТОБРАЖЕНИЕ РОБОТОВ НА СТРАНИЦЕ
// ============================================================
function renderRobots(robots, containerId = 'robotList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (robots.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>😕 Роботов в этой категории пока нет</p>
                <p style="color: #94A3B8; font-size: 14px;">Но мы скоро добавим!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = robots.map(robot => `
        <div class="robot-card" data-id="${robot.id}">
            <div class="robot-image">${robot.icon || '🤖'}</div>
            <h4>${robot.name}</h4>
            <p class="robot-price">${robot.price}</p>
            <p class="robot-desc">${robot.description}</p>
            <a href="robot-detail.html?id=${robot.id}" class="btn btn-small">Подробнее</a>
        </div>
    `).join('');
}

// ============================================================
// ROI-КАЛЬКУЛЯТОР
// ============================================================
function calculateROI(robotCost, monthlySavings, months = 12) {
    const yearlySavings = monthlySavings * months;
    const paybackMonths = Math.ceil(robotCost / monthlySavings);
    const roi = ((yearlySavings - robotCost) / robotCost) * 100;
    return { yearlySavings, paybackMonths, roi };
}

// Пример использования:
// const result = calculateROI(2500000, 85000);
// console.log(`Окупаемость: ${result.paybackMonths} месяцев, ROI: ${result.roi}%`);

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
// Загружаем роботов при загрузке страницы каталога
if (window.location.pathname.includes('catalog.html')) {
    loadRobots().then(robots => {
        renderRobots(robots, 'robotList');
    });
}

// Экспортируем функции для использования в других скриптах
window.loadRobots = loadRobots;
window.filterRobots = filterRobots;
window.renderRobots = renderRobots;
window.calculateROI = calculateROI;

console.log('🤖 RoboGuide: сайт успешно загружен!');
