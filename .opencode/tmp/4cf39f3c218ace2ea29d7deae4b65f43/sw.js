import {clientsClaim as workbox_core_clientsClaim} from 'D:/Coding Folder/dailystack/dailystack-frontend/node_modules/workbox-core/clientsClaim.mjs';
import {precacheAndRoute as workbox_precaching_precacheAndRoute} from 'D:/Coding Folder/dailystack/dailystack-frontend/node_modules/workbox-precaching/precacheAndRoute.mjs';
import {cleanupOutdatedCaches as workbox_precaching_cleanupOutdatedCaches} from 'D:/Coding Folder/dailystack/dailystack-frontend/node_modules/workbox-precaching/cleanupOutdatedCaches.mjs';
import {registerRoute as workbox_routing_registerRoute} from 'D:/Coding Folder/dailystack/dailystack-frontend/node_modules/workbox-routing/registerRoute.mjs';
import {NavigationRoute as workbox_routing_NavigationRoute} from 'D:/Coding Folder/dailystack/dailystack-frontend/node_modules/workbox-routing/NavigationRoute.mjs';
import {createHandlerBoundToURL as workbox_precaching_createHandlerBoundToURL} from 'D:/Coding Folder/dailystack/dailystack-frontend/node_modules/workbox-precaching/createHandlerBoundToURL.mjs';/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */




self.skipWaiting();
workbox_core_clientsClaim();
/**
 * The precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
workbox_precaching_precacheAndRoute([
  {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  },
  {
    "url": "index.html",
    "revision": "386f22fd15e4d285c6a02a4b81e7405b"
  },
  {
    "url": "assets/index-ocrF-fug.js",
    "revision": null
  },
  {
    "url": "assets/index-CDAHge-V.css",
    "revision": null
  },
  {
    "url": "assets/logos/pwa-192x192.png",
    "revision": "e4f1ac8713cd7b8f6ef29eebbe876060"
  },
  {
    "url": "assets/logos/pwa-512x512.png",
    "revision": "7b1c2a9db722c364cd32b0f283836e4a"
  },
  {
    "url": "manifest.webmanifest",
    "revision": "89f321fb88bc8987095f0f338f532f78"
  }
], {});
workbox_precaching_cleanupOutdatedCaches();workbox_routing_registerRoute(new workbox_routing_NavigationRoute(workbox_precaching_createHandlerBoundToURL("index.html")));


