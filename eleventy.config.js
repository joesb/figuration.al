// const { DateTime } = require("luxon");
// const CleanCSS = require('clean-css');
// const autoprefixer = require('autoprefixer');
// const postCSS = require('postcss');
// const UglifyJS = require('uglify-es');
// const htmlmin = require('html-minifier');
// const pluginRss = require('@11ty/eleventy-plugin-rss');
// const Image = require("@11ty/eleventy-img");
// const markdownIt = require("markdown-it");
// const markdownItAnchor = require("markdown-it-anchor");
// const markdownItAttrs = require('markdown-it-attrs');
// const markdownItSmall = require('markdown-it-small');
// const markdownIt11tyImage = require('markdown-it-eleventy-img');
// const inspect = require("util").inspect;
// const embedEverything = require("eleventy-plugin-embed-everything");
import { IdAttributePlugin, InputPathToUrlTransformPlugin, EleventyHtmlBasePlugin } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import embedEverything from "eleventy-plugin-embed-everything";
import timeToRead  from "eleventy-plugin-time-to-read";
import { DateTime } from "luxon";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import markdownItSmall from "markdown-it-small";
import markdownIt11tyImage from "markdown-it-eleventy-img";
import markdownItSup from "markdown-it-sup";
import CleanCSS from "clean-css";
import postCSS from "postcss";
import autoprefixer from "autoprefixer";
import UglifyJS from "uglify-js";
import Image from "@11ty/eleventy-img";
import { eleventyImageOnRequestDuringServePlugin } from "@11ty/eleventy-img";


/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(timeToRead, {
    speed: '850 characters per minute',
    style: "short"
  });
  // eleventyConfig.addPlugin(embedEverything);
  eleventyConfig.addFilter("debug", (content) => `<pre>${inspect(content)}</pre>`);
  eleventyConfig.addPlugin(embedEverything);

  // // Return active path attributes
  eleventyConfig.addShortcode('activepath', function (itemUrl, currentUrl, currentClass = "current", prefix = '') {
    if (itemUrl == '/' && itemUrl !== currentUrl) {
      return '';
    }
    if (currentUrl && currentUrl.startsWith(itemUrl)) {
      return prefix + currentClass;
    }
    return '';
  });

  // Minify CSS
  eleventyConfig.addFilter('cssmin', function (code) {
    var css = new CleanCSS({}).minify(code).styles;
    return postCSS([ autoprefixer ]).process(css).css;
  });

  // Minify JS
  eleventyConfig.addFilter('jsmin', function (code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log('UglifyJS error: ', minified.error);
      return code;
    }
    return minified.code;
  });

  // Check if a thing is a string
  eleventyConfig.addFilter('is_string', function(obj) {
    return typeof obj == 'string'
  });

  // String to lowercase
  eleventyConfig.addFilter('toLowerCase', (str) => {
    return str.toLowerCase();
  });

  // String to uppercase
  eleventyConfig.addFilter('toUpperCase', (str) => {
    return str.toUpperCase();
  });

  // String to Title Case
  eleventyConfig.addFilter('toTitleCase', (str) => {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  });

  eleventyConfig.addFilter('maxDate', (list) => {
    return list.reduce((a, b) => {
      return new Date(a.date) > new Date(b.date) ? a : b;
    });
  });

  // Readable Date filter
  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

  // Check a string starts with a character.
  eleventyConfig.addFilter('starts_with', function(str, prefix, not = false) {
    return str.startsWith(prefix) !== not;
  });

  // Encode a URL string
  eleventyConfig.addFilter('encodeUri', (text) => {
    return encodeURI(text);
  });

  /* COLLECTIONS */

  // Promoted Content collection
  eleventyConfig.addCollection('promotedContent', (collection) => {
    var items = collection.getAll().filter(item => item.data.promoted == true);
    return sortByOrder(items);
  });

  // Prefiguration content
   eleventyConfig.addCollection('prefiguration', (collection) => {
    var nav = collection.getFilteredByTag('prefiguration');
    return sortByDate(nav).reverse();
  });

  // Refiguration content
   eleventyConfig.addCollection('refiguration', (collection) => {
    var nav = collection.getFilteredByTag('refiguration');
    return sortByDate(nav).reverse();
  });

  // Configuration content
   eleventyConfig.addCollection('configuration', (collection) => {
    var nav = collection.getFilteredByTag('configuration');
    return sortByDate(nav).reverse();
  });

  function sortByOrder(collection, andSticky = false) {
    return collection.sort((a, b) => {
      if (andSticky && b.data.sticky) return 1;
      else if (a.data.order < b.data.order) return -1;
      else if (a.data.order > b.data.order) return 1;
      else return 0;
    });
  }

  function sortByDate(collection, andSticky = true) {
    return collection.sort((a, b) => {
      if (andSticky && b.data.sticky) return -1;
      else if (a.data.date < b.data.date) return -1;
      else if (a.data.date > b.data.date) return 1;
      else return 0;
    });
  }

  // Images
  eleventyConfig.addShortcode("image", async function (src, alt, cls, widths = [300, 600], sizes = "100vh", picCls = "") {
		let metadata = await Image(src, {
			widths,
			formats: ["webp", "jpeg"],
      urlPath: "/public/img/",
      outputDir: "./content/public/img/"
		});

		let imageAttributes = {
      class: cls,
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};

    let options = {
      pictureAttributes: {
        class: picCls
      }
    }

		// You bet we throw an error on a missing alt (alt="" works okay)
		return Image.generateHTML(metadata, imageAttributes, options);
	});

  // Add the dev server middleware manually
  eleventyConfig.addPlugin(eleventyImageOnRequestDuringServePlugin);

  // Figure markup, as a paired shortcode
  eleventyConfig.addPairedShortcode("figure", function(content, caption, classes) {
    if (caption) {
      caption = '<figcaption>' + caption + '</figcaption>';
    }
    return '<figure class="' + classes +'">' + content + caption +'</figure>'});

  eleventyConfig.addShortcode("socialCard", async function(url, title, description, captionUrl, image, imageAlt) {
    return `<div class="social-card"><a
  href="${ url }"
  rel="noopener ugc nofollow" target="_blank">
  <div class="social-card--inner">
    <div class="social-card-caption">
      <h2 class="social-card-caption-title h5-style text-black">${ title }</h2>
      <div class="social-card-caption-description">
        <h3 class="h6-style not-bold primary-font text-grey-dark social-card-caption-description--description">${ description }</h3>
      </div>
      <div class="social-card-caption-url">
        <p class="h6-style not-bold primary-font text-grey-dark social-card-caption-url--url">${ captionUrl }</p>
      </div>
    </div>
    <div class="social-card-image">
      <img src="${ image }" class="social-card-image--image image-obj-cover" alt="${ imageAlt }" />
    </div>
  </div>
</a></div>`;
  });

  eleventyConfig.addAsyncShortcode("imageData", async function(src) {
    var picture = await getPictureData(src, [800]);
    return picture.jpeg[0].url;
  });

  async function getPictureData(src, widths = [300, 600, 1000, 1980]) {
    let metadata = await Image(src, {
      widths: widths,
      formats: ['jpeg'],
      urlPath: "/public/img/",
      outputDir: "./content/public/img/"
    });
    return metadata;
  };

  eleventyConfig.addPairedShortcode("QuickGrid", (content, classes = []) => 
    '<div class="page--content-grid' + (classes.length ? ' ' + classes.join(" ") : '') + '">' + content + '</div>');

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link do-not-display",
      symbol: "#",
      level: [1,2,3,4],
    }),
    slugify: eleventyConfig.getFilter("slug")
  }).use(markdownItAttrs).use(markdownItSmall).use(markdownIt11tyImage).use(markdownItSup);
  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  eleventyConfig.addPassthroughCopy('content/public/');
  eleventyConfig.addPassthroughCopy('CNAME');
  eleventyConfig.addWatchTarget('./src/sass/');
};

export const config = {
  templateFormats: [
    'md',
    'njk',
    'html',
    'liquid'
  ],

  // If your site lives in a different subdirectory, change this.
  // Leading or trailing slashes are all normalized away, so don’t worry about it.
  // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
  // This is only used for URLs (it does not affect your file structure)
  pathPrefix: '/',

  markdownTemplateEngine: 'liquid',
  htmlTemplateEngine: 'njk',
  dataTemplateEngine: 'njk',
  passthroughFileCopy: true,
  
  dir: {
    input: 'content',
    includes: '../src/_includes',
    layouts: '../src/_includes/layouts',
    data: '../src/_data',
    output: '_site',
  },
};