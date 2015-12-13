let Templates = {
  home: require('../templates/home.html'),
  getStarted: require('../templates/pages/get_started.html'),
  libs: require('../templates/pages/libs.html'),
  login: require('../templates/pages/login.html')
};

angular.module('updateme', ['ngAnimate', 'ngMaterial', 'ngAria', 'ngRoute', 'angular-loading-bar'])
.config(function($httpProvider, $mdThemingProvider, $compileProvider, $locationProvider, $routeProvider) {
  $httpProvider.defaults.headers.common['X-CSRF-Token'] =
    document.querySelector('meta[name=csrf-token]').content;

  $httpProvider.interceptors.push(function(Me) {
    return {
      request(config) {
        config.headers.Authorization = Me.attrs.token;

        if (typeof config.data == 'object') {
          config.data = _.mapKeys(config.data, (_v, k) => _.snakeCase(k));
        }

        return config;
      },
      response(response) {
        if (typeof response.data == 'object') {
          response.data = _.mapKeys(response.data, (_v, k) => _.camelCase(k));
        }

        return response;
      }
    };
  });

  $mdThemingProvider.theme('default')
    .primaryPalette('light-blue', { default: '800' })
    .accentPalette('amber')
    .warnPalette('deep-orange');

  $compileProvider.debugInfoEnabled(false);

  $locationProvider.html5Mode(true);

  let requireUser = {
    canAccess: ['$q', 'Me', ($q, Me) => {
      return Me.attrs.token ? $q.resolve(true) : $q.reject();
    }]
  };

  $routeProvider
    .when('/', { templateUrl: Templates.home })
    .when('/get-started', { templateUrl: Templates.getStarted, resolve: requireUser })
    .when('/libs/:libType', { templateUrl: Templates.libs, resolve: requireUser })
    .when('/login', { templateUrl: Templates.login })
    .otherwise({ redirectTo: '/' });
})
.run(function($rootScope, $location) {
  $rootScope.$on('$routeChangeError', function() {
    $location.url('/login');
  });
})
.factory('Preload', function($cacheFactory) {
  return $cacheFactory('Preload');
})
.directive('jsonPreload', function(Preload) {
  return {
    restrict: 'A',
    scope: false,
    compile(elem, attrs) {
      Preload.put(attrs.jsonPreload, JSON.parse(elem.html()));
    }
  };
});

require('./user');

require('./models/lib');
require('./models/subscription');

require('./components/get_started');
require('./components/libs');
require('./components/login');
require('./components/profile');

require('./utils/local_storage');
require('./utils/quick_toast');
require('./utils/oauth');
