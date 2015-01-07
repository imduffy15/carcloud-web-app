'use strict';

carcloudApp.factory('Device', function ($resource, API_DETAILS) {
    return $resource(API_DETAILS.baseUrl + 'app/rest/devices/:id', {}, {
        'query': {method: 'GET', isArray: true},
        'get': {method: 'GET'},
        'update': {method: 'PUT'}
    });
});
