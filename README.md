# Sajari Drupal

A library to integrate Sajari React SDK components with Drupal:
* Tabs
* Filters
* Facets
* Range Slider
* Sort Select
* Result
* Pager

This library is the frontend JS that is consumed by the module:
https://www.drupal.org/project/sajari

## Usage

1. Include `dist/bundle.js`
2. Create a `SajariDrupal` object with:

```javascript
SajariDrupal.init(config, id);
```

**config:** An object literal of configuration values. See [#configuration](Configuration).
**id:** The ID of the div to put the search block in. Without the hash.

## Configuration

```javascript
var config = {
  // General.
  project: "12345678910",
  collection: "example-collection",
  pipeline: "website",
  // Results.
  fields: [
    "title",
    "description",
    "url",
    "image"
  ],
  resultsPerPage: 10,
  // Pager.
  pager: true,
  // Tracking.
  tracking: true,
  // Query.
  maxSuggestions: 6,
  inputPlaceholder: "Enter your search term",
  param: "search",
  // Filter. Multiple filters look like:
  // "((domain="one.example.com")) AND ((product='clothing'))"
  filter: 'type="article"',
  // Tabs.
  allTabLabel: "All",
  defaultTab: "All",
  // Note: Lowercase tab machine names currently cause a bad response:
  // "Search request failed due to a configuration error."
  tabsEnabled: true,
  tabs: [
    {
      name: "One",
      title: "One",
      filter: "domain='one.example.com'"
    },
    {
      name: "Two",
      title: "Two",
      filter: "domain='two.example.com'"
    }
  ],
  // Facets.
  facetsEnabled: true,
  facets: [
    {
      name: "type",
      title: "Type"
    },
    {
      name: "topic",
      title: "Topic"
    }
  ],
  // Ranges.
  rangesEnabled: true,
  ranges: [
    {
      name: "popularityScore",
      title: "Popularity",
      totalRange: [0, 100],
      defaultRange: [0, 80],
      step: 1
    }
  ],
  // Sort.
  sortsEnabled: false,
  sortsDefault: "Relevancy",
  sorts: [
    {
      name: "published_time",
      title: "Newest",
      descending: true,
    },
    {
      name: "published_time",
      title: "Oldest",
      descending: false,
    },
    {
      name: "popularityScore",
      title: "Best",
      descending: true,
    },
    {
      name: "popularityScore",
      title: "Worst",
      descending: false,
    }
  ],
  // Result template. Available variables configured via "fields" above.
  templateEnabled: true,
  template:
    '<h3>{{title}}</h3>' +
    '<a class="button" href="{{url}}">Read more...</a>'
};
```

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
