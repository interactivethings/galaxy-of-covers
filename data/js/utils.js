/**
 * Get value from a nested structure or null
 */
function getIn(o, keys) {
  var k = keys[0],
      ks = keys.slice(1);
  if (!o.hasOwnProperty(k)) return null;
  return ks.length ? getIn(o[k], ks) : o[k];
}


module.exports = {
	getIn: getIn
};
