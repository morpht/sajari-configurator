# Sajari Configurator

Access the Sajari React SDK via a simple Javascript API.

Supports:
* Tabs
* Filters
* Facets
* Range Slider
* Sort Select
* Result
* Pager

Projects using this API:
* https://www.drupal.org/project/sajari

This library is not endorsed or supported by Sajari.

## Usage

1. Include `dist/bundle.js`
2. Create a `SajariConfigurator` object with:

```javascript
SajariConfigurator.init(config, id);
```

**Parameters:**
* `config` - An object literal of configuration values. See [#configuration](Configuration).
* `id` - The ID of the div to put the search block in. Without the hash.

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

  // Summary.
  summaryEnabled: true,

  // Pager.
  pager: true,

  // Tracking.
  // See: https://www.sajari.com/docs/user-guide/analytics/click-tracking/
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
      min: 0,
      max: 100,
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

  // Results callback. (Use a custom template)
  // Delete to use default Sajari result template.
  // @param results - An array of results. Each result contains variables:
  // - title
  // - description
  // - url
  // - image
  // @return A string of HTML.
  resultsCallback: function(results) {
    // Example only. Replace with your own rendering logic.
    var html = "<ul>";
    results.forEach(function(result) {
      html += "<li>" + result.title + "</li>";
    });
    html += "</ul>"
    return html;
  }
};
```

## Example CSS

Almost no styling is included by default. You should add your own:

```css
.sc {
  font-family: "Arial";
}

.sj-tabs {
  margin-top: 1rem;
}

.sc__sort {
  padding: 0.5rem 1rem;
}

.sc__facet ul {
  list-style: none;
  padding-left: 0;
}

@media only screen and (min-width: 800px) {

  .sc__controls {
    width: 200px;
    padding: 1rem;
    background: #EFEFEF;
    float: left;
  }

  .sc__content {
    overflow: auto;
    padding-left: 1rem;
  }

}
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
