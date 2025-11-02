// ==UserScript==
// @name         Pause videos on page load
// @version      2025-11-02
// @description  new version prevents all html5 videos to play for 1s (5s for youtube), so you need to click 2x to play it, the delay is to stop autoplay
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

    const allowedToPlayNow = {};
    const elt = document.createElement('video');
    elt.__proto__._play = elt.__proto__.play;
    elt.__proto__.play = async function() {
        const el = this;
        if (!allowedToPlayNow[el.src]) {
            setTimeout(() => {
                if (el) {
                    allowedToPlayNow[el.src] = true;
                }
            }, win.location.host.indexOf("youtube.com") !== -1 ? 5000 : 1000);

            return Promise.reject();
        }

        return el._play();
    };

    document.querySelectorAll('iframe:not([src^="javascript:"])')?.forEach(function(el) {
        el.src = el.src;
    });
})();
