# Sajari Drupal

A library to integrate Sajari React SDK components with Drupal:
* Tabs
* Filters
* Facets
* Range Slider
* Pager

This library is the frontend JS that is consumed by the module:
https://www.drupal.org/project/sajari

## Usage

1. Include `dist/bundle.js`
2. Create a `SajariDrupal` object with:

```javascript
SajariDrupal.init(config, id);
```

**config:** An object literal of configuration values. See example/index.html
**id:** The ID of the div to put the search block in. Without the hash.

## Local setup

```
npm ci
```

## Development

```
npm run start
```

## Deployment

```
npm run build
```

## API

See the Sajari React SDK which this library integrates:
https://sajari-sdk-react.netlify.app/
