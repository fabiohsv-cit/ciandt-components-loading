    angular.module('jedi.loading', ['ngAnimate', 'angular-loading-bar', 'jedi.loading.directives', 'jedi.dialogs']).constant('jedi.loading.LoadingConfig', {
        enableInfoAfterResponse: false,
        infoAfterResponseMessage: 'Operação realizada com sucesso.',
        enableLoadingBar: true,
        enableLoadingBlock: false,
        templateUrl: "assets/libs/ng-jedi-loading/loading.html"
    }).factory('jedi.loading.LoadingInterceptor', ['$q', '$injector', '$timeout', 'jedi.loading.LoadingConfig', function($q, $injector, $timeout, LoadingConfig) {
        var alertHelper;
        var loadingModalCounter = 0;
        if (LoadingConfig.enableInfoAfterResponse) {
            alertHelper = $injector.get('jedi.dialogs.AlertHelper');
        }
        
        var modalHelper, $modalInstance;
        return {
            request: function(config) {
                var showLoadingModalDefined = angular.isDefined(config.showLoadingModal) || angular.isDefined(config.headers.showLoadingModal) || (angular.isDefined(config.params) && angular.isDefined(config.params.showLoadingModal));
                var showLoadingModal = config.showLoadingModal || config.headers.showLoadingModal || (config.params && config.params.showLoadingModal);

                if (angular.isUndefined(config.ignoreLoadingBar)) {
                    config.ignoreLoadingBar = !LoadingConfig.enableLoadingBar;
                }

                if ((showLoadingModalDefined && showLoadingModal) || (!showLoadingModalDefined && LoadingConfig.enableLoadingBlock)) {
                    if (!modalHelper) {
                        // Load modal lazily to avoid circular dependency
                        modalHelper = $injector.get('jedi.dialogs.ModalHelper');
                    }
                    
                    $modalInstance = modalHelper.open(LoadingConfig.templateUrl, undefined, undefined, undefined, {
                        windowTemplateUrl: LoadingConfig.templateUrl,
                        backdrop: 'static',
                        keyboard: false,
                        windowClass: 'alert-modal-window'
                    });
                    
                    loadingModalCounter++;
                    config.openLoadingModal = true;
                }

                return config;
            },
            requestError: function(rejection) {
                if (rejection.config.openLoadingModal) {
                    loadingModalCounter--;
                    if (loadingModalCounter === 0) {
                        $modalInstance.dismiss();
                    }
                }

                return $q.reject(rejection);
            },
            response: function(response) {
                if (response.config.openLoadingModal) {
                    loadingModalCounter--;
                    if (loadingModalCounter === 0) {
                        $modalInstance.dismiss();
                    }
                }

                if (LoadingConfig.enableInfoAfterResponse && (response.headers()['content-type'] && response.headers()['content-type'].toUpperCase().indexOf('JSON') >= 0) && (response.config.method.toUpperCase() !== 'GET')) {
                    alertHelper.addInfo(LoadingConfig.infoAfterResponseMessage);
                }
                return response || $q.when(response);
            },
            responseError: function(rejection) {
                if (rejection.config.openLoadingModal) {
                    loadingModalCounter--;
                    if (loadingModalCounter === 0) {
                        $modalInstance.dismiss();
                    }
                }

                return $q.reject(rejection);
            }
        };
    }]).config(['$httpProvider', function($httpProvider) {
        // configura interceptor para capturar erros de requisição http
        var $log = angular.injector(['ng']).get('$log');
        $log.info('Configure jedi loading.');

        // coloca este interceptor para ser executado primeiro, pra garantir que o loading-bar seja depois e o ignoreLoadingBar funcionar
        $httpProvider.interceptors.unshift('jedi.loading.LoadingInterceptor');
    }]);