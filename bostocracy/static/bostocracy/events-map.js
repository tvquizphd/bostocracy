import "L";
import "esri-leaflet";
import {
  get_mbta_stops, get_map_fields, get_server
} from "api";
import {
  to_mean_angle, to_xy_angle, to_line_degrees
} from "angles";
import StyleLeaflet from "style-leaflet" with { type: "css" };
import StyleEventsMap from "style-events-map" with { type: "css" };

class Color {

  constructor(r,g,b,a=255) {
    this.rgba = [r,g,b,a];
    this.rgb = [r,g,b];
  }

  get hex() {
    const [r, g, b] = this.rgb
    const hex_int = (
      1 << 24 | r << 16 | g << 8 | b
    );
    return hex_int.toString(16).slice(1).toUpperCase();
  }

}

class EventsMap extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [
      StyleEventsMap, StyleLeaflet
    ];
  }

  async connectedCallback() {
    await this.render();
  }

  async render() {
    this.shadowRoot.innerHTML = "";
    const template = document.getElementById("events-map-view");
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    // https://developers.arcgis.com/esri-leaflet/
    const map = L.map(this.shadowRoot.getElementById("map"), {
      zoomControl: false, attributionControl: false
    });
    ;
    map.fitBounds(to_boston_bounds(false));
    map.setMaxBounds(to_boston_bounds(true));
    map.setMinZoom(12);
    map.setZoom(12);
    // https://api-v3.mbta.com/docs/swagger/
    const stop_map = await get_mbta_stops();
    const measurements = measure_stops(map, stop_map);
    const towns =  [
      "BOSTON", "BROOKLINE", "CAMBRIDGE", "SOMERVILLE"
    ];
    const water_names = [
      "Jamaica Pond", "Sargent Pond", "Chestnut Hill Reservoir",
      "Chandler Pond", "Back Bay", "Little Fresh Pond",
      "Fresh Pond", "Jerrys Pond", "Charles River"
    ];
    const bridge_types = [
      'Highway-pedestrian', 'Pedestrian-bicycle'
    ];
    const { TOWN_ID, OWNER_TYPE } = await get_map_fields(
      'ma', "AGOL/OpenSpaceLevProt", 0, [
        "TOWN_ID", "OWNER_TYPE"
      ]
    )
    const owner_types = [
      "Federal", "State", "County", "Municipal",
      "Public Non-Profit", "State-State Dispute",
      "State-Non-Profit Dispute",
      "State-Municipal Dispute"
    ].map(name => OWNER_TYPE[name]);
    const town_ids = towns.map(town => (
      ({
        BOSTON: TOWN_ID["City of Boston"],
        BROOKLINE: TOWN_ID["Town of Brookline"],
        CAMBRIDGE: TOWN_ID["City of Cambridge"],
        SOMERVILLE: TOWN_ID["City of Somerville"]
      })[town]
    ))
    const wherein = (key, items, inverse=false) => {
      const quote = items.some(isNaN);
      const not = inverse ? ' not ' : ' ';
      const find = joined => `${key}${not}in (${joined})`;
      if (!quote) {
        return find(items.map(t=>`${t}`).join(','))
      }
      return find(items.map(t=>`'${t}'`).join(','))
    }; 
    const mbta_icon = {
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5]
    };
    const new_mbta_colors = {
      "003DA5": new Color(108, 179, 215), // blue
      "00843D": new Color(17, 221, 57), // green
      "DA291C": new Color(229, 82, 60), // red
      "ED8B00": new Color(227, 160, 28) // orange
    }
    const town_colors = {
      BOSTON: new Color(146,136,153),
      BROOKLINE: new Color(204,163,136),
      CAMBRIDGE: new Color(195,144,171),
      SOMERVILLE: new Color(187,181,102)
    };
    const theme = {
      minimal: 1,
      thickness: 2.5,
      water: new Color(230,230,250),
      walkable: new Color(91,91,91),
      outdoors: new Color(67,115,74),
      background: new Color(184,184,184)
    }
    const layers = [
      // Sidewalks
      ['dot/map', "Roads/Sidewalks", [{
        source: {
          type: "mapLayer",
          mapLayerId: 4
        },
        drawingInfo: {
          renderer: {
            type: "uniqueValue",
            field1: "Rt_Sidewlk",
            defaultSymbol: {
              type: "esriSLS",
              style: "esriSLSSolid",
              width: theme.minimal*2,
              color: theme.walkable.rgba,
            },
            uniqueValueInfos: (
              [0,1,2,3].map(
                (value) => ({
                  value, symbol: {
                    type: "esriSLS",
                    style: "esriSLSSolid",
                    color: theme.walkable.rgba,
                    width: theme.minimal
                  }
                })
              )
            )
          }
        }
      }]],
      // Crosswalks
      ['dot/map', "Assets/Crosswalk_Poly", [{
        source: {
          type: "mapLayer",
          mapLayerId: 0
        },
        definitionExpression: wherein("TOWN", towns),
        drawingInfo: {
          renderer: {
            type: "uniqueValue",
            field1: "TOWN",
            uniqueValueInfos: (
              Object.entries(town_colors).map(
                ([value, color]) => ({
                  value, symbol: {
                    type: "esriSFS",
                    style: "esriSFSSolid",
                    color: theme.walkable.rgba,
                    outline: {
                      type: "esriSLS",
                      style: "esriSLSSolid",
                      color: color.rgba,
                      width: theme.thickness*2
                    }
                  }
                })
              )
            )
          }
        }
      }]],
      // Public spaces
      ['ma/map', "AGOL/OpenSpaceLevProt", [{
        source: {
          typei: "mapLayer",
          mapLayerId: 0
        },
        definitionExpression: ([
          wherein("TOWN_ID", town_ids),
          wherein("PUB_ACCESS", ['Y']),
          wherein("OWNER_TYPE", owner_types)
        ].join(" AND ")),
        drawingInfo: {
          renderer: {
            type: "simple",
            symbol: {
              type: "esriSFS",
              style: "esriSFSSolid",
              color: theme.outdoors.rgba,
              outline: {
                type: "esriSLS",
                style: "esriSLSSolid",
                color: theme.outdoors.rgba,
                width: theme.thickness*1.5
              }
            }
          }
        }
      }]],
      // Shared Pedestrian Paths
      ['dot/map', "Multimodal/Priority_Trails_Network", [{
        source: {
          typei: "mapLayer",
          mapLayerId: 0
        },
        definitionExpression: ([
          wherein("Muni_ID", town_ids),
          "Fac_Type = 5"
        ].join(" AND ")),
        drawingInfo: {
          renderer: {
            type: "simple",
            symbol: {
              type: "esriSLS",
              style: "esriSLSSolid",
              color: theme.outdoors.rgba,
              width: theme.thickness*4
            }
          }
        }
      }]],
      // Water
      ['ma/feature', "AGOL/Massachusetts_Water_Features", [2], {
        fields: ["OBJECTID", "NAME"],
        where: wherein("NAME", water_names),
        style: ({ properties }) => {
          return { 
            weight: 0,
            fillOpacity: 1,
            fillColor: "#"+theme.water.hex
          };
        }
      }],
      // Bridges
      ['dot/map', "Roads/BridgesArcs", [{
        source: {
          type: "mapLayer",
          mapLayerId: 0
        },
        definitionExpression: wherein(
          "TypeOfService", bridge_types 
        ),
        drawingInfo: {
          renderer: {
            type: "simple",
            symbol: {
              type: "esriSLS",
              style: "esriSLSSolid",
              width: theme.thickness*3,
              color: theme.walkable.rgba,
            }
          }
        }
      }]],
      // MBTA lines
      ['dot/map', "Multimodal/GTFS_Systemwide", [{
        source: {
          type: "mapLayer",
          mapLayerId: 1
        },
        drawingInfo: {
          renderer: {
            type: "uniqueValue",
            field1: "route_color",
            uniqueValueInfos: (
              Object.entries(new_mbta_colors).map(
                ([value, color]) => ({
                  value, symbol: {
                    type: "esriSLS",
                    style: "esriSLSSolid",
                    width: theme.thickness*2,
                    color: color.rgba
                  }
                })
              )
            )
          }
        }
      }]],
      // MBTA stops
      ['dot/feature', "Multimodal/GTFS_Systemwide", [0], {
        fields: ["OBJECTID", "stop_name", "stop_id"],
        renderer: L.canvas(),
        where: wherein("municipality", towns),
        pointToLayer: function ({ properties }, pos) {
          const { stop_id: id } = properties;
          if (!measurements.has(id)) {
            return L.marker(pos, {
              icon: L.icon({
                ...mbta_icon, className: "hidden",
                iconUrl: `line-CCC-0.svg`,
              }),
              opacity: 0
            });
          }
          const line_url = 'line-'+measurements.get(id).map(
            ({ color, degrees }) => {
              const new_color = new_mbta_colors[color].hex;
              return `${new_color}-${degrees}`;
            }
          ).join('--')+'.svg';
          return L.marker(pos, {
            icon: L.icon({
              ...mbta_icon, className: "",
              iconUrl: line_url,
            }),
            opacity: 0.9
          });
        }
      }],
      // Town masks
      ['dot/map', "Boundaries/Towns", [{
        source: {
          type: "mapLayer",
          mapLayerId: 0
        },
        definitionExpression: wherein("TOWN", towns, true),
        drawingInfo: {
          renderer: {
            type: "simple",
            symbol: {
              type: "esriSFS",
              style: "esriSFSSolid",
              color: theme.background.rgba,
              outline: {
                type: "esriSLS",
                style: "esriSLSSolid",
                width: theme.thickness*4,
                color: theme.background.rgba,
              }
            }
          }
        }
      }]]
    ].reduce(([zIndex, layers], [method, ...args]) => {
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
        return layers;
      }
      layer.addTo(map)
      layer.remove()
      layer.addTo(map)
      return [ 
        zIndex + 1, [ ...layers, layer ]
      ];
    }, [1, []]).pop();
  }

}

const measure_stops = (map, stop_map) => {
  const get_xy = stop => {
    return map.latLngToContainerPoint(
      [stop.latitude, stop.longitude]
    );
  }
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

const to_map_layer = (
  pane, zIndex, server, endpoint, data=[0]
) => {
  const dynamic = data.some(isNaN);
  const root = `${server}/rest/services`
  return L.esri.dynamicMapLayer({
    url: `${root}/${endpoint}/MapServer`,
    format: "png32",
    attribution: "",
    f: "image",
    pane,
    zIndex,
    ...{
      [ !dynamic ? 'layers' : 'dynamicLayers' ]: (
        !dynamic ? data : JSON.stringify(data)
      )
    },
  });
}

const to_feature_layer = (
  pane, zIndex, server, endpoint, data=[0], opts={}
) => {
  const root = `${server}/rest/services`
  const dynamic = data.some(isNaN);
  if (dynamic || data.length !== 1) {
    return null;
  }
  return L.esri.featureLayer({
    url: `${root}/${endpoint}/FeatureServer/${data[0]}`,
    attribution: "",
    pane,
    zIndex,
    ...opts
  });
}

export { EventsMap };
