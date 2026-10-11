const fs = require('node:fs');
const sass = require('sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
async function build() {
  const css = sass.compile('public/styles.scss', {style:'expanded'}).css;
  const result = await postcss([autoprefixer()]).process(css, {from:'public/styles.scss', to:'public/styles.css', map:false});
  fs.writeFileSync('public/styles.css', result.css);
  result.warnings().forEach(warning => console.warn(warning.toString()));
  console.log('Compiled Sass and processed CSS with Autoprefixer.');
}
build().catch(error => { console.error(error); process.exitCode=1; });
