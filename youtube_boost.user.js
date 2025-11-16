// ==UserScript==
// @name         Youtube Boost
// @version      2025-11-12
// @description  some stuff for Youtube i use (disable av1, pwa dark title, force 720p videos, auto-pip, stop shorts looping, wide video by default, css ui changes)
// @author       Natrim
// @match        https://www.youtube.com/*
// @match        https://www.youtube-nocookie.com/*
// @match        https://www.youtu.be/*
// @match        https://music.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @downloadURL  https://github.com/natrim/userscripts/raw/main/youtube_boost.user.js
// @updateURL    https://github.com/natrim/userscripts/raw/main/youtube_boost.user.js
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==


// Disable av1
(function disableAV1() {
    // return a custom MIME type checker that can defer to the original function
    function makeModifiedTypeChecker(origChecker) {
        // Check if a video type is allowed
        return function (type) {
            if (type === undefined || type.indexOf('av01') !== -1) return '';
            // Otherwise, ask the browser
            return origChecker(type);
        };
    }

    function overrideCanPlayType() {
        // Override video element canPlayType() function
        var videoElem = document.createElement('video');
        var origCanPlayType = videoElem.canPlayType.bind(videoElem);
        videoElem.__proto__.canPlayType = makeModifiedTypeChecker(origCanPlayType);
    }

    function overrideIsTypeSuppoerted() {
        // Override media source extension isTypeSupported() function
        var mse = window.MediaSource;
        // Check for MSE support before use
        if (mse === undefined) return;
        var origIsTypeSupported = mse.isTypeSupported.bind(mse);
        mse.isTypeSupported = makeModifiedTypeChecker(origIsTypeSupported);
    }

    overrideCanPlayType();
    overrideIsTypeSuppoerted();
})();

// PWA title theme
(function() {
    'use strict';
    var theme = document.querySelector("[name=theme-color]")
    if (theme) {
        theme.content = "#111";
        // theme.media= "(prefers-color-scheme: dark)";
    } else {
        var meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = "#111";
        // meta.media= "(prefers-color-scheme: dark)";
        document.getElementsByTagName("head")[0].prepend(meta);
    }
})();


// force 720p
(function() {
    'use strict';

    localStorage.setItem('yt-player-quality', '{"data":"{\\"quality\\":720,\\"previousQuality\\":1080}","expiration": ' + (Date.now()+2629746000)+', "creation": '+Date.now()+'}');
    localStorage.setItem('yt-player-performance-cap', '{"data":"{}","expiration": ' + (Date.now()+2629746000)+', "creation": '+Date.now()+'}');
    localStorage.setItem('yt-player-performance-cap-active-set', '{"data":"{}","expiration": ' + (Date.now()+2629746000)+', "creation": '+Date.now()+'}');

})();

// AUTO PIP
(function() {
    'use strict';

    if (window.pipBoosted) return;
    window.pipBoosted = true;
    let isAPipAllowedOnPage = true;
    try {
        const checkPIPButton = () => {
            if (document.getElementById("autoPipButtonToggle")) {
                return;
            }
            const parent = document.querySelector(".ytp-right-controls");
            if (!parent) {
                return;
            }
            try {
                const btn = document.createElement("button");
                btn.className = "ytp-button";
                btn.id = "autoPipButtonToggle";
                btn.title = "Toggle Auto PIP ON / OFF";
                //btn.appendChild(text);
                var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
                svg.setAttribute("viewBox", "0 0 36 36");
                //svg.setAttribute("fill", "none");
                svg.setAttribute("fill", isAPipAllowedOnPage ? "green" : "red");
                svg.setAttribute("width", "100%");
                svg.setAttribute("height", "100%");
                svg.setAttribute("style", "padding:0");

                var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                newElement.setAttribute("d", "M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z");
                svg.appendChild(newElement);

                newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                newElement.setAttribute("d", "M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z");
                newElement.setAttribute("fill", "#fff");
                svg.appendChild(newElement);


                btn.appendChild(svg);
                btn.addEventListener("click", function () {
                    isAPipAllowedOnPage = !isAPipAllowedOnPage;
                    svg.setAttribute("fill", isAPipAllowedOnPage ? "green" : "red");
                });
                parent.appendChild(btn);
            } catch(e) {
                console.error(e);
            }
        };
        setInterval(checkPIPButton, 1000);
        const isVideoPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
        navigator.mediaSession.setActionHandler("enterpictureinpicture", () => {
            if (!isAPipAllowedOnPage) return;
            const BreakException = {};
            try{
                document.querySelectorAll("video")?.forEach((video) => {
                    if (!!video.currentSrc && isVideoPlaying(video) && video.requestPictureInPicture) {
                        video.requestPictureInPicture();
                        throw BreakException;
                    }
                });
            } catch (e) {
                if (e !== BreakException) throw e;
            }
        });
    } catch (error) {
        console.log("The enterpictureinpicture action is not yet supported.");
    }
})();

// Stop shorts looping
(function() {
    'use strict';

    const win = this instanceof Window ? this : window;
    const hkey_script = 'ppodaDtuber';
    if (win[hkey_script]) return;
    win[hkey_script] = true;

    const observe = (fn, e = document.body, config = { childList: 1, subtree: 1 }) => {
        const observer = new MutationObserver(fn);
        observer.observe(e, config);
        return () => observer.disconnect();
    };

    function observer() {
        let timer = 0;
        observe(() => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                if (location.pathname.startsWith('/shorts/')){
                    document.querySelectorAll('video').forEach(v => { v.loop = false; })
                }
            }, 1);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", observer);
    } else {
        observer();
    }
})();

// Add stop button to playlists
(function() {
    'use strict';

    const win = this instanceof Window ? this : window;
    const hkey_script = 'pakdPlay';
    if (win[hkey_script]) return;
    win[hkey_script] = true;

    function init() {
        const button = document.createElement('button');
        button.classList.add('ytp-button');
        button.style.width = '40px';
        button.style.height = '100%';
        const container = document.createElement('div');
        container.classList.add('ytp-autonav-toggle-button-container');
        const inner = document.createElement('div');
        inner.classList.add('ytp-autonav-toggle-button');
        inner.style.margin = '0 auto';
        button.appendChild(container).appendChild(inner);

        let state = false;
        const changeState = (newState) => {
            state = newState;
            setTimeout(() => {
                document.querySelector('yt-playlist-manager')?.set('canAutoAdvance_', state);
                inner.setAttribute('aria-checked', state.toString());
            }, 100);
        };
        button.addEventListener('click', () => changeState(!state));

        document.addEventListener('yt-page-data-updated', (ev) => {
            if (ev.detail.pageType !== 'watch' || !location.search.match(/\?(?:.*&)?list=.*/)) {
                return;
            }
            changeState(state);
            setTimeout(() => {
                document.querySelector('#playlist-actions #end-actions #flexible-item-buttons')?.replaceChildren(button);
            }, 1000);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

// Stop startpage videos autoplay
(function() {
    'use strict';

    const win = this instanceof Window ? this : window;
    const hkey_script = 'HomerTUbed';
    if (win[hkey_script]) return;
    win[hkey_script] = true;

    const observe = (fn, e = document.body, config = { childList: 1, subtree: 1 }) => {
        const observer = new MutationObserver(fn);
        observer.observe(e, config);
        return () => observer.disconnect();
    };

    function observer() {
        observe(() => {
            document.querySelector('ytd-video-preview')?.remove();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", observer);
    } else {
        observer();
    }
})();

// WIDE player
(function() {
    'use strict';
    document.cookie = 'wide=1; expires=' + new Date('3099').toUTCString() + '; path=/';
})();

// STYLES
const css = `
html,
body {
  height: 100vh;
}
/* make header smaller */
html, ytd-app {
  --ytd-masthead-height: 48px !important;
}
#masthead-container.ytd-app,
ytd-masthead,
ytd-masthead .yt-spec-button-shape-next--size-m,
#container.ytd-masthead,
#background.ytd-masthead,
#search-form.ytd-searchbox,
#searchbox-button.ytd-searchbox,
#voice-search-button,
#voice-search-button #button,
#search-icon-legacy {
  max-height: var(--ytd-masthead-height) !important;
}
#voice-search-button #button.ytd-button-renderer {
  padding: 4px !important;
}
yt-searchbox {
  height: 100% !important;
}
/* hide useless content */
/*#logo,*/
#footer,
#voice-search-button,
/* left panel browse and more youtube plans */
#sections>ytd-guide-section-renderer:nth-child(3),
#sections>ytd-guide-section-renderer:nth-child(4)
/* shorts */
/*,
  #contents > ytd-rich-section-renderer:nth-child(3),
  #contents ytd-reel-shelf-renderer
  */
  {
  display: none !important
}
/* pinker progress bar */
.ytp-swatch-background-color {
  background: #e5227d !important;
  background-color: #e5227d !important;
}
/* pinker progress bar */
.ytp-swatch-background-color {
  background: #e5227d !important;
  background-color: #e5227d !important;
}
/* grayup watched videos thumbnails */
ytd-thumbnail:has(ytd-thumbnail-overlay-resume-playback-renderer) {
  filter: brightness(0.2) grayscale(1);
}
/* bigger video player */
ytd-watch-flexy[full-bleed-player] #full-bleed-container.ytd-watch-flexy {
  max-height: calc(100vh - 129px) !important;
}
/* always show pip button */
.ytp-pip-button {
  display: inline-block !important;
}
.ytp-pip-button svg {
padding: 0 !important;
}
/* not in FF */
@-moz-document url-prefix() {
  .ytp-pip-button {
    display:none !important;
  }
}
/* new ui smaller controls */
.html5-video-player.ytp-delhi-modern, .html5-video-player.ytp-delhi-modern > * {
--yt-delhi-bottom-controls-height: 64px !important;
--yt-delhi-bottom-controls-height-xsmall-width-mode: 64px !important;
--yt-delhi-big-mode-bottom-controls-height: 64px !important;
--yt-delhi-pill-height: 48px !important;
--yt-delhi-pill-top-height: 12px !important;
--yt-delhi-big-mode-pill-height: 48px !important;
--yt-delhi-big-mode-pill-top-height: 12px !important;
}
.ytp-delhi-modern.ytp-big-mode:not(.ytp-xsmall-width-mode) .ytp-chrome-controls .ytp-play-button, .ytp-delhi-modern.ytp-big-mode:not(.ytp-xsmall-width-mode) .ytp-chrome-controls .ytp-play-button-playlist {
margin-top: 8px !important;
width: 56px !important;
height: 56px !important;
}
.ytp-delhi-modern-icons.ytp-big-mode .ytp-chrome-controls .ytp-play-button svg {
    padding: calc((var(--yt-delhi-big-mode-pill-height, 56px) - 28px)/2) !important;
}
.ytp-delhi-modern.ytp-big-mode .ytp-tooltip.ytp-preview {
top: unset !important;
bottom: calc((var(--yt-delhi-big-mode-bottom-controls-height) * 2) + var(--yt-delhi-big-mode-pill-height));
}
#logo, .ytmusic-logo {
    filter: grayscale(1) contrast(2);
}
`;

(function() {
    'use strict';

    if (typeof GM_addStyle != "undefined") {
        GM_addStyle(css);
    } else if (typeof PRO_addStyle != "undefined") {
        PRO_addStyle(css);
    } else if (typeof addStyle != "undefined") {
        addStyle(css);
    } else {
        var node = document.createElement("style");
        node.type = "text/css";
        node.appendChild(document.createTextNode(css));
        var heads = document.getElementsByTagName("head");
        if (heads.length > 0) {
            heads[0].appendChild(node);
        } else {
            // no head yet, stick it whereever
            document.documentElement.appendChild(node);
        }
    }
})();
