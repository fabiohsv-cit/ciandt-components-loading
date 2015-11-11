"use strict";

(function (factory) {
    if (typeof define === 'function') {
        define(['angular'], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.loading.directives';
        }
        return factory();
    }
}(function() {

    angular.module("jedi.loading.directives", []).directive("jdLoading", [function () {
        return {
            restrict: 'E',
            templateUrl: function (elem, attrs) {
                if (attrs.templateUrl) {
                    return attrs.templateUrl;
                } else {
                    return "assets/libs/ng-jedi-loading/loading.html";
                }
            }
        };
    }]);

}));