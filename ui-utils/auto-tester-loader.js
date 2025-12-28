module.exports = function (source) {
  if (!/src\/main\.js/.test(this.resourcePath)) return source
  source = `import '@itbuilder/auto-tester-helper'\n` + source
  return source
}
