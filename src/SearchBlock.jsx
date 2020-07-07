import React, { Component } from "react";
import { render } from "react-dom";
import { hot } from "react-hot-loader";
import {
  Provider,
  Pipeline,
  Values,
  NoTracking,
  ClickTracking,
  Search,
  Response,
  Input,
  Results,
  Summary,
  Paginator,
  Filter,
  FilterProvider,
  CountAggregateFilter,
  Checkbox,
  CombineFilters,
  Tabs,
  EVENT_SELECTION_UPDATED,
  EVENT_RESPONSE_UPDATED
} from "@sajari/sdk-react";

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
      counts: []
    };

    ////
    // CONTROLLERS.
    ////

    // https://www.sajari.com/docs/user-guide/analytics/click-tracking/
    var tracking = new NoTracking();
    if (this.props.config.tracking) {
      tracking = new ClickTracking("url", this.props.config.qParam);
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
    this.tabsFilter = [];
    if (this.props.config.tabs != undefined) {
      // Create "All" tab.
      this.tabs = { All: "" };
      this.tabs_display = [{ name: "All", display: this.props.config.allTabLabel }];
      // Create tabs from config.
      this.props.config.tabs.forEach((tab) => {
        this.tabs[tab.name] = tab.filter;
        this.tabs_display.push({ name: tab.name, display: tab.title });
      });
      // Create tab filter.
      if (this.props.config.defaultTab != undefined) {
        this.tabsFilter = new Filter(this.tabs, [this.props.config.defaultTab]);
      }
      else {
        this.tabsFilter = new Filter(this.tabs, ["All"]);
      }
    }

    // Request facet filters.
    this.facetFilters = [];
    if (this.props.config.facets != undefined) {
      for (var facet of this.props.config.facets) {
        this.facetFilters.push(new CountAggregateFilter(facet.name, this.pipeline, this.values));
      }
    }

    // Combine filters.
    this.filters = CombineFilters([baseFilter, this.tabsFilter, ...this.facetFilters]);

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

    // Update facet when search response returned.
    this.pipeline.listen(EVENT_RESPONSE_UPDATED, () => {
      // Handle when a bad query results in no response.
      if (this.pipeline.response.response == undefined) {
        console.log("EMPTY RESPONSE - Check query correct:");
        console.log(this.pipeline.response);
        return;
      }
      // Set facets.
      if (this.pipeline.response.response.get("aggregates")) {
        this.setCounts(this.pipeline);
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
    if (this.props.config.tabs != undefined) {
      // Create tabs from tabs filter.
      tabs = <Tabs filter={this.tabsFilter} tabs={this.tabs_display} />;
    }

    ////
    // FACETS.
    ////

    var Facets = (props) => {
      // Default facets to empty.
      if (this.props.config.facets == undefined) {
        return null;
      }
      // Ensure facet has results.
      if (props.counts == undefined || !props.counts.length) {
        return null;
      }
      // Show facets after search.
      return(
        <FilterProvider filter={props.filter}>
          <div className={"sj-facet"}>
            <h3>{props.name}</h3>
            <ul>
              {Object.keys(props.counts).map((i) => {
                return(
                  <li key={props.counts[i].name}>
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
    // PAGER.
    ////

    let pager;
    if (this.props.config.pager) {
      pager = <Paginator />;
    }

    return(
      // Provide state, send query and return response.
      <Provider search={{ pipeline, values, config }}>
        <div className={"sj-block"}>
          <h1>Search Block</h1>
          <Input placeholder={this.props.config.inputPlaceholder} defaultValue={this.values.get()["q"]} />
          {tabs}
          {Object.keys(this.facetFilters).map((key) => {
            return(<Facets filter={this.facetFilters[key]} counts={this.state.counts[key]} key={key} name={this.props.config.facets[key].title} />);
          })}
          <Response>
            <Summary />
            <Results />
            {pager}
          </Response>
        </div>
      </Provider>
    )
  }
}

export default hot(module)(SearchBlock);
