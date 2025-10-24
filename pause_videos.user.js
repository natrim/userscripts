// ==UserScript==
// @name         Pause videos on page load
// @version      2025-10-24
// @description  try to stop all html5 players on page load (works most of time), can play video only after mouse click (sometimes 2x times) (no play button and spacebar on yt!)
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

    // polling cause observing mutations fails sometimes
    setInterval(stop, 300);
})();
