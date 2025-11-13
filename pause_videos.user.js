// ==UserScript==
// @name         Pause videos on page load
// @version      2025-11-12
// @description  new version prevents all html5 videos to play by itself before first user click on page
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
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const win = this instanceof Window ? this : window;
    const hkey_script = 'fasjVdeionhStop2';
    if (win[hkey_script]) return; // dont run if already loaded
    win[hkey_script] = true;

    // variables
    let whitelistSource = {}; // keep clicked videos already playing
    let userLastTouch = 0; // when user last touched page?
    let userLastLoc = ""; // on what page did user last touch page?

    // user touching the page check start
    const touchNow = () => {
        //console.log("user!");
        userLastTouch = Date.now();
        userLastLoc = window.location.href;
    };
    const isUserTouching = () => {
        //console.log(Date.now(), userLastTouch, Date.now() - userLastTouch);
        return userLastTouch && (Date.now() - userLastTouch <= 1000) && (userLastLoc === window.location.href);
    };

    const observer = () => {
        document.body.addEventListener('mousedown', touchNow);
        document.body.addEventListener('touchstart', touchNow);
        document.body.addEventListener('keydown', touchNow);
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", observer);
    } else {
        observer();
    }
    // end of checks

    // hard stop first
    const stoper = () => {
        document.querySelectorAll('video')?.forEach(function(video) {
            video.removeAttribute('autoplay');
            video.pause();
        });
        document.querySelectorAll('iframe:not([src^="javascript:"])')?.forEach(function(iframe) {
            iframe.src = iframe.src;
        });
        win?.navigation?.addEventListener('navigate', () => {
            whitelistSource = {};
        });
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", stoper);
    } else {
        stoper();
    }

    // override the play method to stop all videos to play before user clicks on page
    const allowedToPlayNow = {};
    const vel = document.createElement('video');
    const vproto = Object.getPrototypeOf(vel);
    vproto._play = vproto.play;
    vproto.play = async function() {
        //console.log("play?");
        let key = this.currentSrc || this.src || `${win.location.pathname}#${this.id}` || false;
        if (!key) {
            return Promise.reject();
        }
        if (!whitelistSource[key] && !isUserTouching()) {
            return Promise.reject();
        }
        whitelistSource[key] = true;
        //console.log("whitelisted", key);
        return this._play();
    };
})();
