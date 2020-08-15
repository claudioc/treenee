const Handlebars = require('hbs');

module.exports = (options, context) => {
  let key = options;
  let withSpan = true;
  let strings;
  if (options.hash) {
    key = options.hash.key;
    withSpan = options.hash.withSpan === undefined ? withSpan : !!options.hash.withSpan;
    strings = options.data.root.c_settings.strings
  } else {
    strings = context.data.root.c_settings.strings
  }
  const string = strings ? (strings[key] || key) : key;
  const output = withSpan ? `<span class="__${key}__">${string}</span>` : string;
  return new Handlebars.SafeString(output);
};
