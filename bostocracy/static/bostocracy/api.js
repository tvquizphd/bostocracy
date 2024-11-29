const get_server = (url_key) => {
  return ({
    dot: (
      'https://gis.massdot.state.ma.us/arcgis'
    ),
    ma: (
      'https://arcgisserver.digital.mass.gov/arcgisserver'
    ),
    epa: (
      'https://geopub.epa.gov/ArcGIS'
    )
  })[url_key];
}

const get_map_fields = async (
  url_key, endpoint, layer_id, field_names=[]
) => {
  const server = get_server(url_key);
  const root = `${server}/rest/services`;
  try {
    const response = await fetch(
      `${root}/${endpoint}/MapServer/layers?f=json`
    );
    const { layers } = (await response.json())
    const { fields } = layers[layer_id];
    return field_names.reduce((out, name) => {
      const { domain } = fields.find(
        f => f.name === name
      )
      return {
        ...out, [name]: domain.codedValues.reduce(
          (out, {name, code}) => ({...out, [name]: code }), {}
        )
      }
    },{});
  }
  catch (e) {
    return [];
  }
}

const get_mbta_route_stops = async (key, routes) => {
  const stops = key ? (
    `https://api-v3.mbta.com/stops/?api_key=${key}&route=`
  ) : (
    'https://api-v3.mbta.com/stops/?route='
  )
  try {
    const responses = await Promise.all(routes.map(
      ({ id }) => fetch(stops+id)
    ));
    const results = (await Promise.all(responses.map(
      response => response.json()
    ))).map( ({ data }) => data);
    return new Map(
      routes.map(({id, attributes}, index) => {
        const { color } = attributes;
        const stops = results[index];
        return [id, { stops, color }];
      }) 
    )
  }
  catch (e) {
    return [];
  }
}

const get_mbta_stops = async () => {
  const key = (
    await (await fetch('/keys/mbta')).text()
  )
  const types = key ? (
    `https://api-v3.mbta.com/routes/?api_key=${key}&type=0,1`
  ) : (
    'https://api-v3.mbta.com/routes/?type=0,1'
  );
  // TODO -- extract colors from routes
  const stop_map = await (async () => {
    try {
      const response = await fetch(types);
      const results = (await response.json()).data
      return get_mbta_route_stops(key, results);
    }
    catch (e) {
      return new Map();
    }
  })();
  // Find direct connections for each stop
  return stop_map.entries().reduce(
    (links, [route, { stops, color }]) => {
      return stops.reduce(
        (links, stop, i) => {
          const { id, attributes } = stop;
          const { latitude, longitude } = attributes;
          const info = (
            links.get(id) || {
              id, latitude, longitude,
              colors: [color], routes: {}
            }
          )
          return new Map([
            ...links,
            [
              id,
              {
                ...info,
                routes: {
                  ...info.routes,
                  [route]: {
                    color, link: [
                      stops[i-1]?.id, id, stops[i+1]?.id
                    ].filter(v => v).filter(
                      (_,i,{length}) => !(
                        length === 3 && i === 1
                      )
                    ).sort()
                  }
                },
                colors: [...new Set(
                  [...info.colors, color]
                )]
              }
            ]
          ]);
        },
        links
      ); 
    },
    new Map()
  )
}

export {
  get_mbta_stops, get_map_fields, get_server
}
