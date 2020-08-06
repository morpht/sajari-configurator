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
  pagerEnabled: true,

  // Tracking.
  // See: https://www.sajari.com/docs/user-guide/analytics/click-tracking/
  trackingEnabled: true,

  // Query.
  searchboxEnabled: true,
  queryWhenEmpty: false,
  inputPlaceholder: "Enter your search term",
  param: "search",
  maxSuggestions: 5,

  // Filter. Multiple filters look like:
  // "((domain="one.example.com")) AND ((product='clothing'))"
  filter: 'type="article"',

  // Tabs.
  tabsEnabled: true,
  tabsDefault: "All",
  tabs: [
    {
      title: "All",
      filter: '',
    },
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

  // Sort. Use "name" as the "sortsDefault" value.
  sortsEnabled: false,
  sortsDefault: "",
  sorts: [
    {
      name: "",
      title: "Relevancy"
    },
    {
      name: "-published_time",
      title: "Newest"
    },
    {
      name: "published_time",
      title: "Oldest"
    },
    {
      name: "-popularityScore",
      title: "Best"
    },
    {
      name: "popularityScore",
      title: "Worst"
    }
  ],

  // Results callback. (Use a custom template)
  // Delete callback to use Sajari's default <Result> component.
  // @param results - An array of results. A result contains configured "fields".
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
