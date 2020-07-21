import React, { Component } from "react";
import { render } from "react-dom";
import { hot } from "react-hot-loader";

import {
  // Controllers.
  Pipeline,
  Values,
  // Components.
  Provider,
  Search,
  Response,
  Input,
  Results,
  Result,
  Summary,
  Paginator,
  // Filters.
  Filter,
  FilterProvider,
  CombineFilters,
  // Tabs
  Tabs,
  // Facets.
  Checkbox,
  CountAggregateFilter,
  // Ranges.
  RangeFilter,
  RangeSlider,
  // Events.
  EVENT_SELECTION_UPDATED,
  EVENT_RESPONSE_UPDATED,
  // Analytics.
  NoTracking,
  ClickTracking
} from "@sajari/sdk-react";

import CustomResults from "./CustomResults.jsx";
import Handlebars from "handlebars";

class SearchBlock extends Component {

  constructor(props) {
    super(props);

    ////
    // CONFIG.
    ////

    this.searchConfig = {
      maxSuggestions: this.props.config.maxSuggestions,
      pageParam: "page",
      qOverrideParam: "q.override",
      qSuggestionsParam: "q.suggestions",
      resultsPerPageParam: "resultsPerPage"
    }

    ////
    // STATE.
    ////

    this.state = {
      counts: [],
      oldCounts: ''
    };

    ////
    // CONTROLLERS.
    ////

    var tracking = new NoTracking();
    if (this.props.config.trackingEnabled != undefined && this.props.config.trackingEnabled) {
      tracking = new ClickTracking();
    }

    this.pipeline = new Pipeline(
      {
        project: this.props.config.project,
        collection: this.props.config.collection
      },
      this.props.config.pipeline,
      tracking
    );

    // Represent user input.
    this.values = new Values();

    // Configure settings via values controller.
    this.values.set({ resultsPerPage: () => this.props.config.resultsPerPage.toString() });
    if (this.props.config.fields != undefined) {
      this.values.set({ fields: this.props.config.fields });
    }

    ////
    // FILTERS.
    ////

    // Setup base filter.
    var baseFilter = new Filter({ All: "" }, ["All"]);
    if (this.props.config.filter != undefined) {
      baseFilter = new Filter({ All: this.props.config.filter }, ["All"]);
    }

    // Setup tab filter.
    if (this.props.config.tabs != undefined) {
      this.tabsFilterTabs = {};
      this.tabs = [];
      // Create tabs from config.
      this.props.config.tabs.forEach((tab) => {
        this.tabsFilterTabs[tab.title] = tab.filter;
        this.tabs.push({ name: tab.title, display: tab.title });
      });
      // Create tab filter.
      this.tabsFilter = [];
      if (this.props.config.defaultTab != undefined) {
        this.tabsFilter = new Filter(this.tabsFilterTabs, [this.props.config.defaultTab]);
      }
      else {
        this.tabsFilter = new Filter(this.tabsFilterTabs);
      }
    }

    // Request facet filters.
    this.facetFilters = [];
    if (this.props.config.facets != undefined) {
      for (var facet of this.props.config.facets) {
        this.facetFilters.push(new CountAggregateFilter(facet.name, this.pipeline, this.values));
      }
    }

    // Setup range filters.
    this.rangeFilters = [];
    if (this.props.config.ranges != undefined) {
      for (var range of this.props.config.ranges) {
        let rangeFilter = new RangeFilter(range.name, [range.min, range.max]);
        rangeFilter.set(range.min, range.max);
        this.rangeFilters.push(rangeFilter);
      }
    }

    // Combine filters.
    this.filters = CombineFilters([baseFilter, this.tabsFilter, ...this.facetFilters, ...this.rangeFilters]);

    // Apply filters to values controller.
    this.values.set({ filter: () => this.filters.filter() });

  }

  componentDidMount() {

    ////
    // LISTENERS.
    ////

    // Update search when query params in URL.
    const params = new URLSearchParams(location.search);
    const query = params.get(this.props.config.param);

    if (query) {
      this.values._emitUpdated();

      // Set value.
      this.values.set({"q": query});

      // Search pipeline.
      this.pipeline.search(this.values.get());
    }

    // Update search when filter changed.
    this.filters.listen(EVENT_SELECTION_UPDATED, () => {
      this.values._emitUpdated();

      // Validate that query is not empty.
      const query = this.values.get()["q"];
      if (query === undefined || query === "") {
        return;
      }

      // Search pipeline.
      this.pipeline.search(this.values.get());
    });

    // Handle responses.
    this.pipeline.listen(EVENT_RESPONSE_UPDATED, () => {

      // Handle when a bad query results in no response.
      if (this.pipeline.response.response == undefined) {
        console.log("EMPTY RESPONSE - Check query correct:");
        console.log(this.pipeline.response);
        return;
      }

      // Update facets.
      if (this.pipeline.response.response.get("aggregates")) {
        var counts = this.pipeline.response.response.get("aggregates");

        // Assert that response contains changed facets. (Not all responses are for facets)
        // Prevent infinite loop where setCounts() -> setState() triggers EVENT_RESPONSE_UPDATED.
        var newCounts = JSON.stringify(counts);
        if (newCounts != this.state.oldCounts) {
          // Update facets.
          this.setCounts(this.pipeline);
          // Store counts to keep track of changes.
          this.setState({oldCounts: newCounts});
        }
      }

      // Update URL when query changes.
      history.pushState({}, null, "?" + this.props.config.param + "=" + this.values.get()["q"]);
    });

  }

  setCounts(pipeline) {

    // Track the counts for selected facets.
    var counts = [];
    for (var [key, value] of Object.entries(this.facetFilters)) {
      counts[key] = value.getCounts();
    }
    this.setState({ counts: counts });

  }

  ////
  // UI.
  ////

  render() {

    var pipeline = this.pipeline;
    var values = this.values;
    var config = this.searchConfig;

    ////
    // TABS.
    ////

    let tabs;
    if (this.props.config.tabsEnabled != undefined && this.props.config.tabsEnabled) {
      // Create tabs from tabs filter.
      tabs = <Tabs filter={this.tabsFilter} tabs={this.tabs} />;
    }

    ////
    // FACETS.
    ////

    var Facets = (props) => {
      // Default facets to empty.
      if (this.props.config.facetsEnabled == undefined || !this.props.config.facetsEnabled) {
        return null;
      }
      // Ensure facet has results.
      if (props.counts == undefined || !props.counts.length) {
        return null;
      }
      // Show facets after search.
      return (
        <FilterProvider filter={props.filter}>
          <div className={"sc__facet sc__facet--" + props.name }>
            <h3 className={"sc__facet-title"}>{props.title}</h3>
            <ul>
              {Object.keys(props.counts).map((i) => {
                return (
                  <li key={"sc__facet-item sc__facet-item--" + props.counts[i].name}>
                    <Checkbox name={props.counts[i].name} />
                    <label>{props.counts[i].name} ({props.counts[i].count})</label>
                  </li>
                );
              })}
            </ul>
          </div>
        </FilterProvider>
      );
    };

    ////
    // RANGE SLIDER
    ////

    var Range = (props) => {
      // Hide range when no config.
      if (this.props.config.rangesEnabled == undefined || !this.props.config.rangesEnabled) {
        return null;
      }
      // UI.
      return (
        <div className={"sc__range sc__range--" + props.name}>
          <h3 className={"sj__range-title"}>{props.title}</h3>
          <RangeSlider
            filter={props.filter}
            step={props.step}
          />
        </div>
      );
    };

    var SortSelect = (props) => {
      // Hide sort when no config.
      if (this.props.config.sorts == undefined || !this.props.config.sortsEnabled) {
        return null;
      }
      // UI.
      return (
        <select
          className="sc__sort"
          onChange={event => {
            this.values.set(JSON.parse(event.target.value));
            this.pipeline.search(values.get());
           }}
         >
          <option value={JSON.stringify({ sort: "" })}>{this.props.config.sortsDefault}</option>
          {Object.keys(this.props.config.sorts).map((i) => {
            var option = this.props.config.sorts[i];
            var order = option.descending ? "-" : "";
            return (
              <option value={JSON.stringify({ sort: order + option.name })} key={"option-" + option.title}>{option.title}</option>
            )
          })}
        </select>
      );
    }

    ////
    // PAGER.
    ////

    let pager;
    if (this.props.config.pagerEnabled != undefined && this.props.config.pagerEnabled == true) {
      pager = <Paginator />;
    }

    let summary;
    if (this.props.config.summaryEnabled != undefined && this.props.config.summaryEnabled == true) {
      summary = <Summary />
    }

    ////
    // RESULTS TEMPLATE
    ////

    var results = <Results className="sc__results"/>
    if (this.props.config.resultsCallback != undefined) {
      var html = '';
      // 1. CustomResults calls processResults with results.
      // 2. processResults requests HTML from resultsCallback.
      // 3. processResults returns HTML to CustomResults.
      // 4. CustomResults renders the HTML.
      results = <CustomResults className="sc__results" processResults={(results) => {
        return this.props.config.resultsCallback(results);
      }} />;
    }

    ////
    // SEARCH BLOCK.
    ////

    return (
      // Provide state, send query and return response.
      <Provider search={{ pipeline, values, config }}>
        <div className={"sc"}>

          <div className="sc__search">
            <Input placeholder={this.props.config.inputPlaceholder} defaultValue={this.values.get()["q"]} />
          </div>

          {tabs}

          <div className="sc__controls">

            <SortSelect />

            <div className="sc__facets">
              {Object.keys(this.facetFilters).map((key) => {
                return(
                  <Facets
                    filter={this.facetFilters[key]}
                    counts={this.state.counts[key]}
                    title={this.props.config.facets[key].title}
                    name={this.props.config.facets[key].name}
                    key={"facet-" + key}
                  />
                );
              })}
            </div>

            <div className="sc__ranges">
              {Object.keys(this.rangeFilters).map((key) => {
                return(
                  <Range
                    brokenFilters={this.brokenFilters}
                    filter={this.rangeFilters[key]}
                    step={this.props.config.ranges[key].step}
                    title={this.props.config.ranges[key].title}
                    name={this.props.config.ranges[key].name}
                    key={"range-" + key}
                  />
                );
              })}
            </div>

          </div>

          <div className="sc__content">

            <Response>
              {summary}
              {results}
              {pager}
            </Response>

          </div>

        </div>
      </Provider>
    )
  }
}

export default hot(module)(SearchBlock);
