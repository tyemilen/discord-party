'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

const config = (env, argv) =>
	merge(common, {
		entry: {
			popup: PATHS.src + '/popup.js',
			'contentScript.discord': PATHS.src + '/isolated/contentScript.discord.js',
			'contentScript.spotify': PATHS.src + '/isolated/contentScript.spotify.js',
			discord: PATHS.src + '/inject/discord.js',
			spotify: PATHS.src + '/inject/spotify.js',
			background: PATHS.src + '/background.js',
		},
		devtool: argv.mode === 'production' ? false : 'source-map',
	});

module.exports = config;
