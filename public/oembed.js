/**
 * A Basic OEmbed loader for udata cards.
 *
 * This is only required in case standard OEmbed is not available
 * or udata is not whitelisted on a given platform.
 *
 * Instead of simply putting URL, this script requires to `div`
 * with `data-udata-*` attributes:
 *
 * Ex:
 *      <div data-udata-dataset="slug-or-id"></div>
 *      <div data-udata-reuse="slug-or-id"></div>
 *      <div data-udata-organization="slug-or-id"></div>
 */

/**
 * Extract the base URL from the URL of the current script
 */
function getBaseUrl() {
    const script =  document.currentScript || document.querySelector('script[src$="oembed.js"]');
    const parser = document.createElement('a');
    parser.href = script.dataset.udata || script.src;
    return `${parser.protocol}//${parser.host}`;
}

function getSize(attr) {
  return {
    'dataservice': { maxheight: 180 },
    'dataset': { maxheight: 180 },
    'organization': { maxwidth: 440, maxheight: 220 },
    'reuse': { maxwidth: 440, maxheight: 400 },
  }[attr]
}

// Base udata instance URL
const BASE_URL = getBaseUrl();
// OEmbed endpoint URL
const OEMBED_URL = `${BASE_URL}/nuxt-api/oembed`;
// Loads cards in the same language than the current site
const LANG = document.documentElement.lang;
// Supported attributes
const ATTRS = ['dataservice', 'dataset', 'organization', 'reuse',];


/**
 * `fetch` doesn't provide an error handling based on status code.
 */
function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

/**
 * Return a promisified JSON response from an API URL
 * if status code is correct.
 */
function fetchOEmbed(url, attr) {
    const request = new URL(OEMBED_URL)
    const params = new URLSearchParams({
      url,
      ...getSize(attr),
    })
    request.search = '?' + params.toString()
    return fetch(request.toString())
        .then(checkStatus)
        .then(response => response.json());
}

/**
 * Transform a string to title case
 */
function toTitle(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
}

(function() {
    // Load cards for supported attributes
    ATTRS.forEach(function(attr) {
        [].forEach.call(document.querySelectorAll(`[data-udata-${attr}]`), function(div) {
            div.innerHTML = `
            <svg width="24" height="24" style="color: #3558a2; animation: spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
            const id = div.dataset[`udata${toTitle(attr)}`];
            fetchOEmbed(`${BASE_URL}/${LANG}/${attr}s/${id}/`, attr)
                .then(oembed => {
                    div.innerHTML = oembed.html;
                });
        });
    });
})();
