"use strict";

const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: [ "./app/main.ts", "./app/main.less"],
  output: {
    path: __dirname + "/dist",
    filename: "js/app.js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json", ".css", ".less"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/ },
      {
        test: /\.(le|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          "less-loader",
        ],
      }, 
    ]
  },
  plugins: [
    new CopyPlugin([
      { from: "node_modules/normalize.css/normalize.css", to: "css" },
      { from: "node_modules/bootstrap/dist/css/bootstrap.min.css", to: "css" },
      { from: "node_modules/bootstrap/dist/css/bootstrap-grid.min.css", to: "css" },
      { from: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", to: "js" },
      { from: "node_modules/jquery/dist/jquery.min.js", to: "js" },
      { from: "node_modules/react-bootstrap-typeahead/css/Typeahead-bs4.min.css", to: "css" },
      { from: "app/assets", to: "." },
    ]),
    new MiniCssExtractPlugin({
      filename: "css/bundle.css",
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
  ],
};