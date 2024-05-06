// https://eslint.org/docs/rules/

const plus = require('eslint-config-plus');
const vue = require('eslint-plugin-vue');

// console.log(vue.configs['flat/recommended']);

// https://eslint.org/docs/latest/use/configure/configuration-files
module.exports = [
    ... vue.configs['flat/recommended'],
    plus,
    {
        rules: {
            'vue/no-v-html': 'off',
            'vue/multi-word-component-names': 'off'
        }
    }
];
