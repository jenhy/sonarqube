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
import DomainFacet from './DomainFacet';
import { groupByDomains } from '../utils';
import type { MeasureEnhanced, Query } from '../types';

type Props = {|
  measures: Array<MeasureEnhanced>,
  query: Query
|};

type State = {|
  measuresByDomains: Array<{ name: string, measures: Array<MeasureEnhanced> }>
|};

export default class Sidebar extends React.PureComponent {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      measuresByDomains: groupByDomains(props.measures)
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.measures !== this.props.measures) {
      this.setState({ measuresByDomains: groupByDomains(nextProps.measures) });
    }
  }

  render() {
    const { measuresByDomains } = this.state;
    return (
      <div className="search-navigator-facets-list">
        {measuresByDomains.map(domain => <DomainFacet key={domain.name} domain={domain} />)}
      </div>
    );
  }
}
