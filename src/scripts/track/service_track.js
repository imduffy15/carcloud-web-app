'use strict';

carcloudApp.factory('Track', function ($resource, API_DETAILS) {
    return $resource(API_DETAILS.baseUrl + 'app/rest/tracks/:id', {}, {
        'query': {method: 'GET', isArray: true},
        'get': {method: 'GET'}
    });
});
