'use strict';

var PREFIX = 'rt-chat-';
var VERSION = 'v1.0.2';
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
		console.log('Handling fetch event for', event.request.url);
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
	}
});