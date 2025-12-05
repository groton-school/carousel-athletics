<!--- BEGIN HEADER -->
# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.4.3](https://github.com/groton-school/carousel-athletics/compare/v0.4.2...v0.4.3) (2025-12-05)


### Bug Fixes

* include opponents ([8f80bd3](https://github.com/groton-school/carousel-athletics/commit/8f80bd3f7927aa87990f6c6d7fde7d8b62fa08b9))

## [0.4.2](https://github.com/groton-school/carousel-athletics/compare/v0.4.1...v0.4.2) (2025-12-02)


### Bug Fixes

* limit to a single instance ([cd4984a](https://github.com/groton-school/carousel-athletics/commit/cd4984aab88af81f024f7f4549388e9477e8129c))

## [0.4.1](https://github.com/groton-school/carousel-athletics/compare/v0.4.0...v0.4.1) (2025-12-02)


### Bug Fixes

* allow zero-item ATOM feeds ([9276422](https://github.com/groton-school/carousel-athletics/commit/92764225034377a91b225419cf125e8d25c31330))
* restore units to relative date calculation ([117a5cb](https://github.com/groton-school/carousel-athletics/commit/117a5cb3cfd74246db8d48d9daf830a2ecaff3e1))

## [0.4.0](https://github.com/groton-school/carousel-athletics/compare/v0.3.0...v0.4.0) (2025-11-24)


### ⚠ BREAKING CHANGES

* rewrite as a Google Cloud Run Node.js app
* deploy to Google Cloud Run

### Features

* deploy to Google Cloud Run ([61a85c1](https://github.com/groton-school/carousel-athletics/commit/61a85c16b24e0aa524bf330a11916452022611f5))
* rewrite as a Google Cloud Run Node.js app ([607430f](https://github.com/groton-school/carousel-athletics/commit/607430f647bb71dea092400a975374065870a715))


### Bug Fixes

* include Bootstrap stylesheet ([4387085](https://github.com/groton-school/carousel-athletics/commit/4387085458da50b925bb70008bbd22e9e164938e))
* restore app_engine_apis ([238e05d](https://github.com/groton-school/carousel-athletics/commit/238e05df5c63ccb46e3e2f365c18685f982ca3bc))
* tolerate missing win_loss column ([80b076d](https://github.com/groton-school/carousel-athletics/commit/80b076d209e66601dbf68bed4e2ef0ef04b13a43))

## [0.3.0](https://github.com/groton-school/carousel-athletics/compare/v0.2.4...v0.3.0) (2025-08-01)

### Features

* Add favicon ([415dd6](https://github.com/groton-school/carousel-athletics/commit/415dd6b366b24abbadd93f02f66835e74287196e))
* Deploy PHP 8.3. runtime ([d71bba](https://github.com/groton-school/carousel-athletics/commit/d71bba1e2fbb5211ea6304f6b4141c68d101c1af))

### Bug Fixes

* Reduce Google App Engine resource consumption ([f02630](https://github.com/groton-school/carousel-athletics/commit/f02630ddc9e3093a2c513596d70873635784778e))
* Run all instances in same session to preserve token integrity ([a1b20a](https://github.com/groton-school/carousel-athletics/commit/a1b20a927961afed49aab438ef037ead815ea7af))


---

## [0.2.4](https://github.com/groton-school/carousel-athletics/compare/v0.2.3...v0.2.4) (2025-06-03)

### Bug Fixes

* Use a semaphore to avoid race condition when renewing access token [#25](https://github.com/groton-school/carousel-athletics/issues/25) ([fe6938](https://github.com/groton-school/carousel-athletics/commit/fe6938b9c664b9bc97715bb9e94b3af747a75a21))


---

## [0.2.3](https://github.com/groton-school/carousel-athletics/compare/v0.2.2...v0.2.3) (2024-08-22)

### Bug Fixes

- More cautiously get schedule data ([45741e6](https://github.com/groton-school/carousel-athletics/commit/45741e665c940387cd23090c2510e49b545252c7))
- Fix ready logic ([5dbed08](https://github.com/groton-school/carousel-athletics/commit/5dbed0879d58a746eb037450d3b7b839d7437390))
- fully init cli ([c8c396b](https://github.com/groton-school/carousel-athletics/commit/c8c396bf5b59efbc46c0f9f2cfd7c2c4a5cd7380))

---

## [0.2.2](https://github.com/groton-school/carousel-athletics/compare/v0.2.1...v0.2.2) (2024-04-08)

### Bug Fixes

- Let title override opponent list ([71228bf](https://github.com/groton-school/carousel-athletics/commit/71228bfff1379153c27878d48c1733c3ac76b534))

---

## [0.2.1](https://github.com/groton-school/carousel-athletics/compare/v0.2...v0.2.1) (2024-03-06)

### Bug Fixes

- there can be… only one! ([dc6dc54](https://github.com/groton-school/carousel-athletics/commit/dc6dc54d5fcfb735cf5295d85f315c5134e7690f))

---

## [0.2](https://github.com/groton-school/carousel-athletics/compare/v0.1...v0.2) (2024-03-03)

### Features

- shift to self-destroying secrets ([2760624](https://github.com/groton-school/carousel-athletics/commit/276062454e4d5df51bb907aebc6eb4d15602cb3c))

---

## [0.1](https://github.com/groton-school/carousel-athletics/compare/cf0dc04a3de0a99936bc76e2a3e2e4a6d3476de9...v0.1) (2024-02-07)

---
