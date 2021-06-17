const path = require('path');
const fs = require('fs');
const util = require('util');
const compiler = require('./compiler');

it('is a test', async () => {
  await runFixture('single-entrypoint');
});

async function runFixture(fixture) {
  const stats = await compiler(fixture);
  const webpackFs = stats.compilation.compiler.outputFileSystem;
  const actualHtml = webpackFs.readFileSync(
    path.join(stats.compilation.compiler.outputPath, 'index.html'),
    'utf-8'
  );
  const expectedHtml = await util.promisify(fs.readFile)(
    path.join(__dirname, 'fixtures', fixture, 'expected.html'),
    'utf-8'
  );

  expect(actualHtml.trim()).toBe(expectedHtml.trim());
}
