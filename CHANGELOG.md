# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.1] - 2023-11-15

### Changed

* Version bump for npm release

## [2.2.0] - 2023-11-07

### Added
* Added `Quadtree.update()` – Update an object already in the tree (shorthand for remove and insert).
* Added basic tests for update
* Added example for update 

## [2.1.0] - 2023-11-07

### Added
* Added `Quadtree.remove()` – based on [jonit-dev](https://github.com/jonit-dev)'s fork ([#1](https://github.com/timohausmann/quadtree-ts/issues/1)) – remove single objects from the tree. 
* Added `Quadtree.join()` – The opposite of a split(): try to merge subnodes into this main node.
* Added "remove" buttons to simple example
* Added tests for remove and join
* Added tests for default objects and nodes property

### Changed
* Rollup copies the browser build into /docs/examples/assets
* Examples load this local copy instead of the CDN url

## [2.0.1] - 2023-11-06

### Changed
* added "exports.type" to package.json to fix a Webpack issue ([#9](https://github.com/timohausmann/quadtree-ts/issues/9))

## [2.0.0] - 2023-11-05

### Changed
* merged PR: Performance improvement of `retrieve()` (was O(n^2), now O(n)) ([#8](https://github.com/timohausmann/quadtree-ts/pull/8))

## [2.0.0-beta.3] - 2023-11-05

### Added
* added "exports" to package.json to fix a Webpack issue ([#6](https://github.com/timohausmann/quadtree-ts/issues/6))

## [2.0.0-beta.2] - 2022-04-15

### Changed
* merged PR: retrieve flexibility ([#3](https://github.com/timohausmann/quadtree-ts/pull/3))

## [2.0.0-beta.1] - 2022-02-19
### Added
* Added classes for Rectangle, Circle, Line
* Added dedicated bundle files for CJS, EMS and UMD
* Added Unit Tests with Jest
* Added ESLint
* Added Rollup
* Added API docs with Typedoc
* Added new examples

### Changed
* Refactored Codebase to ES6 and Typescript