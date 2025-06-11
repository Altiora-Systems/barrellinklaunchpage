/* ===========================
   SERVICE WORKER
   =========================== */

/**
 * BarrelLink Service Worker
 * Provides offline capabilities and caching for the website
 */

const CACHE_NAME = 'barrellink-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/how-it-works.html',
  '/css/common.css',
  '/css/index.css',
  '/css/how-it-works.css',
  '/js/core.js',
  '/js/landing.js',
  '/js/how-it-works.js',
  '/assets/images/Barrel Link_Tagline.png',
  '/assets/images/Barrel Link_No Tagline.png',
  '/assets/images/hero-hand-phone_2.png',
  '/assets/images/step1-create.png',
  '/assets/images/step2-choose.png',
  '/assets/images/step3-schedule.png',
  '/assets/images/step4-track.png',
  '/assets/illustrations/waves_2.png',
  '/assets/illustrations/waves.svg',
  '/assets/icons/faviconBL.ico',
  '/assets/icons/apple-touch-iconBL.png'
];

// Install event - cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Precaching failed:', error);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Take control of clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request as it can only be used once
        const fetchRequest = event.request.clone();
        
        // Return the network response
        return fetch(fetchRequest).then(response => {
          // Check for valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response as it can only be used once
          const responseToCache = response.clone();
          
          // Add to cache for future use
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(error => {
          // Provide a fallback for navigation requests when offline
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          console.error('Fetch failed:', error);
        });
      })
  );
});
