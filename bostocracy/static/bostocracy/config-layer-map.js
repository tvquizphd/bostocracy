import { Color } from "color";
import {
  get_map_fields, get_mbta_stops, get_server
} from "api";
import {
  to_mean_angle, to_xy_angle, to_line_degrees
} from "angles";

const to_map_config = async (get_xy) => {
  // https://api-v3.mbta.com/docs/swagger/
  const stop_map = await get_mbta_stops();
  const measurements = measure_stops(get_xy, stop_map);
  const { TOWN_ID, OWNER_TYPE } = await get_map_fields(
    'ma', "AGOL/OpenSpaceLevProt", 0, [
      "TOWN_ID", "OWNER_TYPE"
    ]
  );
  const water_names = [
    "Jamaica Pond", "Sargent Pond", "Chestnut Hill Reservoir",
    "Chandler Pond", "Back Bay", "Little Fresh Pond",
    "Fresh Pond", "Jerrys Pond", "Charles River"
  ];
  const bridge_types = [
    'Highway-pedestrian', 'Pedestrian-bicycle'
  ];
  const owner_types = [
    "Federal", "State", "County", "Municipal",
    "Public Non-Profit", "State-State Dispute",
    "State-Non-Profit Dispute",
    "State-Municipal Dispute"
  ].map(name => OWNER_TYPE[name]);
  // https://www.mattlag.com/hslab/
  const towns = {
    BOSTON: {
      color: new Color(146,136,153),
      id: TOWN_ID["City of Boston"]
    },
    BROOKLINE: {
      color: new Color(120,180,156),
      id: TOWN_ID["Town of Brookline"]
    },
    CAMBRIDGE: {
      color: new Color(195,144,171),
      id: TOWN_ID["City of Cambridge"]
    },
    SOMERVILLE: {
      color: new Color(187,181,102),
      id: TOWN_ID["City of Somerville"]
    }
  }
  const town_ids = Object.values(towns).map(({id}) => id);
  return {
    towns, town_ids, measurements, water_names,
    bridge_types, owner_types
  }
}

const measure_stops = (get_xy, stop_map) => {
  return new Map(stop_map.entries().map(
    ([id, info]) => {
      const colors = info.colors.sort().slice(0,2);
      const line_map = new Map(colors.map((color) => {
        const sep = String.fromCharCode(31);
        const stops = Object.keys(info.routes).filter(
          key => info.routes[key].color === color
        ).map(key => (
          info.routes[key].link.join(sep)
        ));
        const links = [...new Set(stops)].map(stop => (
          stop.split(sep)
        ));
        const links_nodes = links.map(link => (
          link.map(
            node => get_xy(stop_map.get(node))
          ).sort((a, b) => to_xy_angle(a, b) - to_xy_angle(b, a))
        ));
        const angles = links_nodes.map(link_nodes => {
          return to_xy_angle(...link_nodes)
        });
        const angle = to_mean_angle(angles);
        const degrees = to_line_degrees(
          angle, 20, 90
        );
        return [color, degrees];
      }));
      const measurements = line_map.entries().map(
        ([ color, degrees ]) => ({ color, degrees })
      )
      return [ id, [...measurements] ];
    })
  );
}

const wherein = (key, items, inverse=false) => {
  const quote = items.some(isNaN);
  const not = inverse ? ' not ' : ' ';
  const find = joined => `${key}${not}in (${joined})`;
  if (!quote) {
    return find(items.map(t=>`${t}`).join(','))
  }
  return find(items.map(t=>`'${t}'`).join(','))
}; 

const layer_mapper = (map) => (
  [zIndex, layer_map], [method, ...args]
) => {
  const [url_key, fn_key] = method.split('/');
  const server = get_server(url_key);
  const pane = `pane-${zIndex}`;
  map.createPane(pane);
  const layer = ({
    map: to_map_layer,
    feature: to_feature_layer
  })[fn_key](
    pane, zIndex, server, ...args
  );
  if (layer === null) {
    return layer_map;
  }
  layer.addTo(map)
  layer.remove()
  layer.addTo(map)
  return [ 
    zIndex + 1, new Map([
      ...layer_map.entries(), [zIndex, layer]
    ])
  ];
}

const to_map_layer = (
  pane, zIndex, server, endpoint, data=[0]
) => {
  const dynamic = data.some(isNaN);
  const root = `${server}/rest/services`
  const layer = L.esri.dynamicMapLayer({
    url: `${root}/${endpoint}/MapServer`,
    format: "png32", attribution: "",
    f: "image", pane, zIndex,
    ...{
      [ !dynamic ? 'layers' : 'dynamicLayers' ]: (
        !dynamic ? data : JSON.stringify(data)
      )
    },
  });
  return layer;
}

const to_feature_layer = (
  pane, zIndex, server, endpoint, data=[0], opts={}
) => {
  const {
    renderer, fields, where, style, pointToLayer
  } = opts;
  const {
    eachActiveFeature
  } = opts;
  const root = `${server}/rest/services`
  const dynamic = data.some(isNaN);
  if (dynamic || data.length !== 1) {
    return null;
  }
  const layer = L.esri.featureLayer({
    url: `${root}/${endpoint}/FeatureServer/${data[0]}`,
    attribution: "", pane, zIndex, renderer,
    fields, where, style, pointToLayer
  });
  return layer;
}

const to_boston_bounds = (wide) => {
  const nesw = (latitude,longitude) => ({
    north: latitude, east: longitude,
    south: latitude, west: longitude
  })
  const ashmont = nesw(42.25, NaN);
  const medford_tufts = nesw(42.4, NaN);
  const suffolk_downs = nesw(NaN, -71.00);
  const cleveland_circle = nesw(NaN, -71.15);
  if (wide) {
    const miles = 5;
    const d_lon = miles/51;
    const d_lat = miles/69;
    return [
      [
        ashmont.south - d_lat,
        cleveland_circle.west - d_lon
      ],
      [
        medford_tufts.north + d_lat,
        suffolk_downs.east + d_lon
      ]
    ]
  }
  return [
    [ashmont.south, cleveland_circle.west],
    [medford_tufts.north, suffolk_downs.east]
  ];
}

export {
  to_map_config, layer_mapper, wherein,
  to_boston_bounds
}
