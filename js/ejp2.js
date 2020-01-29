// Adds a [License Terms of Use] link if the provider is mapped in OURdb
const _$ = jQuery;

const API_BASE_URL = 'https://library.ryerson.ca/wp-json/rylib-api/v0';
const API_ENDPOINT = 'licenses';

const generateRequestUrl = function (resourceName) {
  return API_BASE_URL + '/' + API_ENDPOINT + '/?provider=' + resourceName;
}

let licenses = {};

const getLicense = function(resourceName) {
  var defer = _$.Deferred();

  if (licenses[resourceName] === undefined) {
    // we havent requested this resource yet, request the resource and set up
    // a deferred object so we don't request it a million times.
    licenses[resourceName] = {};
    licenses[resourceName]['promiseObject'] = defer.promise();

    _$.get( generateRequestUrl(resourceName) ).always(function (data) {
      licenses[resourceName]['data'] = data['license'] || null;
      defer.resolve( licenses[resourceName] );
    });
  } else if ( licenses[resourceName]['promiseObject'].state() == 'pending' ) { 
    // we have already requested the resouce, and it's pending, 
    // resolve with the promise object.
    return licenses[resourceName]['promiseObject'];
  } else {
    // we have already requested the resource, and it resolved already,
    // resolve with the data.
    defer.resolve( licenses[resourceName] );
  }

  return defer.promise();
}

const appendLicenseTermsOfUse = function() {
  var _$resources = _$('.results-db-name');

  _$.each( _$resources, function() {
    var resourceName = _$(this).text().trim();
    var _$resource = _$(this);

    getLicense(resourceName).then(function(data) {
      var license = data['data'];
      if ( license !== null ) {
        // a pretty hacky way to prevent the bug where it links twice.
        if ( !_$resource.text().includes('[License Terms of Use]') ) {
          _$resource.append('<a style="margin-left:0.4rem" href="' + license['license-uri'] + '" target="_blank">[License Terms of Use]</a>');
        }
      }
    });
  });
}

// Select the node that will be observed for mutations
const targetNode = document.getElementById('requestStatus');

// Options for the observer (which mutations to observe)
const config = { attributes: true, attributeOldValue: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
  // Use traditional 'for loops' for IE 11
  for (let mutation of mutationsList) {
    if (mutation.type === 'attributes') {
      let requestStatus = document.getElementById('requestStatus').value;
      if (requestStatus === "FINISHED") {
        console.log('requestStatus attributes observer triggered');
        appendLicenseTermsOfUse();
      }
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

const targetNode2 = document.querySelector('[ui-view="searchResults"]');
const config2 = { childList: true };
const callback2 = function(mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      console.log('childList observer triggered');
      appendLicenseTermsOfUse();
    }
  }
}
const observer2 = new MutationObserver(callback2);
observer2.observe(targetNode2, config2);
