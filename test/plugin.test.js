const path = require('path');
const fs = require('fs');
const util = require('util');
const compiler = require('./compiler');

it('should fail when automatic injection is enabled', async () => {
  await expect(() => runFixture('inject-enabled')).rejects.toEqual(
    expect.arrayContaining([
      {
        message: expect.stringMatching(
          'This plugin is not intended to be used with `{ inject: true }`.'
        ),
      },
    ])
  );
});

it('should fail when only one entrypoint is configured', async () => {
  await expect(() => runFixture('single-entrypoint')).rejects.toEqual(
    expect.arrayContaining([
      {
        message: expect.stringMatching(
          'This plugin is not intended to be used with a single entrypoint.'
        ),
      },
    ])
  );
});

it('should succceed when multiple entrypoints are configured', async () => {
  await runFixture('multiple-entrypoints');
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
