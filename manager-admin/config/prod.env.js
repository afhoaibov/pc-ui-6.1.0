const { distribution, liveVideo, o2o, im, i18n } = require('./index')

module.exports = {
  NODE_ENV: '"production"',
  ENV_CONFIG: '"prod"',
  DISTRIBUTION: distribution,
  LIVEVIDEO: liveVideo,
  O2O: o2o,
  I18N: i18n,
  IM: im
}
