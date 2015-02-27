'use strict';

/* App Module */
var httpHeaders;

var carcloudApp = angular.module('carcloudApp', ['http-auth-interceptor', 'ngResource', 'ngRoute',
    'ngCookies', 'hateoas', 'angular-loading-bar', 'ngAnimate', 'LocalStorageModule', 'base64', 'ui.bootstrap'
]);

carcloudApp
    .config(function ($routeProvider, $httpProvider, $sceDelegateProvider, cfpLoadingBarProvider,
                      localStorageServiceProvider, HateoasInterceptorProvider, API_DETAILS, USER_ROLES) {
        $routeProvider
            .when('/register', {
                templateUrl: 'templates/register.html',
                controller: 'RegisterController',
                access: {
                    authorities: [USER_ROLES.all]
                }
            })
            .when('/login', {
                templateUrl: 'templates/login.html',
                controller: 'LoginController',
                access: {
                    authorities: [USER_ROLES.all]
                }
            })
            .when('/error', {
                templateUrl: 'templates/error.html',
                access: {
                    authorities: [USER_ROLES.all]
                }
            })
            .when('/settings', {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsController',
                access: {
                    authorities: [USER_ROLES.user]
                }
            })
            .when('/password', {
                templateUrl: 'templates/password.html',
                controller: 'PasswordController',
                access: {
                    authorities: [USER_ROLES.user]
                }
            })
            .when('/metrics', {
                templateUrl: 'templates/metrics.html',
                controller: 'MetricsController',
                access: {
                    authorities: [USER_ROLES.admin]
                }
            })
            .when('/logout', {
                templateUrl: 'templates/main.html',
                controller: 'LogoutController',
                access: {
                    authorities: [USER_ROLES.user]
                }
            })
            .when('/docs', {
                templateUrl: 'templates/docs.html',
                access: {
                    authorities: [USER_ROLES.user]
                }
            })
            .otherwise({
                templateUrl: 'templates/main.html',
                controller: 'MainController',
                access: {
                    authorities: [USER_ROLES.all]
                }
            });

        HateoasInterceptorProvider.transformAllResponses();
        httpHeaders = $httpProvider.defaults.headers;

        cfpLoadingBarProvider.includeBar = true;
        cfpLoadingBarProvider.includeSpinner = true;
        cfpLoadingBarProvider.latencyThreshold = 500;

        localStorageServiceProvider.setPrefix("CarCloud");

    })
    .run(function ($rootScope, $location, $http, AuthenticationService, Session, USER_ROLES,
                   Token) {

        $rootScope.userRoles = USER_ROLES;

        $rootScope.$on('$routeChangeStart', function (event, next) {
            $rootScope.authenticated = !!Session.get();
            $rootScope.account = Session.get();

            $rootScope.isAuthorized = AuthenticationService.isAuthorized;

            if (Token.get()) {
                httpHeaders.common['Authorization'] = 'Bearer ' + Token.get().accessToken;
            }

            AuthenticationService.valid(next.access.authorities);
        });

        // Call when the the client is confirmed
        $rootScope.$on('event:auth-loginConfirmed', function (data) {
            $rootScope.authenticated = true;
            if ($location.path() === "/login") {
                var search = $location.search();
                if (search.redirect !== undefined) {
                    $location.path(search.redirect).search('redirect', null).replace();
                } else {
                    $location.path('/').replace();
                }
            }
        });

        // Call when the 401 response is returned by the server
        $rootScope.$on('event:auth-loginRequired', function (rejection) {
            Token.invalidate();
            Session.invalidate();
            if ($location.path() !== "/" && $location.path() !== "" && $location.path()
                !== "/register"
                && $location.path() !== "/login") {
                var redirect = $location.path();
                $location.path('/login').search('redirect', redirect).replace();
            }
        });

        // Call when the 403 response is returned by the server
        $rootScope.$on('event:auth-notAuthorized', function (rejection) {
            $rootScope.errorMessage = 'errors.403';
            $location.path('/error');
        });

        // Call when the user logs out
        $rootScope.$on('event:auth-loginCancelled', function () {
            $location.path('');
        });
    });
