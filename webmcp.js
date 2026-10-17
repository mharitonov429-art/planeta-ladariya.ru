/*
 * WebMCP для planeta-ladariya.ru (RoboGuide, статический сайт на GitHub Pages).
 * Регистрирует три read-only инструмента для браузерных ИИ-агентов:
 *   1) search_robots — поиск роботов в каталоге (data/robots.json) по словам, категории и цене;
 *   2) get_robot_details — полные характеристики одного робота по id;
 *   3) get_contact_info — контакты и способы связи.
 * WebMCP — черновик стандарта: если браузер его не поддерживает,
 * скрипт молча ничего не делает и сайт работает как обычно.
 */
(function () {
  'use strict';

  var mc = (typeof document !== 'undefined' && document.modelContext) ||
           (typeof navigator !== 'undefined' && navigator.modelContext);
  if (!mc) return;

  var CATEGORIES = ['гуманоиды', 'роботы-собаки', 'сервисные', 'образовательные', 'логистические'];

  function text(value) {
    return { content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }] };
  }

  function abs(path) {
    return new URL(path, location.href).href;
  }

  function loadRobots() {
    return fetch(abs('data/robots.json'), { credentials: 'omit' })
      .then(function (r) { return r.json(); })
      .then(function (data) { return data.robots || []; });
  }

  // «от 3 700 000 ₽» -> 3700000; «Цена по запросу» -> null
  function priceNumber(priceText) {
    var digits = String(priceText || '').replace(/[^0-9]/g, '');
    return digits ? parseInt(digits, 10) : null;
  }

  function robotUrl(robot) {
    return abs('robot-detail.html?id=' + encodeURIComponent(robot.id));
  }

  function shortRobot(robot) {
    return {
      id: robot.id,
      name: robot.name,
      category: robot.category,
      price: robot.price || 'Цена по запросу',
      description: robot.description || '',
      url: robotUrl(robot)
    };
  }

  var searchRobots = {
    name: 'search_robots',
    description: 'Поиск роботов в каталоге RoboGuide (16 моделей: гуманоиды, роботы-собаки, сервисные, образовательные, логистические). Можно искать по словам, фильтровать по категории и максимальной цене в рублях. Возвращает до 10 моделей со ссылкой. Цены ориентировочные и могут меняться; у моделей с «ценой по запросу» числовой цены нет.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Слова для поиска: название, задача, тег. Например «официант», «склад», «Unitree», «школа»' },
        category: { type: 'string', enum: CATEGORIES, description: 'Категория каталога' },
        max_price_rub: { type: 'number', description: 'Максимальная цена в рублях. Модели без указанной цены («по запросу») при этом фильтре не возвращаются' }
      }
    },
    annotations: { readOnlyHint: true },
    execute: function (input) {
      input = input || {};
      var words = String(input.query || '').toLowerCase().split(/\s+/).filter(Boolean);
      var category = input.category ? String(input.category).toLowerCase() : '';
      var maxPrice = typeof input.max_price_rub === 'number' && isFinite(input.max_price_rub) ? input.max_price_rub : null;

      return loadRobots().then(function (robots) {
        var found = robots.filter(function (r) {
          if (category && String(r.category).toLowerCase() !== category) return false;
          if (maxPrice !== null) {
            var p = priceNumber(r.price);
            if (p === null || p > maxPrice) return false;
          }
          var hay = [r.name, r.category, r.description, (r.tags || []).join(' ')].join(' ').toLowerCase();
          return words.every(function (w) { return hay.indexOf(w) !== -1; });
        }).slice(0, 10).map(shortRobot);

        return text(found.length ? found : 'Ничего не найдено. Весь каталог: ' + abs('catalog.html'));
      }).catch(function () {
        return text('Не удалось загрузить каталог. Страница каталога: ' + abs('catalog.html'));
      });
    }
  };

  var getRobotDetails = {
    name: 'get_robot_details',
    description: 'Полная карточка одного робота из каталога RoboGuide: категория, ориентировочная цена, описание, характеристики, теги и ссылка. Идентификаторы моделей можно получить через search_robots.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Идентификатор робота, например «unitree-g1» или «pudu-bellabot»' }
      },
      required: ['id']
    },
    annotations: { readOnlyHint: true },
    execute: function (input) {
      var id = String((input && input.id) || '').toLowerCase().trim();
      return loadRobots().then(function (robots) {
        var robot = robots.filter(function (r) { return String(r.id).toLowerCase() === id; })[0];
        if (!robot) {
          return text('Робот с id «' + id + '» не найден. Доступные id: ' + robots.map(function (r) { return r.id; }).join(', '));
        }
        var details = shortRobot(robot);
        details.specs = robot.specs || {};
        details.tags = robot.tags || [];
        details.note = 'Цена ориентировочная и может меняться; актуальную стоимость уточняйте по контактам сайта.';
        return text(details);
      }).catch(function () {
        return text('Не удалось загрузить каталог. Страница каталога: ' + abs('catalog.html'));
      });
    }
  };

  var getContactInfo = {
    name: 'get_contact_info',
    description: 'Контакты RoboGuide для консультации по подбору и внедрению роботов: телефон, email, мессенджеры, адрес и ссылки на форму обратной связи и ROI-калькулятор.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: function () {
      return text({
        phone: '+7 (996) 404-95-93',
        phone_hours: 'пн–пт, 9:00–20:00',
        email: 'stroitel.yug@mail.ru',
        telegram: 'https://t.me/Ladaria7529',
        vk: 'https://vk.ru/it.super.jump',
        address: '452530, Республика Башкортостан, Дуванский район, с. Месягутово, ул. И.Усова, д. 18, кв. 1',
        contact_form: abs('contact.html'),
        roi_calculator: abs('roi-calculator.html'),
        note: 'Сайт не продаёт роботов онлайн и не принимает оплату: подбор и условия поставки согласуются индивидуально. Инструмент только возвращает контакты и ничего не отправляет от имени пользователя.'
      });
    }
  };

  var tools = [searchRobots, getRobotDetails, getContactInfo];

  tools.forEach(function (tool) {
    try {
      if (typeof mc.registerTool === 'function') {
        var r = mc.registerTool(tool);
        if (r && typeof r.catch === 'function') r.catch(function () {});
      }
    } catch (e) { /* инструмент уже зарегистрирован или политика браузера запрещает */ }
  });

  if (typeof mc.registerTool !== 'function' && typeof mc.provideContext === 'function') {
    try { mc.provideContext({ tools: tools }); } catch (e) {}
  }
})();
