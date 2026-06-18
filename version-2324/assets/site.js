(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileNav() {
        const toggle = $('[data-nav-toggle]');
        const nav = $('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        const carousel = $('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        const slides = $all('[data-hero-slide]', carousel);
        const dots = $all('[data-hero-dot]', carousel);
        const next = $('[data-hero-next]', carousel);
        const prev = $('[data-hero-prev]', carousel);
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });
        restart();
    }

    function initCatalog() {
        const controls = $('[data-catalog-controls]');
        const grid = $('[data-card-grid]');
        if (!controls || !grid) {
            return;
        }
        const cards = $all('[data-card]', grid);
        const searchInput = $('[data-filter-search]', controls);
        const categoryInput = $('[data-filter-category]', controls);
        const typeInput = $('[data-filter-type]', controls);
        const yearInput = $('[data-filter-year]', controls);
        const sortInput = $('[data-filter-sort]', controls);
        const resetButton = $('[data-filter-reset]', controls);
        const resultCount = $('[data-result-count]', controls);
        const initialQuery = new URLSearchParams(window.location.search).get('q') || '';
        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function yearMatches(cardYear, filterYear) {
            if (!filterYear) {
                return true;
            }
            const year = parseInt(cardYear, 10);
            if (Number.isNaN(year)) {
                return filterYear === '1990';
            }
            if (filterYear === '2026') {
                return year >= 2026;
            }
            if (filterYear === '2020') {
                return year >= 2020 && year <= 2025;
            }
            if (filterYear === '2010') {
                return year >= 2010 && year <= 2019;
            }
            if (filterYear === '2000') {
                return year >= 2000 && year <= 2009;
            }
            if (filterYear === '1990') {
                return year < 2000;
            }
            return true;
        }

        function sortCards(visibleCards) {
            const sortValue = sortInput ? sortInput.value : 'default';
            const sorted = visibleCards.slice();
            if (sortValue === 'views') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                });
            } else if (sortValue === 'year') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
            } else if (sortValue === 'title') {
                sorted.sort(function (a, b) {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                });
            } else {
                sorted.sort(function (a, b) {
                    return cards.indexOf(a) - cards.indexOf(b);
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function applyFilters() {
            const query = normalize(searchInput ? searchInput.value : '');
            const category = normalize(categoryInput ? categoryInput.value : '');
            const type = normalize(typeInput ? typeInput.value : '');
            const year = yearInput ? yearInput.value : '';
            const visible = [];
            cards.forEach(function (card) {
                const text = normalize(card.dataset.search);
                const cardCategory = normalize(card.dataset.category);
                const cardType = normalize(card.dataset.type);
                const cardYear = card.dataset.year || '';
                const matched = (!query || text.indexOf(query) !== -1) &&
                    (!category || cardCategory === category) &&
                    (!type || cardType.indexOf(type) !== -1 || text.indexOf(type) !== -1) &&
                    yearMatches(cardYear, year);
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible.push(card);
                }
            });
            sortCards(visible);
            if (resultCount) {
                resultCount.textContent = '当前显示 ' + visible.length + ' 部';
            }
        }

        [searchInput, categoryInput, typeInput, yearInput, sortInput].forEach(function (input) {
            if (!input) {
                return;
            }
            input.addEventListener('input', applyFilters);
            input.addEventListener('change', applyFilters);
        });
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (categoryInput && categoryInput.tagName !== 'INPUT') {
                    categoryInput.value = '';
                }
                if (typeInput) {
                    typeInput.value = '';
                }
                if (yearInput) {
                    yearInput.value = '';
                }
                if (sortInput) {
                    sortInput.value = 'default';
                }
                applyFilters();
            });
        }
        applyFilters();
    }

    function initPlayers() {
        $all('[data-hls-url]').forEach(function (box) {
            const video = $('video', box);
            const button = $('[data-play-trigger]', box);
            const status = $('[data-player-status]', box);
            const url = box.getAttribute('data-hls-url');
            let loaded = false;
            let hls = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function loadSource() {
                if (!video || !url || loaded) {
                    return;
                }
                loaded = true;
                box.classList.add('is-loaded');
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源加载完成，可继续播放。');
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('播放源加载异常，请刷新页面后重试。');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    setStatus('使用浏览器原生 HLS 播放。');
                } else {
                    video.src = url;
                    setStatus('已绑定播放源，浏览器会尝试直接播放。');
                }
            }

            function startPlayback() {
                if (!video) {
                    return;
                }
                loadSource();
                const promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setStatus('请再次点击播放按钮开始播放。');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function () {
                    button.classList.add('is-hidden');
                    startPlayback();
                });
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!loaded || video.paused) {
                        startPlayback();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener('play', function () {
                    box.classList.add('is-playing');
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
                video.addEventListener('pause', function () {
                    box.classList.remove('is-playing');
                });
            }
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHero();
        initCatalog();
        initPlayers();
    });
})();
