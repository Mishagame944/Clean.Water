const PHONE = '+380662214073';
const DELIVERY_ADDRESS_KEYWORDS = ['кахов', 'каховська', 'каховська 62', '62', '62а', '62a'];

function openTelegram(message) {
    // replace with your bot or username
    const telegramUrl = `https://t.me/yourusername?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
}

function saveOrder(order) {
    try {
        const list = JSON.parse(localStorage.getItem('orders') || '[]');
        list.unshift(order);
        localStorage.setItem('orders', JSON.stringify(list.slice(0, 50)));
    } catch (e) {/* ignore */ }
}

function checkAddress(addr) {
    if (!addr) return false;
    const low = addr.toLowerCase();
    return DELIVERY_ADDRESS_KEYWORDS.some(k => low.includes(k));
}

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for nav
    document.querySelectorAll('.nav__link').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const id = a.getAttribute('href').slice(1);
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // background toggle button (replaced quick order)
    const bgBtn = document.getElementById('bgToggle');
    bgBtn?.addEventListener('click', () => {
        document.body.classList.toggle('gray');
        if (document.body.classList.contains('gray')) {
            // currently gray, show sun to indicate return to light
            bgBtn.textContent = '☀️';
        } else {
            // light mode, show moon to indicate dark toggle
            bgBtn.textContent = '🌙';
        }
    });

    // Snow effect - always active
    let snowflakesContainer = null;
    
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '❄';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = (3 + Math.random() * 3) + 's';
        snowflake.style.fontSize = (0.8 + Math.random() * 1.2) + 'em';
        return snowflake;
    }
    
    // Initialize snowflakes container (can start empty and toggled)
    let snowActive = true;
    function startSnow() {
        if (!snowflakesContainer) {
            snowflakesContainer = document.createElement('div');
            snowflakesContainer.className = 'snowflakes';
            document.body.appendChild(snowflakesContainer);
        }
        snowActive = true;
    }
    function stopSnow() {
        snowActive = false;
        if (snowflakesContainer) {
            snowflakesContainer.remove();
            snowflakesContainer = null;
        }
    }
    // begin with snow active
    startSnow();
    const createSnowInterval = setInterval(() => {
        if (snowActive && snowflakesContainer && snowflakesContainer.children.length < 100) {
            snowflakesContainer.appendChild(createSnowflake());
        }
    }, 100);

    // toggle button behavior
    const snowToggle = document.getElementById('snowToggle');
    snowToggle?.addEventListener('click', () => {
        if (snowActive) {
            stopSnow();
            snowToggle.textContent = '⛄';
        } else {
            startSnow();
            snowToggle.textContent = '❄️';
        }
    });

    // Delegate for product actions
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.order-btn');
        if (btn) {
            const name = btn.dataset.name || 'товар';
            const size = (btn.dataset.size || '').toLowerCase();
            if (size.includes('18')) {
                const addr = prompt(`Ви обрали ${name}. Введіть адресу доставки (ЖК Каховська 62а):`);
                if (!addr) return;
                if (checkAddress(addr)) {
                    saveOrder({ type: 'product', item: name, address: addr, timestamp: Date.now() });
                    openPhone();
                } else {
                    if (confirm('Доставка лише по ЖК Каховська 62а. Зателефонувати для уточнення?')) openPhone();
                }
            } else {
                if (confirm(`${name} недоступний для доставки. Зателефонувати для самовивозу?`)) openPhone();
            }
        }

        const det = e.target.closest('.details-btn');
        if (det) {
            const name = det.dataset.name || '';
            alert(`${name}\n\nПрофіль продукту:\nЯкісна вода, сертифікати, доставка 18л для ЖК Каховська 62а.`);
        }
    });

    // Accessories filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            const items = document.querySelectorAll('.accessory');
            items.forEach(it => {
                const cat = it.dataset.category;
                if (filter === 'all' || cat === filter) {
                    it.classList.remove('hidden');
                } else {
                    it.classList.add('hidden');
                }
            });
        });
    });

    // Lightweight image lazy-loading fallback (for older browsers)
    if ('IntersectionObserver' in window) {
        const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    const img = en.target;
                    // if data-src present, swap
                    if (img.dataset.src) { img.src = img.dataset.src }
                    obs.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });
        lazyImgs.forEach(i => io.observe(i));
    }
});
