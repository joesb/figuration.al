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
import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import timeToRead  from "eleventy-plugin-time-to-read";
import { DateTime } from "luxon";

import CleanCSS from "clean-css";
import postCSS from "postcss";
import autoprefixer from "autoprefixer";
import UglifyJS from "uglify-js"


/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {

  // eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(timeToRead, {
    speed: '850 characters per minute',
    style: "short"
  });
  // eleventyConfig.addPlugin(embedEverything);
  eleventyConfig.addFilter("debug", (content) => `<pre>${inspect(content)}</pre>`);

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

  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

  eleventyConfig.addCollection('promotedContent', (collection) => {
    var items = collection.getAll().filter(item => item.data.promoted == true);
    return sortByOrder(items);
  });

  function sortByOrder(collection) {
    return collection.sort((a, b) => {
      if (a.data.order < b.data.order) return -1;
      else if (a.data.order > b.data.order) return 1;
      else return 0;
    });
  }

  //  // Customize Markdown library and settings:
  //  let markdownLibrary = markdownIt({
  //   html: true,
  //   breaks: true,
  //   linkify: true
  // }).use(markdownItAnchor, {
  //   permalink: markdownItAnchor.permalink.ariaHidden({
  //     placement: "after",
  //     class: "direct-link visually-hidden",
  //     symbol: "#",
  //     level: [1,2,3,4],
  //   }),
  //   slugify: eleventyConfig.getFilter("slug")
  // }).use(markdownItAttrs).use(markdownItSmall).use(markdownIt11tyImage);
  // eleventyConfig.setLibrary("md", markdownLibrary);

  // eleventyConfig.addFilter("markdown", (content) => {
  //   return markdownLibrary.render(content);
  // });

  eleventyConfig.addPassthroughCopy('public/');
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