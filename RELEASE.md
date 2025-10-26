# Release Process

This document outlines the process for releasing a new version of this package to npm.

## Overview

The release process is automated via GitHub Actions. When you push a version tag, the CI/CD pipeline will:

* Run all checks (lint, format, tests)
* Build the package (dist files and type definitions)
* Publish to npm with trusted publishing (OIDC)
* Deploy documentation to GitHub Pages
* Create a GitHub Release with installation instructions

## Prerequisites

Before your first release, ensure you have:

1. Configured npm Trusted Publisher on [npmjs.com](https://www.npmjs.com/package/@timohausmann/quadtree-ts/access):
   * Provider: GitHub
   * Repository: `timohausmann/quadtree-ts`
   * Workflow: `release.yml`
   * Environment: `npm-publish`

2. Created the `npm-publish` environment on GitHub:
   * Go to Settings → Environments → New environment
   * Name: `npm-publish`
   * (Optional) Add yourself as required reviewer

3. Configured GitHub Pages:
   * Go to Settings → Pages
   * Source: Deploy from a branch
   * Branch: `gh-pages` / (root)

## Releasing a New Version

### Step 1: Update the Version

Use npm's built-in versioning:

```bash
# For bug fixes (2.2.2 → 2.2.3)
npm version patch

# For new features (2.2.2 → 2.3.0)
npm version minor

# For breaking changes (2.2.2 → 3.0.0)
npm version major
```

This command will:
* Update version in `package.json` and `package-lock.json`
* Create a git commit with the new version
* Create a git tag (e.g., `v2.2.3`)

### Step 2: Update the Changelog

Edit `CHANGELOG.md` to document the changes in this release:

```bash
vim CHANGELOG.md
git add CHANGELOG.md
git commit -m "docs: update changelog for v2.2.3"
```

### Step 3: Push the Tag

Push both the commits and the tag to GitHub:

```bash
git push && git push --tags
```

### Step 4: Monitor the Release

The GitHub Actions workflow will automatically start. 

If all checks pass, the package will be published to npm and a GitHub Release will be created.

## Verification

After the release completes, verify:

* **npm**: Check [npmjs.com](https://www.npmjs.com/package/@timohausmann/quadtree-ts) for the new version
* **CDN**: Verify the files are available on [unpkg](https://unpkg.com/@timohausmann/quadtree-ts@latest/) or [jsDelivr](https://www.jsdelivr.com/package/npm/@timohausmann/quadtree-ts)
* **GitHub Release**: Check the [releases page](https://github.com/timohausmann/quadtree-ts/releases) for the new release
* **Documentation**: Visit [GitHub Pages](https://timohausmann.github.io/quadtree-ts/) to ensure docs were updated

## Rollback

If you need to unpublish a version (within 72 hours of publishing):

```bash
npm unpublish @timohausmann/quadtree-ts@2.2.3
```

Note: npm strongly discourages unpublishing. Consider publishing a patch version instead.
