// ==UserScript==
// @name         Pause videos on page load
// @version      2025-10-26
// @description  try to stop all html5 players on page load (works most of time), can play video only after mouse click (sometimes 2x times)
// @author       Natrim
// @match        http://*/*
// @match        https://*/*
// @exclude      about:blank
// @exclude      chrome://*/*
// @exclude      vivaldi://*/*
// @exclude      helium://*/*
// @exclude      brave://*/*
// @exclude      edge://*/*
// @exclude      opera://*/*
// @downloadURL  https://github.com/natrim/userscripts/raw/main/pause_videos.user.js
// @updateURL    https://github.com/natrim/userscripts/raw/main/pause_videos.user.js
// @grant        none
// @noframes     true
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const win = this instanceof Window ? this : window;
    if (win.top !== win.self) return; // run only on main frame
    const hkey_script = 'fasjVdeionhStop2';
    if (win[hkey_script]) return; // dont run if already loaded
    win[hkey_script] = true;

    //TODO: save timestamp and clean old sources
    const stoppedSources = {};

    const stopIframe = (el) => { if (stoppedSources[el.src]) return; el.src = el.src; stoppedSources[el.src] = true; }

    const stopVideo = (el) => {
        if (stoppedSources[el.src]) return;
        el.pause();
        const run = () => {
            stoppedSources[el.src] = true;
            el.removeEventListener("click", run);
        };
        el.addEventListener("click", run);
    };

    const stop = () => {
        document.querySelectorAll('iframe:not([src^="javascript:"])')?.forEach(stopIframe);
        document.querySelectorAll('video')?.forEach(stopVideo);
    };

    // now run
    stop();

    // whitelist all videos on this page after spacebar press if time passed
    const spaceClickHandler = (e) => {
        if (e && e.keyCode === 32) {
            document.removeEventListener("keyup", spaceClickHandler);
            document.querySelectorAll('video')?.forEach((el) => {
                el.addEventListener("playing", () => {
                    stoppedSources[el.src] = true;
                }, { once: true });
            });
        }
    };
    setTimeout(() => {
        document.addEventListener("keyup", spaceClickHandler);
    }, 1000);

    // polling cause observing mutations fails sometimes
    setInterval(stop, 300);
})();
