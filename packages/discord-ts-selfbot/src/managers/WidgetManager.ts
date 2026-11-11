import BaseManager from './BaseManager';
import _errorsModule from '../errors';

const { TypeError } = _errorsModule;
import type {
  RawDeveloperWidgetConfigsData,
  RawFeaturedWidgetConfigsData,
  RawGameWidgetData,
  RawProfileWidgetsData,
  RawSuggestedWidgetGamesData,
  RawWidgetLayoutDefinitionsData,
} from '../../typings/rawDataTypes';

class WidgetManager extends BaseManager {
  async setProfileWidgets(
    widgets: RawGameWidgetData[]
  ): Promise<RawProfileWidgetsData> {
    if (!Array.isArray(widgets)) {
      throw new TypeError(
        'INVALID_TYPE',
        'widgets',
        'Array<RawGameWidgetData>'
      );
    }

    const seen = new Set<string>();
    const data = widgets.map((widget) => {
      if (!widget?.data || typeof widget.data.type !== 'string') {
        throw new TypeError('INVALID_TYPE', 'widget.data.type', 'string');
      }
      if (seen.has(widget.data.type)) {
        throw new RangeError(
          `Duplicate profile widget type: ${widget.data.type}`
        );
      }
      seen.add(widget.data.type);
      return {
        ...(widget.id ? { id: widget.id } : {}),
        data: widget.data,
      };
    });

    return this.client.api.users['@me'].widgets.put<RawProfileWidgetsData>({
      data: { widgets: data },
    });
  }

  fetchSuggestedGames(): Promise<RawSuggestedWidgetGamesData> {
    return this.client.api.users['@me'].widgets[
      'suggested-games'
    ].get<RawSuggestedWidgetGamesData>();
  }

  fetchFeaturedConfigs(): Promise<RawFeaturedWidgetConfigsData> {
    return this.client.api[
      'widget-configs'
    ].featured.get<RawFeaturedWidgetConfigsData>();
  }

  fetchDeveloperConfigs(): Promise<RawDeveloperWidgetConfigsData> {
    return this.client.api[
      'widget-configs'
    ].developer.get<RawDeveloperWidgetConfigsData>();
  }

  fetchLayoutDefinitions(): Promise<RawWidgetLayoutDefinitionsData> {
    return this.client.api['widget-configs'][
      'layout-definitions'
    ].get<RawWidgetLayoutDefinitionsData>();
  }
}

export default WidgetManager;
export { WidgetManager };
