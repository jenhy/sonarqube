/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// @flow
import React from 'react';
import Helmet from 'react-helmet';
import Sidebar from '../sidebar/Sidebar';
import { parseQuery } from '../utils';
import { translate } from '../../../helpers/l10n';
import type { Component, MeasureEnhanced, Period, Query } from '../types';
import type { RawQuery } from '../../../helpers/query';
import type { Metrics } from '../../../store/metrics/actions';

type Props = {|
  component: Component,
  location: { pathname: string, query: RawQuery },
  fetchMeasures: (
    Component,
    Metrics
  ) => Promise<{ measures: Array<MeasureEnhanced>, periods: Array<Period> }>,
  fetchMetrics: () => void,
  metrics: Metrics,
  router: {
    push: ({ pathname: string, query?: RawQuery }) => void
  }
|};

type State = {|
  loading: boolean,
  measures: Array<MeasureEnhanced>,
  periods: Array<Period>,
  query: Query
|};

export default class App extends React.PureComponent {
  mounted: boolean;
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      measures: [],
      periods: [],
      query: parseQuery(props.location.query)
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.props.fetchMetrics();
    this.fetchMeasures(this.props);

    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.add('search-navigator-footer');
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.location.query !== this.props.location.query) {
      this.setState(parseQuery(nextProps.location.query));
    }
    if (
      nextProps.component.key !== this.props.component.key ||
      nextProps.metrics !== this.props.metrics
    ) {
      this.fetchMeasures(nextProps);
    }
  }

  fetchMeasures = ({ component, fetchMeasures, metrics }: Props) => {
    this.setState({ loading: true });
    fetchMeasures(component, metrics).then(({ measures, periods }) => {
      if (this.mounted) {
        this.setState({ loading: false, measures, periods });
      }
    });
  };

  render() {
    if (this.state.loading) {
      return <i className="spinner spinner-margin" />;
    }

    return (
      <div className="layout-page" id="component-measures">
        <Helmet title={translate('layout.measures')} />

        <div className="layout-page-side-outer">
          <div className="layout-page-side" style={{ top: 95 }}>
            <div className="layout-page-side-inner">
              <div className="layout-page-filters">
                <Sidebar measures={this.state.measures} query={this.state.query} />
              </div>
            </div>
          </div>
        </div>

        <div className="layout-page-main">
          <div className="layout-page-header-panel layout-page-main-header issues-main-header">
            <div className="layout-page-header-panel-inner layout-page-main-header-inner">
              <div className="layout-page-main-inner">Header</div>
            </div>
          </div>

          <div className="layout-page-main-inner">Main</div>
        </div>
      </div>
    );
  }
}
