// ==UserScript==
// @name         Pause videos on page load
// @version      2025-09-19
// @description  try to stop all html5 players on page (works most of time)
// @author       Natrim
// @match        http://*/*
// @match        https://*/*
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

    const stopFrames = () => {
        document.querySelectorAll('iframe').forEach(v => { if (v.dataset.autostop) return; v.src = v.src; v.dataset.autostop = true; });
    };
    const stopVideos = () => {
        document.querySelectorAll('video').forEach(v => {
            if (v.dataset.autostop) return;
            if (!v.dataset.autostopclick) {
                const run = () => {
                    v.dataset.autostop = true;
                    v.dataset.autostopclick = undefined;
                    v.removeEventListener("play", run);
                    v.removeEventListener("playing", run);
                    v.removeEventListener("click", run);
                };
                v.dataset.autostopclick = true;
                v.addEventListener("play", run);
                v.addEventListener("playing", run);
                v.addEventListener("click", run);
            }
            v.pause();
        });
    };

    observe(() => {
        stopFrames();
        stopVideos();
    });
})();
