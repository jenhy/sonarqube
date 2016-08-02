/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
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
package org.sonar.server.qualitygate.ws;

import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.WebService;
import org.sonar.api.utils.text.JsonWriter;
import org.sonar.db.qualitygate.QualityGateConditionDto;
import org.sonar.db.qualitygate.QualityGateDto;
import org.sonar.server.exceptions.BadRequestException;
import org.sonarqube.ws.client.qualitygate.QualityGatesWsParameters;

public class QualityGatesWs implements WebService {
  private final QualityGatesWsAction[] actions;

  public QualityGatesWs(QualityGatesWsAction... actions) {
    this.actions = actions;
  }

  @Override
  public void define(Context context) {
    NewController controller = context.createController("api/qualitygates")
      .setSince("4.3")
      .setDescription("Manage quality gates, including conditions and project association.");

    for (QualityGatesWsAction action : actions) {
      action.define(controller);
    }

    controller.done();
  }

  static void addConditionParams(NewAction action) {
    action
      .createParam(QualityGatesWsParameters.PARAM_METRIC)
      .setDescription("Condition metric")
      .setRequired(true)
      .setExampleValue("blocker_violations");

    action.createParam(QualityGatesWsParameters.PARAM_OPERATOR)
      .setDescription("Condition operator:<br/>" +
        "<ul>" +
        "<li>EQ = equals</li>" +
        "<li>NE = is not</li>" +
        "<li>LT = is lower than</li>" +
        "<li>GT = is greater than</li>" +
        "</ui>")
      .setExampleValue(QualityGateConditionDto.OPERATOR_EQUALS)
      .setPossibleValues(QualityGateConditionDto.ALL_OPERATORS);

    action.createParam(QualityGatesWsParameters.PARAM_PERIOD)
      .setDescription("Condition period. If not set, the absolute value is considered.")
      .setPossibleValues("1");

    action.createParam(QualityGatesWsParameters.PARAM_WARNING)
      .setDescription("Condition warning threshold")
      .setExampleValue("5");

    action.createParam(QualityGatesWsParameters.PARAM_ERROR)
      .setDescription("Condition error threshold")
      .setExampleValue("10");
  }

  static Long parseId(Request request, String paramName) {
    try {
      return Long.valueOf(request.mandatoryParam(paramName));
    } catch (NumberFormatException badFormat) {
      throw new BadRequestException(paramName + " must be a valid long value");
    }
  }

  static JsonWriter writeQualityGate(QualityGateDto qualityGate, JsonWriter writer) {
    return writer.beginObject()
      .prop(QualityGatesWsParameters.PARAM_ID, qualityGate.getId())
      .prop(QualityGatesWsParameters.PARAM_NAME, qualityGate.getName())
      .endObject();
  }

  static JsonWriter writeQualityGateCondition(QualityGateConditionDto condition, JsonWriter writer) {
    writer.beginObject()
      .prop(QualityGatesWsParameters.PARAM_ID, condition.getId())
      .prop(QualityGatesWsParameters.PARAM_METRIC, condition.getMetricKey())
      .prop(QualityGatesWsParameters.PARAM_OPERATOR, condition.getOperator());
    if (condition.getWarningThreshold() != null) {
      writer.prop(QualityGatesWsParameters.PARAM_WARNING, condition.getWarningThreshold());
    }
    if (condition.getErrorThreshold() != null) {
      writer.prop(QualityGatesWsParameters.PARAM_ERROR, condition.getErrorThreshold());
    }
    if (condition.getPeriod() != null) {
      writer.prop(QualityGatesWsParameters.PARAM_PERIOD, condition.getPeriod());
    }
    writer.endObject();
    return writer;
  }

}