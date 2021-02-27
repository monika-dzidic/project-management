exports.hash = (key) => {
  if (!key) {
    key = new Date().getMilliseconds().toLocaleString();
  }

  if (typeof key !== 'string') {
    key = key.toString();
  }

  let hash = 0; let i; let
    chr;
  for (i = 0; i < key.length; i++) {
    chr = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
