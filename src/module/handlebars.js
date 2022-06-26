/**
 * Defines a set of template paths to pre-load.
 * Pre-loaded templates are compiled and cached for fast access when rendering.
 * @returns {Promise}
 */
function preloadHandlebarsTemplates() {
  /* Esbuild defines the paths for us at build time. */
  // eslint-disable-next-line no-undef
  const paths = PATHS;
  console.log('YZEC | Loading Handlebars templates:', paths);
  return loadTemplates(paths);
}

/* ------------------------------------------ */
/*  HandlebarsJS Custom Helpers               */
/* ------------------------------------------ */

/**
 * Defines Handlebars custom Helpers and Partials.
 */
function registerHandlebarsHelpers() {
  /**
   * Replaces the default Foundry concat helper
   * because we want to return a string
   * and not a SafeString object.
   */
  Handlebars.registerHelper('concat', function () {
    let str = '';
    for (const arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        str += arguments[arg];
      }
    }
    return str;
  });

  Handlebars.registerHelper('capitalize', function (str) {
    return str.capitalize(); // This is a Foundry primitive.
  });

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('toUpperCase', function (str) {
    return str.toUpperCase();
  });

  Handlebars.registerHelper('times', function (n, content) {
    let str = '';
    for (let i = 0; i < n; i++) {
      content.data.max = n;
      content.data.index = i + 1;
      str += content.fn(i);
    }
    return str;
  });

  Handlebars.registerHelper('mathMin', function (...args) {
    return Math.min(...args);
  });

  Handlebars.registerHelper('mathMax', function (...args) {
    return Math.max(...args);
  });

  Handlebars.registerHelper('add', function (a, b) {
    return a + b;
  });

  Handlebars.registerHelper('substract', function (a, b) {
    return a - b;
  });

  Handlebars.registerHelper('divide', function (a, b) {
    return a / b;
  });

  Handlebars.registerHelper('multiply', function (a, b) {
    return a * b;
  });

  Handlebars.registerHelper('ratio', function (a, b) {
    return (a / b) * 100;
  });

  // Handlebars.registerHelper('boxes', function (field, options) {
  //   const value = Number(options.hash.value);
  //   const min = Number(options.hash.min);
  //   const max = Number(options.hash.max);
  //   let loss = Number(options.hash.loss);
  //   let str = `<a class="capacity-boxes" data-field="${field}" data-min="${min}" data-max="${max}">`;
  //   for (let i = 0; i < max; i++) {
  //     if (i === 10) str += '<br/>';
  //     if (value > i) str += `${YZEC.Icons.boxes.full}`;
  //     else str += `${YZEC.Icons.boxes.empty}`;
  //   }
  //   if (loss < 0) {
  //     str += '<span class="loss">';
  //     for (; loss < 0; loss++) {
  //       str += `${YZEC.Icons.boxes.lost}`;
  //     }
  //     str += '</span>';
  //   }
  //   str += '</a>';
  //   return new Handlebars.SafeString(str);
  // });
}

export function initializeHandlebars() {
  preloadHandlebarsTemplates();
  registerHandlebarsHelpers();
}
