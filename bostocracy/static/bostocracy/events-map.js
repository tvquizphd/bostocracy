import "L";
import "esri-leaflet";
import { Color } from "color";
import {
  to_map_config, layer_mapper, wherein,
  to_boston_bounds
} from "config-events-map";
import StyleLeaflet from "style-leaflet" with { type: "css" };
import StyleEventsMap from "style-events-map" with { type: "css" };

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
    const {
      towns, town_ids, measurements, water_names,
      bridge_types, owner_types
    } = await to_map_config(
      stop => map.latLngToContainerPoint(
        [stop.latitude, stop.longitude]
      )
    );
    const new_mbta_colors = {
      "003DA5": new Color(108, 179, 215), // blue
      "00843D": new Color(17, 221, 57), // green
      "DA291C": new Color(229, 82, 60), // red
      "ED8B00": new Color(227, 160, 28) // orange
    }
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
          type: "mapLayer", mapLayerId: 4
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
          type: "mapLayer", mapLayerId: 0
        },
        definitionExpression: wherein(
          "TOWN", Object.keys(towns)
        ),
        drawingInfo: {
          renderer: {
            type: "uniqueValue",
            field1: "TOWN",
            uniqueValueInfos: (
              Object.entries(towns).map(
                ([value, town]) => ({
                  value, symbol: {
                    type: "esriSFS",
                    style: "esriSFSSolid",
                    color: theme.walkable.rgba,
                    outline: {
                      type: "esriSLS",
                      style: "esriSLSSolid",
                      color: town.color.rgba,
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
          typei: "mapLayer", mapLayerId: 0
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
          typei: "mapLayer", mapLayerId: 0
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
          type: "mapLayer", mapLayerId: 0
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
          type: "mapLayer", mapLayerId: 1
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
        where: wherein(
          "municipality", Object.keys(towns)
        ),
        pointToLayer: ({ properties }, pos) => {
          const { stop_id: id } = properties;
          const mbta_icon = {
            iconSize: [25, 25], iconAnchor: [12.5, 12.5]
          };
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
              ...mbta_icon, className: "", iconUrl: line_url
            }),
            opacity: 0.9
          });
        }
      }],
      // Town masks
      ['dot/map', "Boundaries/Towns", [{
        source: {
          type: "mapLayer", mapLayerId: 0
        },
        definitionExpression: wherein(
          "TOWN", Object.keys(towns), true
        ),
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
                width: theme.thickness*2,
                color: theme.background.rgba,
              }
            }
          }
        }
      }]]
    ].reduce(
      layer_mapper(map), [1, []]
    ).pop();
  }
}

export { EventsMap };
