const path = require('path');
const fs = require('fs');
const util = require('util');
const compiler = require('./compiler');

it('should fail when automatic injection is configured', async () => {
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

it('should succeed when multiple entrypoints and a single runtime chunk are configured', async () => {
  await runFixture('multiple-entrypoints-and-single-runtime-chunk');
});

it('should succeed when multiple entrypoints and multiple runtime chunks are configured', async () => {
  await runFixture('multiple-entrypoints-and-multiple-runtime-chunks');
});

it('should succeed when multiple entrypoints and no runtime chunks are configured', async () => {
  await runFixture('multiple-entrypoints-and-no-runtime-chunks');
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

  expect(removeWhitespace(actualHtml)).toBe(removeWhitespace(expectedHtml));
}

function removeWhitespace(s) {
  return s.replace(/\s/g, '');
}
