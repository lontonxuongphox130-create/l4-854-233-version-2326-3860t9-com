(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var active = 0;
            var timer = null;

            function show(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle("is-active", idx === active);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle("is-active", idx === active);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(active - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(active + 1);
                    restart();
                });
            }
            restart();
        }

        var list = document.querySelector("[data-filter-list]");
        var panel = document.querySelector("[data-filter-panel]");
        if (list && panel) {
            var input = panel.querySelector("[data-search-input]");
            var typeSelect = panel.querySelector("[data-type-filter]");
            var yearSelect = panel.querySelector("[data-year-filter]");
            var sortSelect = panel.querySelector("[data-sort-filter]");
            var state = panel.querySelector("[data-filter-state]");
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (query && input) {
                input.value = query;
            }

            function cardText(card) {
                return [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-tags") || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();
            }

            function sortCards(mode) {
                var sorted = cards.slice();
                if (mode === "year-desc") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    });
                } else if (mode === "year-asc") {
                    sorted.sort(function (a, b) {
                        return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                    });
                } else if (mode === "title") {
                    sorted.sort(function (a, b) {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    });
                }
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            function apply() {
                var term = input ? input.value.trim().toLowerCase() : "";
                var typeValue = typeSelect ? typeSelect.value : "";
                var yearValue = yearSelect ? yearSelect.value : "";
                var matched = 0;

                cards.forEach(function (card) {
                    var ok = true;
                    if (term && cardText(card).indexOf(term) === -1) {
                        ok = false;
                    }
                    if (typeValue && card.getAttribute("data-type") !== typeValue) {
                        ok = false;
                    }
                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        matched += 1;
                    }
                });

                if (sortSelect) {
                    sortCards(sortSelect.value);
                }
                if (state) {
                    state.textContent = matched > 0 ? "片单已更新" : "没有匹配内容";
                }
            }

            [input, typeSelect, yearSelect, sortSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        }
    });
})();
