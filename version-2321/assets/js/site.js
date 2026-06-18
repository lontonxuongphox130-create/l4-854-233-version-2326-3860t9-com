(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch() {
        var input = document.querySelector("[data-search-input]");
        var items = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
        var count = document.querySelector("[data-search-count]");
        if (!input || !items.length) {
            return;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function filter() {
            var query = normalize(input.value);
            var visible = 0;
            items.forEach(function (item) {
                var haystack = normalize(item.getAttribute("data-search"));
                var matched = !query || haystack.indexOf(query) !== -1;
                item.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = query ? "找到 " + visible + " 部相关内容" : "全部内容";
            }
        }

        input.addEventListener("input", filter);
        filter();
    }

    function setupPlayer() {
        var video = document.querySelector("[data-player]");
        var button = document.querySelector("[data-play-button]");
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var fallback = video.getAttribute("data-mp4");
        var connected = false;
        var hlsInstance = null;

        function connect() {
            if (connected || !stream) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else if (fallback) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = fallback;
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (fallback) {
                video.src = fallback;
            }
            connected = true;
        }

        function play() {
            connect();
            video.controls = true;
            button.hidden = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.hidden = false;
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("play", function () {
            button.hidden = true;
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.hidden = false;
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
})();
