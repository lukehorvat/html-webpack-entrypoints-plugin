const path = require('path');
const fs = require('fs');
const util = require('util');
const compiler = require('./compiler');
const webpackConfig = require('./fixtures/webpack.config');

it('is a test', async () => {
  const actualHtml = await readActualHtml(webpackConfig);
  const expectedHtml = await readExpectedHtml();
  expect(actualHtml).toBe(expectedHtml);
});

async function readExpectedHtml() {
  const html = await util.promisify(fs.readFile)(
    path.join(__dirname, 'fixtures', 'expected.html'),
    'utf-8'
  );
  return html.trim();
}

async function readActualHtml(config) {
  const stats = await compiler(config);
  const webpackFs = stats.compilation.compiler.outputFileSystem;
  const html = webpackFs.readFileSync(
    path.join(stats.compilation.compiler.outputPath, 'index.html'),
    'utf-8'
  );
  return html.trim();
}
