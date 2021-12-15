// https://eslint.org/docs/rules/

// if the "extends": "eslint:recommended" property in a configuration file enables the rule
// recommended but special rules 
const recommendedRules = {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-prototype-builtins': 'off',
    'no-unused-vars': ['error', {
        'args': 'none',
        'vars': 'local'
    }]
};

const normalRules = {
    'complexity': ['error', 8],
    'default-case': 'error',
    'default-case-last': 'error',
    'default-param-last': 'error',
    'func-name-matching': 'error',
    'line-comment-position': ['error', {
        'position': 'above'
    }],
    'max-classes-per-file': 'error',
    'max-depth': ['error', 5],
    'max-len': ['error', {
        'code': 550,
        'ignoreStrings': true,
        'ignoreTrailingComments': true
    }],
    'max-lines': ['error', 3000],
    'max-lines-per-function': ['error', 300],
    'max-nested-callbacks': ['error', 5],
    'max-params': ['error', 8],
    'max-statements': ['error', 50],
    'max-statements-per-line': ['error', {
        'max': 3
    }],
    'new-cap': ['error', {
        'capIsNew': false,
        'newIsCap': true,
        'properties': true
    }],
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-caller': 'error',
    'no-console': 'off',
    'no-constructor-return': 'error',
    'no-duplicate-imports': 'error',
    'no-eq-null': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-implied-eval': 'error',
    'no-inline-comments': 'error',
    'no-iterator': 'error',
    'no-label-var': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-mixed-operators': ['error', {
        'groups': [['&&', '||']]
    }],
    'no-multi-assign': 'error',
    'no-multi-str': 'error',
    'no-negated-condition': 'error',
    'no-nested-ternary': 'warn',
    'no-new-object': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': 'off',
    'no-promise-executor-return': 'error',
    'no-proto': 'error',
    'no-restricted-globals': ['error', 'event', 'fdescribe'],
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow': 'error',
    'no-tabs': 'error',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-undefined': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unreachable-loop': 'error',
    'no-unused-expressions': 'error',
    'no-unused-private-class-members': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'prefer-regex-literals': 'error',
    'require-atomic-updates': 'off',
    'require-await': 'error',
    'symbol-description': 'error'
};

// if some problems reported by the rule are automatically fixable by the --fix command line option
// formatters 
const fixableRules = {
    'array-bracket-newline': ['error', 'consistent'],
    'array-bracket-spacing': ['error', 'never'],
    'array-element-newline': ['error', 'consistent'],
    'arrow-spacing': 'error',
    'block-spacing': 'error',
    'brace-style': 'error',
    'comma-dangle': ['error', 'never'],
    'comma-spacing': ['error', {
        'after': true,
        'before': false
    }],
    'comma-style': ['error', 'last'],
    'computed-property-spacing': ['error', 'never'],
    'curly': 'error',
    'dot-location': ['error', 'property'],
    'dot-notation': 'error',
    'eqeqeq': ['error', 'always'],
    'func-call-spacing': ['error', 'never'],
    'function-call-argument-newline': ['error', 'consistent'],
    'function-paren-newline': ['error', 'consistent'],
    'generator-star-spacing': ['error', {
        'after': false,
        'before': true
    }],
    'implicit-arrow-linebreak': ['error', 'beside'],
    'indent': ['error', 4, {
        'ArrayExpression': 'first',
        'ObjectExpression': 1,
        'SwitchCase': 1
    }],
    'jsx-quotes': ['error', 'prefer-double'],
    'key-spacing': ['error', {
        'afterColon': true,
        'mode': 'strict'
    }],
    'keyword-spacing': ['error', {
        'after': true,
        'before': true
    }],
    'lines-around-comment': ['error', {
        'beforeBlockComment': true
    }],
    'lines-between-class-members': ['error', 'always', {
        'exceptAfterSingleLine': true
    }],
    'multiline-ternary': ['error', 'never'],
    'new-parens': 'error',
    'no-confusing-arrow': 'error',
    'no-div-regex': 'error',
    'no-else-return': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-floating-decimal': 'error',
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': ['error', {
        'max': 2,
        'maxBOF': 1,
        'maxEOF': 1
    }],
    'no-trailing-spaces': ['error', {
        'ignoreComments': true,
        'skipBlankLines': true
    }],
    'no-undef-init': 'error',
    'no-unneeded-ternary': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-var': ['warn'],
    'no-whitespace-before-property': 'error',
    'object-curly-newline': ['error', {
        'ExportDeclaration': {
            'minProperties': 3,
            'multiline': true
        },
        'ImportDeclaration': {
            'minProperties': 3,
            'multiline': true
        },
        'ObjectExpression': {
            'consistent': true,
            'minProperties': 1,
            'multiline': true
        },
        'ObjectPattern': {
            'minProperties': 3,
            'multiline': true
        }
    }],
    'object-curly-spacing': ['error', 'always'],
    'object-property-newline': ['error', {
        'allowAllPropertiesOnSameLine': true
    }],
    'one-var': ['error', 'never'],
    'one-var-declaration-per-line': ['error', 'always'],
    'operator-assignment': ['error', 'always'],
    'operator-linebreak': ['error', 'before'],
    'padding-line-between-statements': ['error', {
        'blankLine': 'always',
        'next': '*',
        'prev': 'directive'
    }, {
        'blankLine': 'any',
        'next': 'directive',
        'prev': 'directive'
    }, {
        'blankLine': 'always',
        'next': 'function',
        'prev': '*'
    }, {
        'blankLine': 'always',
        'next': 'block',
        'prev': '*'
    }],
    'prefer-const': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-object-spread': 'error',
    'prefer-template': 'error',
    'quotes': ['error', 'single', {
        'avoidEscape': true
    }],
    'rest-spread-spacing': ['error', 'always'],
    'semi': ['error', 'always'],
    'semi-spacing': ['error', {
        'after': true,
        'before': false
    }],
    'semi-style': ['error', 'last'],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', {
        'anonymous': 'never',
        'asyncArrow': 'always',
        'named': 'never'
    }],
    'space-in-parens': 'error',
    'space-infix-ops': ['error', {
        'int32Hint': false
    }],
    'space-unary-ops': 'error',
    'switch-colon-spacing': 'error',
    'template-curly-spacing': 'error',
    'template-tag-spacing': 'error',
    'unicode-bom': 'error',
    'wrap-iife': ['error', 'inside'],
    'wrap-regex': 'error'
};

const vueRules = {
    'vue/multi-word-component-names': 'off'
};


module.exports = {
    'root': true,
    // system globals
    'env': {
        'node': true,
        'browser': true,
        'amd': true,
        'commonjs': true,
        'es6': true
    },
    // other globals
    'globals': {
    },

    // should "npm install eslint-plugin-es -g" for VSCode in global
    'plugins': [
        'chain',
        'vue',
        'html'
    ],

    'extends': [
        'plugin:chain/recommended',
        'plugin:vue/recommended',
        'eslint:recommended'
    ],

    'parserOptions': {

        // set to 3, 5 (default), 6, 7, 8, 9, or 10 to specify the version of ECMAScript syntax you want to use. 
        // 2015 (same as 6), 2016 (same as 7), 2017 (same as 8), 2018 (same as 9), or 2019 (same as 10) to use the year-based naming. 
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },

    'rules': {
        ... recommendedRules,
        ... normalRules,
        ... fixableRules,
        ... vueRules
    }
};
