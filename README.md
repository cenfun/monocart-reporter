# monocart-reporter
> A [playwright](https://github.com/microsoft/playwright) test reporter. Shows suites/cases/steps with tree style.

## Preview
[https://cenfun.github.io/monocart-reporter](https://cenfun.github.io/monocart-reporter)

## Install
```sh
npm i monocart-reporter
```

## Playwright Multiple Reporters
```js
// playwright.config.js
module.exports = {
  reporter: [
    ['list'],
    ['monocart-reporter', {  
      outputFile: 'playwright-report/monocart/index.html'
    }]
  ]
};
```
see example [tests/playwright.config.js](tests/playwright.config.js)  
more [https://playwright.dev/docs/test-reporters](https://playwright.dev/docs/test-reporters)

## CHANGELOG
- [CHANGELOG.md](CHANGELOG.md)
