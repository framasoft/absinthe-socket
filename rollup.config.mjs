// @flow
/* eslint-disable import/no-dynamic-require */

import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { globbySync } from "globby";
import * as changeCase from "change-case";
import resolve from '@rollup/plugin-node-resolve';
import { readFileSync } from "fs";

// $FlowFixMe
const loadJSON = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const pkg = loadJSON(`${process.cwd()}/package.json`);

const dirs = {
  input: "src",
  output: "dist",
  compat: "compat"
};

const plugins = {
  babel: babel({
    configFile: "../../.babelrc",
    exclude: ["node_modules/**", "../../node_modules/**"],
    babelHelpers: 'runtime'
  }),
  commonjs: commonjs(),
  resolve: resolve()
};

const getCjsAndEsConfig = fileName => ({
  input: `${dirs.input}/${fileName}`,
  output: [
    {
      file: `${dirs.output}/${fileName}`,
      format: "es",
      sourcemap: true
    },
    {
      file: `${dirs.compat}/cjs/${fileName}`,
      format: "cjs",
      sourcemap: true
    }
  ],
  plugins: [plugins.babel]
});

const sources = globbySync("**/*js", {cwd: dirs.input});

// eslint-disable-next-line no-unused-vars
const getUnscopedName = pkg => {
  const [scope, name] = pkg.name.split("/");

  return changeCase.pascalCase(scope) + changeCase.pascalCase(name);
};

export default [
  {
    input: `${dirs.input}/index.js`,
    output: {
      file: `${dirs.compat}/umd/index.js`,
      format: "umd",
      name: changeCase.pascalCase(getUnscopedName(pkg)),
      sourcemap: true
    },
    plugins: [plugins.babel, plugins.resolve, plugins.commonjs]
  },
  ...sources.map(getCjsAndEsConfig)
];
