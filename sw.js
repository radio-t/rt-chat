'use strict';

var PREFIX = 'rt-chat-';
var VERSION = 'v1.1.0';
var OFFLINE_CACHE = PREFIX + VERSION;
var OFFLINE_URL = '/offline/index.html';

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(OFFLINE_CACHE).then(function(cache) {
			return cache.addAll([
				OFFLINE_URL,
				'/app.css',
				'/app.js'
			]);
		})
	);
});

self.addEventListener('activate', function(event) {
	// Delete old asset caches.
	event.waitUntil(
		caches.keys().then(function(keys) {
			return Promise.all(
				keys.map(function(key) {
					if (
						key != OFFLINE_CACHE &&
						key.startsWith(PREFIX)
					) {
						return caches.delete(key);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', function(event) {
	if (
		event.request.mode == 'navigate' ||
		( // Fallback for Chromium 48 / Opera 35 and older:
			event.request.method == 'GET' &&
			event.request.headers.get('accept').includes('text/html')
		)
	) {
		event.respondWith(
			fetch(event.request).catch(function(exception) {
				// The `catch` is only triggered if `fetch()` throws an exception,
				// which most likely happens due to the server being unreachable.
				console.error(
					'Fetch failed; returning offline page instead.',
					exception
				);
				return caches.open(OFFLINE_CACHE).then(function(cache) {
					return cache.match(OFFLINE_URL);
				});
			})
		);
	} else {
		// It’s not a request for an HTML document, but rather for a CSS or SVG
		// file or whatever…
		if (event.request.url.indexOf(location.host) > -1) {
			event.respondWith(
				caches.match(event.request).then(function(response) {
					return response || fetch(event.request);
				})
			);
		}
	}
});