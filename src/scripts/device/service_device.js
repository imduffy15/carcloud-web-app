'use strict';

carcloudApp.factory('Device', function ($resource, API_DETAILS) {
    return $resource(API_DETAILS.baseUrl + 'app/rest/devices/:id', {}, {
        'query': {method: 'GET', isArray: true},
        'get': {method: 'GET'},
        'update': {method: 'PUT'}
    });
});

carcloudApp.factory('Alert', function ($resource, API_DETAILS) {
    return $resource(API_DETAILS.baseUrl + 'app/rest/alerts/:id', {}, {
        'query': {method: 'GET', isArray: true},
        'get': {method: 'GET'},
        'update': {method: 'PUT'}
    });
});
