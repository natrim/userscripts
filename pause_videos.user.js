// ==UserScript==
// @name         Pause videos on page load
// @version      2025-10-17
// @description  try to stop all html5 players on page (works most of time) (first 5 seconds you cannot start video with event (button, keyboard), just with Mouse click)
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

    const observe = (fn, e = document.body, config = { childList: 1, subtree: 1, attr: 1 }) => {
        const observer = new MutationObserver(fn);
        observer.observe(e, config);
        return () => observer.disconnect();
    };

    let runningFrameStop = false;
    let runningFrameStopTimer = null;
    const stopFrames = () => {
        if (runningFrameStop) {
            if (runningFrameStopTimer) {
                clearTimeout(runningFrameStopTimer);
            }
            runningFrameStopTimer = setTimeout(() => {
                runningFrameStopTimer = null;
                stopFrames();
            }, 500);
            return;
        }
        runningFrameStop = true;
        document.querySelectorAll('iframe').forEach(v => { if (v.dataset.autostop) return; v.src = v.src; v.dataset.autostop = true; });
        runningFrameStop = false;
    };

    let runningVideoStop = false;
    let runningVideoStopTimer = null;
    const stopVideos = () => {
        if (runningVideoStop) {
            if (runningVideoStopTimer) {
                clearTimeout(runningVideoStopTimer);
            }
            runningVideoStopTimer = setTimeout(() => {
                runningVideoStopTimer = null;
                stopVideos();
            }, 500);
            return;
        }
        runningVideoStop = true;
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
                ftimer = setTimeout(() => {
                    v.addEventListener("play", run);
                    v.addEventListener("playing", run);
                }, 5000);
                v.addEventListener("click", run);
            }
            v.pause();
        });
        runningVideoStop = false;
    };

    // look at dom changes
    observe(() => {
        stopFrames();
        stopVideos();
    });
})();
