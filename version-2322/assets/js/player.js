(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var shell = document.querySelector(".video-shell[data-video]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var button = shell.querySelector(".play-overlay");
        var streamUrl = shell.getAttribute("data-video");
        var hls = null;

        function attachStream() {
            if (!video || !streamUrl) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attachStream();
            shell.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove("is-playing");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
