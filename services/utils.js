const queryObject2String = obj => `?${Object.entries(obj).map(
  ([k, v]) => `${k}=${v}`
).join('&')}`;
