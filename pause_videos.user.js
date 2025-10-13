// ==UserScript==
// @name         Pause videos on page load
// @version      2025-10-12
// @description  try to stop all html5 players on page (works most of time)
// @author       Natrim
// @match        http://*/*
// @match        https://*/*
// @exclude      https://music.youtube.com/*
// @exclude      https://open.spotify.com/*
// @downloadURL  https://github.com/natrim/userscripts/raw/main/pause_videos.user.js
// @updateURL    https://github.com/natrim/userscripts/raw/main/pause_videos.user.js
// @grant        none
// @noframes     true
// ==/UserScript==

(function() {
    'use strict';

    const win = this instanceof Window ? this : window;
    if (win.top !== win.self) return; // run only on main frame
    const hkey_script = 'fasjVdeionhStop2';
    if (win[hkey_script]) return; // dont run if already loaded
    win[hkey_script] = true;

    const observe = (fn, e = document.body, config = { childList: 1, subtree: 1 }) => {
        const observer = new MutationObserver(fn);
        observer.observe(e, config);
        return () => observer.disconnect();
    };

    const stopFrames = (first = false) => {
        document.querySelectorAll('iframe').forEach(v => { if (v.dataset.autostop) return; v.src = v.src; v.dataset.autostop = true; });
    };
    const stopVideos = (first = false) => {
        document.querySelectorAll('video').forEach(v => {
            if (v.dataset.autostop) return;
            if (!v.dataset.autostopclick) {
                let ftimer = null;
                const run = () => {
                    v.dataset.autostop = true;
                    v.dataset.autostopclick = false;
                    if (ftimer) {
                        clearTimeout(ftimer);
                        ftimer = null;
                    }
                    v.removeEventListener("play", run);
                    v.removeEventListener("playing", run);
                    v.removeEventListener("click", run);
                };
                v.dataset.autostopclick = true;
                // on first run allow play button and keyboard shortcut only after some time
                if (first) {
                    ftimer = setTimeout(() => {
                        v.addEventListener("play", run);
                        v.addEventListener("playing", run);
                    }, 3000);
                } else {
                    v.addEventListener("play", run);
                    v.addEventListener("playing", run);
                }
                v.addEventListener("click", run);
            }
            v.pause();
        });
    };

    // look at dom changes
    observe(() => {
        stopFrames();
        stopVideos();
    });

    // run on start first
    stopFrames(true);
    stopVideos(true);
})();
