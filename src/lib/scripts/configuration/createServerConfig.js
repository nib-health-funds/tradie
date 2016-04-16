import path from 'path';
import webpack from 'webpack';
import createApplicationConfig from './createApplicationConfig';

export default function createServerConfig(options) {
  const {env, root, config: {src, dest, scripts: {bundles}}} = options;

  const config = createApplicationConfig(options);

  //configure the server bundles
  const entries = bundles.reduce((accum, bundle) => {

    const dirname = path.dirname(bundle);
    const basename = path.basename(bundle, path.extname(bundle));

    //skip the server bundle
    if (basename !== 'server') {
      return accum;
    }

    return {
      ...accum,
      [path.join(dirname, basename)]: bundle
    };

  }, {});

  //TODO: add source-map-support via banner plugin so the user doesn't have to add it in each app
  //TODO: in distant future, use IgnorePlugin to ignore (S)CSS on the server

  return {
    ...config,

    target: 'node',
    devtool: env === 'production' ? 'source-map' : 'cheap-module-source-map',

    entry: entries,
    context: path.resolve(root, src),

    output: {
      path: path.resolve(root, dest),
      filename: '[name].js',
      libraryTarget: "commonjs"
    },

    plugins: [
      ...config.plugins,
      new webpack.BannerPlugin(
        'require(\'source-map-support\').install();',
        {raw: true, entryOnly: true}
      )
    ]

  };
}
