'use strict';

define(['angular-animate', 'angular-loading-bar', 'ciandt-components-dialogs', 'ciandt-components-loading-directives'], function () {

    angular.module('ciandt.components.loading', ['ngAnimate', 'angular-loading-bar', 'ciandt.components.loading.directives', 'ciandt.components.dialogs']).constant('ciandt.components.loading.LoadingConfig', {
        enableInfoAfterResponse: false,
        infoAfterResponseMessage: 'Operação realizada com sucesso.',
        enableLoadingBar: true,
        enableLoadingBlock: false,
    }).factory('ciandt.components.loading.LoadingInterceptor', ['$q', '$injector', '$timeout', 'ciandt.components.loading.LoadingConfig', function ($q, $injector, $timeout, LoadingConfig) {
        var alertHelper;
        if (LoadingConfig.enableInfoAfterResponse) {
            alertHelper = $injector.get('ciandt.components.dialogs.AlertHelper');
        }
        return {
            request: function (config) {
                var showLoadingModalDefined = angular.isDefined(config.showLoadingModal) || angular.isDefined(config.headers.showLoadingModal) || (angular.isDefined(config.params) && angular.isDefined(config.params.showLoadingModal));
                var showLoadingModal = config.showLoadingModal || config.headers.showLoadingModal || (config.params && config.params.showLoadingModal);

				if (angular.isUndefined(config.ignoreLoadingBar)) {
                    config.ignoreLoadingBar = !LoadingConfig.enableLoadingBar;
                }

                if ((showLoadingModalDefined && showLoadingModal) || (!showLoadingModalDefined && LoadingConfig.enableLoadingBlock)) {
                    $timeout(function () {
                        var $http = $injector.get('$http');
                        if ($http.pendingRequests.length > 0) {
                            $('#loadingModal').modal('show');
                        }
                    }, 300);
					config.ignoreLoadingBar = true;
                }

                return config;
            },
            response: function (response) {
                $('#loadingModal').modal('hide');
                if (LoadingConfig.enableInfoAfterResponse && (response.headers()['content-type'] && response.headers()['content-type'].toUpperCase().indexOf('JSON') >= 0) && (response.config.method.toUpperCase() != 'GET')) {
                    alertHelper.addInfo(LoadingConfig.infoAfterResponseMessage);
                }
                return response || $q.when(response);
            },
            responseError: function (rejection) {
                $('#loadingModal').modal('hide');
                return $q.reject(rejection);
            }
        }
    }]).config(['$httpProvider', function ($httpProvider) {
        // configura interceptor para capturar erros de requisição http
        var $log = angular.injector(['ng']).get('$log');
        $log.info('Registrando mecanismo de loading.');
        // coloca este interceptor para ser executado primeiro, pra garantir que o loading-bar seja depois e o ignoreLoadingBar funcionar
        var _0 = $httpProvider.interceptors[0];
        $httpProvider.interceptors[0] = 'ciandt.components.loading.LoadingInterceptor';
        $httpProvider.interceptors.push(_0);
    }]);

});