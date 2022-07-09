const data = [
  {
    name: 'Schinziophyton rautanenii',
    gbif: 3071110,
  }
];

const getGBIFOccurences = async (speciesKey, limit = 999) => {
  const URL = `https://api.gbif.org/v1/occurrence/search?speciesKey=${speciesKey}&limit=${limit}`;

  const { results } = await fetch(URL).then(res => res.json());

  const coords = results.map(
    occ => [occ.decimalLatitude, occ.decimalLongitude]
  );

  return coords;
};

const getOpenLandMapData = async (
  lat, lon, coll = 'predicted250m',
  regex = 'sol_grtgroup_usda.soiltax_c_250m_s0..0cm_1950..2017_v0.2.tif'
) => {
  const URL = `https://api.openlandmap.org/query/point?lat=${lat}&lon=${lon}&coll=${coll}&regex=${regex}`;

  const { info } = await fetch(URL, {
    headers: {
      Origin: 'https://openlandmap.org',
      Referer: 'https://openlandmap.org/'
    }
  }).then(res => res.json());

  return info.map(point => [point['Order'], point['Suborder'], point['Group']])[0];
};

const getData = async () => {
  for (const plant of data) {
    const soils = await getGBIFOccurences(plant.gbif).then(coords => 
      Promise.all(coords.map(async coor => {
        return await getOpenLandMapData(coor[0], coor[1]);
      }))
    );

    return soils.filter(s => s);
  }
};

const analyzeData = data => {
  let analysis = {
    orders: {},
    suborders: {},
    groups: {},
    total: 0,
  };

  for (const datam of data) {
    analysis.total += 1;
    analysis.orders[datam[0]] = ~~analysis.orders[datam[0]] + 1;
    analysis.suborders[datam[1]] = ~~analysis.suborders[datam[1]] + 1;
    analysis.groups[datam[2]] = ~~analysis.groups[datam[2]] + 1;
  }

  return analysis;
};

getData().then(analyzeData).then(console.log);
