import React, { Component } from "react";
import { hot } from "react-hot-loader";

import {
  Token,
  RequestError,
  TransportError
} from "@sajari/sdk-js";

import {
  i18n,
  Consumer,
  ContainerProps,
} from "@sajari/sdk-react";

const STATUS_UNAUTHORISED = 403;

export const CustomResultsContainer: React.SFC = ({children, fields}) => {
  return (
    <Consumer>
      {({ search: { response }, resultClicked }) => {

        // Handle response.
        if (response === null || response === undefined || response.isEmpty()) {
          return null;
        }
        if (response.isError()) {
          const err = response.getError();
          if (err.httpStatusCode === STATUS_UNAUTHORISED) {
            err.message = i18n.t("errors:authorization");
          }
          if (err.transportErrorCode === TransportError.Connection) {
            err.message = i18n.t("errors:connection");
          } else if (err.transportErrorCode === TransportError.ParseResponse) {
            err.message = i18n.t("errors:parseResponse");
          }
          return children({ error: err });
        }

        // Get results.
        const results = response !== undefined ? response.getResults() || [] : [];
        if (results.length < 1) {
          return children({ error: null, results: [] });
        }

        // Map results into key/value structure.
        const res: Array<{ key: string }> = results.map(
          (result: SDKResult, index: number) => {

            const key = (result.values._id) || (("" + index + result.values.url));

            let token: Token | undefined = result.token;
            if (Object.getOwnPropertyNames(token).length === 0) {
              token = undefined;
            }

            const values = {
              ...result.values,
              title: result.values[fields?.title ?? "title"],
              description: result.values[fields?.description ?? "description"],
              url: result.values[fields?.url ?? "url"],
              image: result.values[fields?.image ?? "image"]
            };

            return {
              key,
              resultClicked,
              token,
              values,
              indexScore: result.indexScore,
              score: result.score
            };
          }
        );

        return children({ error: null, results: res });
      }}
    </Consumer>
  );
};

class CustomResults extends React.Component {
  render() {

    var {
      fields,
      showImages,
      processResults
    } = this.props;

    return (
      <CustomResultsContainer fields={fields}>
        {({ error, results }) => {

          // Assert results valid.
          if (error) {
            return <div class="sj-error">{error.message}</div>;
          }
          if (results === undefined) {
            return null;
          }

          // Parse out result values.
          var result_values = [];
          results.map(({ key, ...result }) => {
            result_values.push(result.values);
          })

          // Merge results with template and set HTML.
          return results.length > 0 ? (
            <div className="sj-results" dangerouslySetInnerHTML={{ __html: processResults(result_values) }} />
          ) : null;
        }}
      </CustomResultsContainer>
    );
  }
}

export default hot(module)(CustomResults);
