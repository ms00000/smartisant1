/*9/10/2021, 3:38:24 PM smartisan*/
/**
 * @t1 smartisan T1
 * @author zhengjia(zhengjia@smartisan.com)
 */
var apps = angular.module('apps', [
    'ngRoute',
    // 'ngRetina',
    'ngTouch',
    'apps.directives',
    'apps.services',
    'apps.controllers',
    'apps.filters',
    'templates',
    'ngCollection',
    'ng-translation'
]);

var appsServices = angular.module('apps.services', ['ngCookies']);
var appsControllers = angular.module('apps.controllers', []);
var appsDirectives = angular.module('apps.directives', []);
var appsFilters = angular.module('apps.filters', []);

apps.config([
    '$locationProvider',
    '$routeProvider',
    'ngTranslationProvider',
    'NavigatorProvider',
    function($locationProvider, $routeProvider, ngTranslationProvider, NavigatorProvider) {

        // ngTranslationProvider
        //     .setDirectory('lang')
        //     .setFilesSuffix('.json')
        //     .langsFiles({
        //         en: 'en',
        //         jp: 'jp',
        //         cn: 'cn'
        //     })
        //     .fallbackLanguage('cn');

        // 首页
        // $routeProvider.when('/', {
        //     title:'Smartisan',
        //     templateUrl: 'view/html/home.html',
        //     controller: 'homeCtrl'
        // });

        NavigatorProvider.init();
        // console.log(NavigatorProvider.language);

        if (NavigatorProvider.language == 'cn') {
            // 概览
            $routeProvider.when('/overview', {
                title: '概览',
                templateUrl: 'view/html/overview.html',
                controller: 'overviewCtrl',
                pageClass: 'overview'
            });
            $routeProvider.when('/overview-mobile', {
                title: '概览',
                templateUrl: 'view/html/overview-mobile.html',
                controller: 'overview-mobileCtrl',
                pageClass: 'overview-mobile'
            });
            $routeProvider.otherwise({
                redirectTo: '/overview'
            });
        } else {
            // 技术规格
            $routeProvider.when('/specs', {
                title: '技术规格',
                templateUrl: 'view/html/specs.html',
                controller: 'specsCtrl',
                pageClass: 'specs'
            });
            $routeProvider.when('/specs-mobile', {
                title: '技术规格',
                templateUrl: 'view/html/specs-mobile.html',
                controller: 'specs-mobileCtrl',
                pageClass: 'specs-mobile'
            });
            $routeProvider.otherwise({
                redirectTo: '/specs'
            });
        }

        var isIE = function(ver) {
            var b = document.createElement('b')
            b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->'
            return b.getElementsByTagName('i').length === 1
        }
        // 果该模块需要html5Mode(true),需要在打包处配置，这里为了开发方便设置为false
        if (!isIE(9) && !isIE(8)) {
            $locationProvider.html5Mode(false);
        }

    }
]);


apps.run([
    '$rootScope',
    '$route',
    '$location',
    '$window',
    'PageScroll',
    'Utils',
    'ngTranslation',
    'Language',
    'TitleBar',
    function($rootScope, $route, $location, $window, PageScroll, Utils, ngTranslation, Language, TitleBar) {
        if (Utils.isMobile()) {
            $rootScope.isMobile = true;
        }

        Language.init();

        // ngTranslation.use(
        //     $rootScope.lang
        // );

        $rootScope.isT1 = 1;
        $rootScope.$on('$routeChangeStart', function(event, current, previous) {
            $rootScope.loading = true;
            $rootScope.moduleName = "t1";

            PageScroll.reset();

            //真正的移动设备（这里将pad 视为非移动）
            if (Utils.isMobile()) {

                if ($location.path().indexOf("mobile") <= 0) {
                    //跳转到移动页面
                    $location.path($location.path() + "-mobile").replace();
                }

                $rootScope.currentPage = $location.path();
            } else {

                if ($location.path().indexOf("mobile") > 0) {
                    //当前浏览器不是移动版，但是他又是访问的 mobile，重新跳转到 PC 版
                    $location.path($location.path().replace("-mobile", "")).replace();
                }
            }

            if (navigator.userAgent.indexOf("AppleWebKit") >= 0 && navigator.userAgent.indexOf("Chrome") < 0) {
                // 解决 safari 从 overview 页面到 os 时 back-top 的 header 上
                var back = $(".back-top");
                back.removeClass('back-top');
                setTimeout(function() {
                    back.addClass('back-top');
                });
            }
        });

        $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
            // 移动端导航设置
            TitleBar.setOptions({
                aside: ' '
            });

            //设置导航，并且设置当前页
            if ($rootScope.lang == 'en') {
                Utils.setTitle('Smartisan T1 - Tech Specs');
            } else if ($rootScope.lang == 'jp') {
                Utils.setTitle('Smartisan T1 - スペック');
            } else {
                Utils.setTitle('Smartisan T1 - 概览');
            }

            Utils.setTitle("Smartisan T1", $route.current.title);

            $rootScope.loading = false;
            $rootScope.pageClass = $route.current.pageClass;

            // header 高亮
            Utils.setHeaderActive('t1');

        });
    }
]);