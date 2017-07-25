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
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import App from './App';
import throwGlobalError from '../../../app/utils/throwGlobalError';
import { getComponent, getMetrics, getMetricByKey } from '../../../store/rootReducer';
import { fetchMetrics } from '../../../store/rootActions';
import { getMeasuresAndMeta } from '../../../api/measures';
import { getLeakPeriod } from '../../../helpers/periods';
import { getLeakValue } from '../utils';
import type { Component, MeasureEnhanced } from '../types';
import type { Metrics } from '../../../store/metrics/actions';

const mapStateToProps = (state, ownProps) => ({
  component: getComponent(state, ownProps.location.query.id),
  metrics: getMetrics(state)
});

const filterQualityGate = (component, measures) => {
  if (['VW', 'SVW'].includes(component.qualifier)) {
    return measures;
  }
  return measures.filter(measure => measure.metric !== 'alert_status');
};

const fetchMeasures = (component: Component, metrics: Metrics) => (
  dispatch,
  getState
): Promise<Array<MeasureEnhanced>> => {
  const metricKeys = metrics.filter(key => {
    const metric = getMetricByKey(getState(), key);
    return !metric.hidden && !['DATA', 'DISTRIB'].includes(metric.type);
  });

  if (metricKeys.length <= 0) {
    return Promise.resolve([]);
  }

  return getMeasuresAndMeta(component.key, metricKeys, { additionalFields: 'periods' }).then(
    r => ({
      measures: filterQualityGate(component, r.component.measures)
        .map(measure => {
          const metric = getMetricByKey(getState(), measure.metric);
          const leak = getLeakValue(measure);
          return { ...measure, metric, leak };
        })
        .filter(measure => {
          const hasValue = measure.value != null;
          const hasLeakValue = measure.leak != null && getLeakPeriod(r.periods) != null;
          return hasValue || hasLeakValue;
        }),
      periods: r.periods
    }),
    throwGlobalError
  );
};

const mapDispatchToProps = { fetchMeasures, fetchMetrics };

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
