function param(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[#&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const path = param("path");
const q = param("q");
const version = param("version");

if (path) {
  // TODO: use versions
  // http://localhost:3000/#version=master&path=docs%2Femulation.md&q=geolocation
  window.location.pathname = `${param("path").replace(".md", "")}#${param("q")}`;
} else {
  const redirects = [
    // ------------------- nodejs ---------------------
    { from: '/docs/test-intro', to: '/docs/intro' },
    { from: '/docs/installation', to: '/docs/library' },
    { from: '/docs/next/test-intro', to: '/docs/next/intro' },
    { from: '/docs/next/installation', to: '/docs/next/library' },
    { from: '/docs/assertions', to: '/docs/test-assertions' },
    { from: '/docs/next/assertions', to: '/next/docs/test-assertions' },
    { from: '/docs/inspector', to: '/docs/debug' },
    { from: '/blog', to: '/community/welcome' },
    { from: '/docs/test-auth', to: '/docs/auth' },
    { from: '/docs/next/test-auth', to: '/docs/next/auth' },
    { from: '/docs/test-pom', to: '/docs/pom' },
    { from: '/docs/next/test-pom', to: '/docs/next/pom' },
    { from: '/docs/debug-selectors', to: '/docs/debug' },
    { from: '/docs/next/debug-selectors', to: '/docs/next/debug' },
    { from: '/docs/cli', to: '/docs/browsers' },
    { from: '/docs/next/cli', to: '/docs/next/browsers' },
    { from: '/docs/test-advanced', to: '/docs/test-configuration' },
    { from: '/docs/next/test-advanced', to: '/docs/next/test-configuration' },
    // ------------------- python ---------------------
    { from: '/python/docs/assertions', to: '/python/docs/api/class-playwrightassertions' },
    { from: '/python/next/docs/assertions', to: '/python/next/docs/api/class-playwrightassertions' },
    { from: '/python/docs/inspector', to: '/python/docs/debug' },
    { from: '/python/blog', to: '/community/welcome' },
    { from: '/python/docs/debug-selectors', to: '/python/docs/debug' },
    { from: '/python/docs/next/debug-selectors', to: '/python/docs/next/debug' },
    { from: '/python/docs/cli', to: '/python/docs/browsers' },
    { from: '/python/docs/next/cli', to: '/python/docs/next/browsers' },
    // ------------------- dotnet ---------------------
    { from: '/dotnet/docs/assertions', to: '/dotnet/docs/api/class-playwrightassertions' },
    { from: '/dotnet/next/docs/assertions', to: '/dotnet/next/docs/api/class-playwrightassertions' },
    { from: '/dotnet/inspector', to: '/dotnet/docs/debug' },
    { from: '/dotnet/blog', to: '/community/welcome' },
    { from: '/dotnet/docs/debug-selectors', to: '/dotnet/docs/debug' },
    { from: '/dotnet/docs/next/debug-selectors', to: '/dotnet/docs/next/debug' },
    { from: '/dotnet/docs/cli', to: '/dotnet/docs/browsers' },
    { from: '/dotnet/docs/next/cli', to: '/dotnet/docs/next/browsers' },
    // ------------------- java -----------------------
    { from: '/java/docs/assertions', to: '/java/docs/api/class-playwrightassertions' },
    { from: '/java/next/docs/assertions', to: '/java/next/docs/api/class-playwrightassertions' },
    { from: '/java/docs/inspector', to: '/java/docs/debug' },
    { from: '/java/blog', to: '/community/welcome' },
    { from: '/java/docs/debug-selectors', to: '/docs/debug' },
    { from: '/java/docs/next/debug-selectors', to: '/docs/next/debug' },
    { from: '/java/docs/cli', to: '/java/docs/browsers' },
    { from: '/java/docs/next/cli', to: '/java/docs/next/browsers' },
  ];
  const pathname = window.location.pathname;
  for (const redirect of redirects) {
    if (pathname === redirect.from || pathname === redirect.from + '/') {
      window.location.pathname = redirect.to;
      break;
    }
  }
}

window.addEventListener("load", () => {
  const availableIds = [...document.querySelectorAll("[id]")].map(e => e.id)
  const currentHash = window.location.hash.length > 0 ? window.location.hash.substring(1) : '';
  const currentHashIsFound = availableIds.includes(currentHash)
  if (currentHash && !currentHashIsFound) {
    const headingFound = [...document.querySelectorAll("div.markdown > h2")]
      .find(element => element.textContent.replace(/[ ]+/g, '-').replace(/[^\w-_]/g, '').replace("#", "").toLowerCase() === currentHash)
    if (headingFound) {
      const newHash = headingFound.querySelector("a").id
      window.location.hash = newHash
    }
  }
})

const languagesInSubfolders = ['java', 'dotnet', 'python'];

window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    const language = languagesInSubfolders.find(lang => window.location.pathname.startsWith(`/${lang}`));
    let serviceWorkerPath;
    if (language)
      serviceWorkerPath = `/${language}/sw.js`;
    else
      serviceWorkerPath = `/sw.js`;

    navigator.serviceWorker.register(serviceWorkerPath);
  }
});

const kGoToNextToken = ['Shift', 'Shift', 'Shift', 'Shift', 'Shift'];
let keyPressState = 0;
document.addEventListener('keydown', (e) => {
  if (kGoToNextToken[keyPressState] === e.key) {
    keyPressState++;
    if (keyPressState === kGoToNextToken.length) {
      gotoNext();
      keyPressState = 0;
    }
  } else {
    keyPressState = 0;
  }

  function gotoNext() {
    const parts = window.location.pathname.split('/');
    if (parts.includes('next'))
      return;
    const docsIndex = parts.indexOf('docs');
    let newPath = '/docs/next/intro';
    if (docsIndex !== -1) {
      parts.splice(docsIndex + 1, 0, 'next')
      newPath = parts.join('/');
    } else if (window.location.pathname.startsWith('/python'))
      newPath = '/python/docs/next/intro';
    else if (window.location.pathname.startsWith('/java'))
      newPath = '/java/docs/next/intro';
    else if (window.location.pathname.startsWith('/dotnet'))
      newPath = '/dotnet/docs/next/intro';

    window.location.href = newPath + location.hash;
  }
});

function redirectToPreviousLanguageIfNeeded() {
  if (!('localStorage' in window))
    return;
  if (window.location.pathname !== '/')
    return;
  const previousLanguagePrefix = localStorage.getItem('previousLanguagePrefix');
  if (previousLanguagePrefix && !window.location.pathname.startsWith(`/${previousLanguagePrefix}`))
    window.location.href = previousLanguagePrefix;
}

redirectToPreviousLanguageIfNeeded();
