const path = require('path');
const compiler = require('./compiler');

it('should not support automatic injection', async () => {
  await expect(() => runFixture('inject-enabled')).rejects.toEqual(
    expect.arrayContaining([
      {
        message: expect.stringMatching(
          'This plugin cannot be used with `{ inject: true }`.'
        ),
      },
    ])
  );
});

it('should not support a single entrypoint', async () => {
  await expect(() => runFixture('single-entrypoint')).rejects.toEqual(
    expect.arrayContaining([
      {
        message: expect.stringMatching(
          'This plugin cannot be used with a single entrypoint.'
        ),
      },
    ])
  );
});

it('should support multiple entrypoints + single runtime chunk', async () => {
  await runFixture('multiple-entrypoints-and-single-runtime-chunk');
});

it('should support multiple entrypoints + multiple runtime chunks', async () => {
  await runFixture('multiple-entrypoints-and-multiple-runtime-chunks');
});

it('should support multiple entrypoints + no runtime chunks', async () => {
  await runFixture('multiple-entrypoints-and-no-runtime-chunks');
});

async function runFixture(fixture) {
  const stats = await compiler(fixture);
  const expectedHtml = stats.compilation.compiler.inputFileSystem.readFileSync(
    path.join(stats.compilation.compiler.context, 'expected.html'),
    'utf-8'
  );
  const actualHtml = stats.compilation.compiler.outputFileSystem.readFileSync(
    path.join(stats.compilation.compiler.outputPath, 'index.html'),
    'utf-8'
  );

  expect(removeLineBreaks(actualHtml)).toBe(removeLineBreaks(expectedHtml));
}

function removeLineBreaks(s) {
  return s.replace(/\r?\n|\r/g, '');
}
