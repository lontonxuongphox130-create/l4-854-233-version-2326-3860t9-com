(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.getElementById("heroSlider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
    if (!inputs.length && !selects.length) {
      return;
    }

    function apply() {
      var text = inputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(" ");
      var filter = selects.map(function (select) {
        return select.value.trim().toLowerCase();
      }).filter(Boolean).join(" ");

      grids.forEach(function (grid) {
        Array.prototype.slice.call(grid.querySelectorAll(".movie-card")).forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchText = !text || text.split(/\s+/).every(function (word) {
            return haystack.indexOf(word) !== -1;
          });
          var matchFilter = !filter || haystack.indexOf(filter) !== -1;
          card.classList.toggle("is-hidden-card", !(matchText && matchFilter));
        });
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", apply);
    });
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  }

  window.setupMoviePlayer = function (videoId, source) {
    ready(function () {
      var video = document.getElementById(videoId);
      if (!video) {
        return;
      }
      var overlay = document.querySelector('[data-player="' + videoId + '"]');
      var loaded = false;
      var hlsInstance = null;

      function bindSource() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function start() {
        bindSource();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
