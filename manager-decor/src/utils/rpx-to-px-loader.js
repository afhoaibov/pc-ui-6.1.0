const scale = 375 / 750
module.exports = function (source) {
  const matchPXExp = new RegExp("\\b\\d+(\\.\\d+)?" + 'rpx' + "\\b", 'g');

  source = source.replace(matchPXExp, function (match) {
    let pxValue = parseFloat(match.slice(0, match.length - 3));
    return (pxValue * scale).toFixed(0) + 'px';
  });

  source = source.replace(/(\w+):\s?(.+)\s?\+\s?['"`]rpx['"`]/g, `$1: ($2) * ${scale} + 'px'`)
  source = source.replace(/{(.+)}rpx/, `{$1 / 2}px`)

  return source;
};
