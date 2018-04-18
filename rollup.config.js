import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    name: 'simple-virtual-dom.js',
    input: './index.js',
    output: {
        file: './dist/simple-virtual-dom.js',
        format: 'umd'
    },
    plugins: [
        resolve(),
        commonjs(),
    ]
}