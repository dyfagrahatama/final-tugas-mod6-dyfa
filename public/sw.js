const CACHE_NAME = "static-kel42-v1";
const urlsForCache = [
    '/static/*.js',
    '/static/*.js.map',
    '/static/*.ico',
    '/static/*.html',
    '/static/*.png',
    '/offline-fetch.json',
    '/offline.png'
];

const self = this;

// Install Service Worker
self.addEventListener('install',(event)=>{
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache)=>{
                console.log('servicer worker')
                return cache.addAll(urlsForCache);
            })
    );
})

// Activate the Service Worker
self.addEventListener('activate',(event)=>{
    event.waitUntil(
        caches.keys().then(function(cacheNames){
            return Promise.all(
                cacheNames.filter(function(cacheName){
                    return cacheName != CACHE_NAME
                }).map(function(cacheName){
                    return caches.delete(cacheName);
                })
            )
        })
    )
})


// event listener untuk service worker online
self.addEventListener('fetch',(event)=>{
    const request = event.request;
    const url = new URL(request.url);
    

    if(url.origin === location.origin){
        // untuk fetching static berbentuk aset
        event.respondWith(
            caches.match(request)
                .then((response)=>{    
                    return response || fetch(request);
                })
        )
    }else{
        // untuk fetching data dari api
        event.respondWith(
            caches.open('modul6-pwa2-cache')
                .then(function(cache){
                    return fetch(request).then(function(liveResponse){
                        cache.put(request, liveResponse.clone())
                        return liveResponse;
                    })
                    .catch(function(){
                        return caches.match(request)
                            .then(function(response){  
                                return response || caches.match('/offline-fetched.json')
                            })
                    });
                })
        )
    }
})
