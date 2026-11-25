// ==UserScript==
// @name         Google SignIn Popup Blocker
// @version      2026-11-20
// @description  Disables Google One Tap and blocks (DOM) popup. If popup persists, disable FedCM in your browser.
// @match        http://*/*
// @match        https://*/*
// @downloadURL  https://github.com/natrim/userscripts/raw/main/disable_google_login.user.js
// @updateURL    https://github.com/natrim/userscripts/raw/main/disable_google_login.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {

    if (window.googleLoginGoner) return;
    window.googleLoginGoner = true;

    'use strict';
    const BLOCKED_SCRIPT_URLS = [
        'accounts.google.com/gsi/client',
        'accounts.google.com/gsi/intermediate',
        'accounts.google.com/gsi/intermediatesupport'
    ];

    // 1. Block Google One Tap scripts from loading
    document.addEventListener('beforescriptexecute', e => {
        if (BLOCKED_SCRIPT_URLS.some(url => e.target.src.includes(url))) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    // 2. Target multiple container elements
    function disableContainers() {
        const containers = [
            'g_id_onload', // Standard container
            'g_id_intermediate_iframe', // Iframe container
            'credential_picker_container' // Dynamic container[6]
        ];

        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.setAttribute('data-auto_prompt', 'false');
                el.remove(); // Remove container entirely
            }
        });
    }

    // 3. Periodically check for new containers
    const observer = new MutationObserver(disableContainers);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: false
    });

    // Initial cleanup
    disableContainers();
    setInterval(disableContainers, 30000);
})();
