// ==UserScript==
// @name         Override links to always open in new tabs
// @version      2025-09-19
// @description  Override links target attribute based on whether they point to the same or external domain as the current page
// @match        http://*/*
// @match        https://*/*
// @downloadURL  https://github.com/natrim/userscripts/raw/main/override_links_to_blank.user.js
// @updateURL    https://github.com/natrim/userscripts/raw/main/override_links_to_blank.user.js
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	const key = '7AmphdEp2DIaZs7iI';
	if (window[key]) {
		return;
	}
	window[key] = true;

	const currentDomain = window.location.hostname;

	const observe = (fn, e = document.body, config = { childList: 1, subtree: 1 }) => {
		const observer = new MutationObserver(fn);
		observer.observe(e, config);
		return () => observer.disconnect();
	};

	let timer = 0;
	observe(() => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			document.querySelectorAll('a[href]').forEach(link => {
				const href = link.getAttribute('href');
				if (href.startsWith('#') || href.startsWith('javascript:')) {
					return;
				}
				const url = new URL(href, window.location.href);
				if (url.hostname === currentDomain) {
					link.setAttribute('target', '_self');
				} else {
					link.setAttribute('target', '_blank');
				}
			});
		}, 1);
	});

})();
