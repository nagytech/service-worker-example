var app = function() {
  fetch('https://api.github.com/zen')
    .then(function(r) {
      return r.text();
    })
    .then(data => console.log(data))
    .catch(err => console.error(err));
}

var init = function() {
  if (!('serviceWorker' in navigator)) {
    console.error('ServiceWorker not supported.  Offline mode cannot continue.');
    return;
  }
  navigator.serviceWorker
    .register('worker.js') // Lazy load
    .then(function(rego) {
        console.info('ServiceWorker registration successful with scope: ', rego.scope);
        app();
    })
    .catch(function(err) {
      console.error('ServiceWorker registration failed: ', err)
    });
}

init();
