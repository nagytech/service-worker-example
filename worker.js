var CACHE_NAME = 'my-cache-v5';

var cacheUrls = [
  '/sw/',
  '/sw/script.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(cacheUrls);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // TODO: Offline / Online??
    caches.match(event.request)
      .then(function(response) {
        /*
        if (response) {
          console.log('Cache hit: ', event.request);
          return response;
        }
        console.log('Cache not hit: ', event.request);
        */
        var fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
          function(response) {
            if (!response || response.status !== 200) {
              console.error('Bad response: ', response);
              return response;
            }
            var responseToCache = response.clone();
            console.log('Attempt to cache response from request: ', fetchRequest);
            caches.open(CACHE_NAME).then(
              function(cache) {
                cache.put(event.request, responseToCache);
              }
            );
            return response;
          }
        ).catch(function(err) {
          return response;
        });
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/*

UPGRADE TIPS

- Update your service worker JavaScript file.
- When the user navigates to your site, the browser tries to redownload the
script file that defined the service worker in the background. If there is even
a byte's difference in the service worker file compared to what it currently
has, it considers it 'new'.
- Your new service worker will be started and the install event will be fired.
- At this point the old service worker is still controlling the current pages so
the new service worker will enter a "waiting" state.
- When the currently open pages of your site are closed, the old service worker
will be killed and the new service worker will take control.
- Once your new service worker takes control, its activate event will be fired.

DEBUGGING TIPS

- If a worker registers, but then doesn't appear in
chrome://inspect/#service-workers or chrome://serviceworker-internals, it's
likely its failed to install due to an error being thrown, or a rejected promise
being passed to event.waitUntil.

- To work around this, go to chrome://serviceworker-internals and check "Opens
the DevTools window for service worker on start for debugging", and put a
debugger; statement at the start of your install event. This, along with "Pause
on uncaught exceptions", should reveal the issue.

STORAGE

To work around this, there's a proposed API, requestPersistent:

*/
