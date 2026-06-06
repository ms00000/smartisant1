/*9/10/2021, 3:38:24 PM smartisan*/
/**
 * @pagescroll.js page scroll
 * @author wanghuijun(wanghuijun@smartisan.com)
 */
'use strict';
appsServices
    .factory('PageScroll', ['$window', function($window) {

        // 检测当前浏览器是否为IE
        // 返回：
        //     true  IE浏览器
        //     false 其他浏览器
        var checkIE = function() {
            var ua = window.navigator.userAgent.toLowerCase();
            var msie = ua.indexOf('msie');
            var maxthon = ua.indexOf('maxthon/');
            var trident = ua.indexOf('trident/');
            if (msie > 0 || trident > 0 || maxthon > 0) {
                return true;
            } else {
                return false;
            }
        };

        var element = {};

        var elementInit = function() {
            element = {
                header: $('.header'),
                footer: $('.footer'),
                section: $('.page-product:last .product-pumel'),
                wrapper: $('.wrapper'),
                pagination: $('.progress-nav:last'),
                pross: $('.product-nav-slide'),
                _window: $(window)
            };
        };

        var paginationTip = [],
            endIndex = 0,
            endTop = 0,
            sectionLength = 0,
            isLast = false,
            isFooter = false,
            // isInit          = false,
            // 动画进行的标识
            isRunning = false,
            paginationList = '<div class="progress-nav"><ul></ul></div>',
            paginationTemplate = '<li><a><span class="dot"></span><span class="dot-stroke"></span><span class="progress-nav-text"></span></a></li>';


        // 右侧分页
        var pagination = {

            init: function() {
                var me = this;

                if (!element.pagination.length) {
                    $('body').append(paginationList);
                    element.pagination = $('.progress-nav');
                }

                sectionLength = element.section.length;
                for (var i = 0; i < sectionLength; i++) {
                    // 按钮旁边显示的文字
                    var tip = paginationTip[i] || '';
                    $(paginationTemplate).appendTo($('.progress-nav').find('ul')).find('.progress-nav-text').text(tip);
                }

                me.position();
                me.addListener();
            },

            remove: function() {
                if (element.pagination) {
                    element.pagination.remove();
                }
            },

            show: function() {
                element.pagination.fadeIn(300);
            },

            hide: function() {
                element.pagination.fadeOut(300);
            },

            position: function() {
                var index = endIndex - 1;
                if (index < 0) {
                    index = 0;
                }
                element.pagination.find('li').removeClass('active');
                element.pagination.find('li').eq(index).addClass('active');
            },

            addListener: function() {
                element.pagination.find('li').on('click', function(event) {
                    if ($(this).hasClass('active')) {
                        return false;
                    };

                    // 向下滚动一屏为 -1
                    var delta = -(($(this).index() + 1) - endIndex);

                    if (delta !== 0) {
                        scrollAnimation(delta);
                    }

                    // TODO
                    // 这里通过CSS的方式可以优化
                    // 为了跨屏切换时动画效果一致
                    // afterMove(endIndex+1, '1');
                    // afterMove(endIndex-1, '-1');
                });
            },

            toggle: function() {
                var me = this;

                me.position();

                if (endIndex > element.section.length) {
                    me.hide();
                } else {
                    me.show();
                }
            },

            // @param Array text
            setTip: function(text) {
                paginationTip = text;
            }

        };

        // 计算滚动之后wrapper的top值
        var updateTop = function() {
            // footer 比 pagination 的 index 大
            isFooter = (endIndex == element.section.length + 1);
            var headerHeight = element.header.height();
            var footerHeight = element.footer.height();
            var windowHeight = element._window.height();

            if (endIndex === 0) {
                endTop = 0;
            } else if (endIndex > element.section.length) {
                endTop = (endIndex - 2) * windowHeight + headerHeight + footerHeight;
            } else {
                endTop = (endIndex - 1) * windowHeight + headerHeight;
            }
        };

        var resize = function() {
            if (!checkIE()) {
                var windowHeight = element._window.height();

                $('html, body').height(windowHeight);
                element.section.height(windowHeight);

                // 重新计算endTop
                updateTop();

                element.wrapper.css({
                    'webkitTransition': '0s',
                    'webkitTransform': 'translate3d(0px, -' + endTop + 'px, 0px)',
                    '-moz-transform': 'translate3d(0px, -' + endTop + 'px, 0px)',
                    '-moz-transition': '0s'
                });

                // hack
                $('.hero .product-pumel-image img').attr('height', windowHeight - 300);
            }
        };

        var init = function() {
            endIndex = 0;
            elementInit();

            page.init();

            // isInit = true;

            if (!checkIE()) {

                pagination.init();

                //针对mac平台浏览器overflow调整
                if (navigator.userAgent.indexOf('Mac') > 0) {
                    $('html, body').addClass('mac-hidden');
                } else {
                    $('html, body').addClass('hidden');
                }

                // 添加事件监听
                $(document).on('mousewheel', mouseWheelHandle);
                // TODO 触屏效果以后加
                touchHandler.addTouchHandler();
                // TODO
                $(window).on('scroll', stopMouseSelectScroll);
                // 禁止鼠标中键点击出现方向图标
                $(document).on('mousedown', stopMouseWheelClick);

                // fix.imagePositon();
                // imagePositonReset();
                // 这句没有用，mouseWheelHandle 已经执行 preventDefault
                // $(document).on('mousewheel', ctrlMousewheel);
            } else {
                $(".new .product-pumel-image").css({
                    "opacity": "1"
                });
                $(".humane .product-pumel-image").css({
                    "opacity": "1"
                });
            }

            resize();
            $(window).on('resize', resize);
        };

        var reset = function() {

            // isInit = false;
            elementInit();

            pagination.remove();

            if (!checkIE()) {
                $('html, body').removeClass('mac-hidden hidden');
                $('html, body').removeAttr('style');

                $(document).unmousewheel(mouseWheelHandle);
                touchHandler.removeTouchHandler();
                $(window).off('scroll', stopMouseSelectScroll);
                // $(document).off("mousewheel",ctrlMousewheel);
                $(window).off('resize', resize);
                $(document).off('mousedown', stopMouseWheelClick);
            }

            subNav.hide();

            element.wrapper.removeAttr('style');
        };

        var mouseWheelHandle = function(event, delta) {
            event.preventDefault();

            // 每次只滚动一屏
            if (delta > 0) {
                delta = 1;
            } else {
                delta = -1;
            }

            scrollAnimation(delta);
        };

        var updateIndex = function(delta) {
            // delta -1 页面向上，滚轮向下，滚动条向下
            if (delta < 0) {
                if (endIndex <= element.section.length) {
                    endIndex += Math.abs(delta);
                }
            } else {
                if (endIndex > 0) {
                    endIndex -= Math.abs(delta);
                }
            }
        };

        var scrollAnimation = function(delta) {
            if (isRunning) {
                return;
            }
            isRunning = true;
            setTimeout(function() {
                isRunning = false;
            }, 1500);

            // 这里的每一部分，都提取为单独的方法

            // delta -1 页面向上，滚轮向下
            // 取消原有事件监听，延迟绑定
            // $(document).off('mousewheel', mouseWheelHandle);
            // touchHandler.removeTouchHandler();
            // element.pagination.find('ul li').off('click', dotClick);
            // setTimeout(function(){
            //     if (!isInit) {
            //         return;
            //     }

            //     $(document).on('mousewheel', mouseWheelHandle);
            //     touchHandler.addTouchHandler();
            //     element.pagination.find('ul li').on('click', dotClick);
            // }, 1500);

            // 更新 endIndex
            updateIndex(delta);
            // 更新 endTop
            updateTop();

            // 执行动画
            transformPage(endTop, endIndex, delta);

            // sub nav
            subNav.toggle();

            // pagination
            pagination.toggle();
        };

        var transformPage = function(pos, endIndex, delta) {
            // delta -1 页面向上，滚轮向下
            if (endIndex === 0 || (endIndex === 1 && delta < 0)) {
                // 0-1或者1-0的动画
                $('.wrapper').css({
                    'webkitTransform': 'translate3d(0px, -' + pos + 'px, 0px)',
                    'webkitTransition': 'all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                    '-moz-transform': 'translate3d(0px, -' + pos + 'px, 0px)',
                    '-moz-transition': 'all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)'
                });
            } else {
                $('.wrapper').css({
                    'webkitTransform': 'translate3d(0px, -' + pos + 'px, 0px)',
                    'webkitTransition': 'all 1000ms cubic-bezier(0.860, 0.000, 0.070, 1.000)',
                    '-moz-transform': 'translate3d(0px, -' + pos + 'px, 0px)',
                    '-moz-transition': 'all 1000ms cubic-bezier(0.860, 0.000, 0.070, 1.000)'
                });
            }

            // 每一屏内部的滚动效果
            // afterMove(endIndex);
            page.transition(endIndex, delta);
        };

        var subNav = {
            toggle: function() {
                var me = this;

                subNav.bgSwitch(endIndex);

                if (endIndex === 0) {
                    me.hide();
                } else {
                    me.show();
                }
            },
            // switch background
            bgSwitch: function(endIndex) {
                var dark = element.section.eq(endIndex - 1).attr('data-layout');

                if (dark == 'false') {
                    element.pross.removeClass('header-dark');
                } else if (dark == 'true') {
                    element.pross.addClass('header-dark');
                }
            },
            show: function() {
                element.pross.addClass('transition').addClass('show');
            },
            hide: function() {
                element.pross.removeClass('transition').removeClass('show');
            }
        };

        var page = {
            section: null,

            init: function() {
                var me = this;

                me.section = element.section;
                me.prepare();
            },

            prepare: function() {
                var me = this;
                var len = me.section.length;

                for (var i = 0; i < len; i++) {
                    var current = me.section[i];
                    var timer = (i === 0) ? 0 : 500;

                    current.timer = timer;
                };
            },

            transition: function(endIndex, delta) {
                var me = this;
                var index = (endIndex - 1 < 0) ? 0 : (endIndex - 1);
                var current = me.section[index];

                // 从 footer 返回时不重新 active
                if (!((endIndex == me.section.length) && delta > 0)) {
                    $(current).removeClass('active');
                }

                if (endIndex >= 1 && current) {
                    setTimeout(function() {
                        $(current).addClass('active');
                    }, current.timer);
                }
            }
        };

        var afterMove = function() {};

        var setAfterMove = function(func) {
            afterMove = func;
        };

        var stopMouseWheelClick = function(event) {
            if (event.which == 2) {
                return false;
            }
        };

        var stopMouseSelectScroll = function() {
            if (!touchHandler.isTablet) {
                $(window).scrollTop(0);
            } else {
                return;
            }
        };

        // var imagePositonReset = function() {};

        // var setImageFunction = function(func) {
        //     imagePositonReset = func;
        // };


        var touchHandler = {
            isTablet: navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone|Tizen|Bada)/),
            touchStartX: 0,
            touchStartY: 0,
            touchEndX: 0,
            touchEndY: 0,
            touchSensitivity: 5,
            addTouchHandler: function() {
                if (touchHandler.isTablet) {
                    $(document).on('touchstart MSPointerDown', touchHandler.touchStartHandler);
                    $(document).on('touchmove MSPointerMove', touchHandler.touchMoveHandler);
                    // $(document).off('touchstart MSPointerDown touchmove MSPointerMove',touchHandler.epreventDefault); 
                }
            },
            removeTouchHandler: function() {
                if (touchHandler.isTablet) {
                    // $(document).on('touchstart MSPointerDown touchmove MSPointerMove',touchHandler.epreventDefault);
                    $(document).off('touchstart MSPointerDown', touchHandler.touchStartHandler);
                    $(document).off('touchmove MSPointerMove', touchHandler.touchMoveHandler);
                }
            },
            // epreventDefault: function(event){
            //     event.preventDefault();
            // },
            touchMoveHandler: function(event) {
                var e = event.originalEvent;
                var touchEvents = touchHandler.getEventsPage(e);
                if (e.targetTouches.length > 1) {
                    return
                }
                if (e.targetTouches.length == 1) {
                    touchHandler.touchEndY = touchEvents['y'];
                    touchHandler.touchEndX = touchEvents['x'];
                    if (Math.abs(touchHandler.touchStartY - touchHandler.touchEndY) > ($(window).height() / 1000 * touchHandler.touchSensitivity)) {
                        if (touchHandler.touchStartY > touchHandler.touchEndY) {
                            var d = -1;
                        } else if (touchHandler.touchEndY > touchHandler.touchStartY) {
                            var d = 1;
                        }
                    }
                    if (d) {
                        mouseWheelHandle(event, d);
                    }
                }
            },
            touchStartHandler: function(event) {
                var e = event.originalEvent;
                var touchEvents = touchHandler.getEventsPage(e);
                touchHandler.touchStartY = touchEvents['y'];
                touchHandler.touchStartX = touchEvents['x'];
            },
            getEventsPage: function(e) {
                var events = new Array();
                if (window.navigator.msPointerEnabled) {
                    events['y'] = e.pageY;
                    events['x'] = e.pageX;
                } else {
                    events['y'] = e.touches[0].pageY;
                    events['x'] = e.touches[0].pageX;
                }
                return events;
            }
        };

        return {
            checkIE: checkIE,
            init: init,
            reset: reset,
            setPaginationTip: pagination.setTip,
            // setImageFunction: setImageFunction,
            setAfterMove: setAfterMove
        };
    }]);

/**
 * @directives.js 自定义指令
 * @author wanghuijun(wanghuijun@smartisan.cn)
 */

'use strict';

appsDirectives.
directive('heightResponse', ['$rootScope', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            if (elm) {
                // 横竖屏切换，监听height改变
                scope.$watch('height', function(newVal, oldVal) {
                    elm.css({
                        height: newVal + 'px'
                    });
                });
            }
        }
    };
}]);
/**
 * @main.js 概览
 * @author heichenxuan@smartisan.com
 */
'use strict';

appsControllers
    .controller('MainCtrl', ['$rootScope', '$scope', '$location', '$window', 'Utils', 'Account', 'Message', 'BaseInfo', 'CartReBuildService',
        function($rootScope, $scope, $location, $window, Utils, Account, Message, BaseInfo, CartReBuildService) {

            var CART_TIPS = {
                'threshold': '购物车已达最大购买限制，请删除过期商品'
            };

            /**
             * 购物车悬停菜单对象
             */
            $rootScope.cartMenu = {};
            $rootScope.cartOrder = {};

            /**
             * $(window).on('message', Message.handler);
             *
             * 1. 监听 iframe 的 postMessage.
             * 2. 目前在 Message 模块中仅有 logout 方法有订阅事件响应。
             */
            $(window).on('message', function(event) {
                Message.handler(event)
            });

            /**
             * 1. 对购物车商品做添加, 删除, 同步。
             */
            $rootScope.$on('cart', function(event, msg) {
                var strName = msg['name'];
                var oSku = msg['sku'];
                var num = msg['num'] || 1;
                var isCover = msg['isCover'];
                var batchType = msg['batchType'];
                var strAttachId = msg['attach'];
                var isMobile = msg['isMobile'];
                var callback = msg['callback'];
                var timer = null;

                if (strName) {
                    switch (strName) {
                        case 'sync':
                            CartReBuildService.fetch().then(function(res) {
                                CartReBuildService.bind(res.data);
                            });
                            break;
                        case 'singleDel':
                            CartReBuildService.singleDel(oSku, strAttachId, isMobile).then(function(res) {
                                CartReBuildService.bind(res.data);

                                if (res.bomb) {
                                    Utils.openDialog({
                                        message: CART_TIPS.threshold
                                    });
                                } else {
                                    callback && callback();
                                }
                            });
                            break;
                        case 'buy':
                            CartReBuildService.buy();
                            break;
                        case 'empty':
                            CartReBuildService.clean();
                            callback && callback();
                            break;
                    }
                }
            });

            // 校验登录, 获取用户基础信息。
            BaseInfo.update();

            // 登录
            $scope.login = function() {
                BaseInfo.update().then(function() {
                    $rootScope.isLoggedIn = true;
                }, function() {
                    Account.login();
                })
            };

            // 退出登录, 在 iframe 中做 postMessage 的响应。
            $scope.logout = function() {
                Account.logout();
            };

            // 切换语言由相应指令操作 UI 部分, 只里只做 Cookie 值的改写。
            $scope.changeLangCookies = Utils.changeLangCookies;

            //当前所在页面 与 currentLocation比较
            $scope.isActive = function(currentLocation) {
                return currentLocation === $location.path();
            };

            $scope.headerScroll = function() {
                var header = $('.t1-mobile-header');
                $(window).on('scroll', function() {
                    var height = $(window).scrollTop() + 35;
                    $('.main section').each(function() {
                        var self = $(this);
                        var top = self.offset().top;
                        var color = self.data('color');
                        if (height > top) {
                            if (color && color != "") {
                                if (color == 'white') {
                                    header.addClass('nav-white');
                                } else {
                                    header.removeClass('nav-white');
                                }
                            }

                        }
                    })
                });
            }

            var resetHeight = function() {
                // $(window).width()  在微信下有问题
                var width = document.documentElement.clientWidth || document.body.clientWidth;

                $scope.height = width * 1578 / 1080;
            };

            $window.onresize = function() {
                resetHeight();
                $scope.$apply();
            };
            resetHeight();
        }
    ]);
/**
 * @design.js 概览
 * @author wanghuijun(wanghuijun@smartisan.com) on 15/2/4.
 */
'use strict';

appsControllers
    .controller('designCtrl', ['$scope', 'PageScroll', 'Utils', function($scope, PageScroll, Utils) {

        PageScroll.setPaginationTip(['简约，源自隐藏的精密', '让你的左右，不被产品左右', '以柔韧，构建硬朗', '平坦的本质，是极致的曲面', '不适感，导致了全新的舒适', '喜悦的封装与还原', '']);

        // PageScroll.setImageFunction(imagePositonReset);

        PageScroll.init();

        $('.phone-gallery .gallery-prev,.phone-gallery .gallery-next').on('click', phoneGallery);

        var index = 0;

        function phoneGallery(event) {
            var ele = $('.package-gallery .gallery-collection li'),
                length = ele.length;

            if ($(this).attr('class') == 'gallery-prev') {
                index = (index - 1 < 0) ? length - 1 : index - 1;
            } else {
                index = (index + 1 > length - 1) ? 0 : index + 1;
            }

            ele.eq(index).addClass('show').siblings().removeClass('show');
        }

    }]);
/**
 * @features.js 功能
 * @author wanghuijun(wanghuijun@smartisan.com) on 15/2/4.
 */
'use strict';

appsControllers
    .controller('featuresCtrl', ['$scope', 'PageScroll', 'Utils', function($scope, PageScroll, Utils) {
        var featureEvent = {
            index: 0,
            initFn: function() {
                $('.toggle-nav a').on('click', featureEvent.slideView);
                $('.phone-gallery .gallery-prev,.phone-gallery .gallery-next').on('click', featureEvent.phoneGallery);
            },

            slideView: function(event) {
                event.preventDefault();

                $(this).addClass('active').parent().siblings().find('a').removeClass('active');
                var $parentUl = $(this).parent().parent('.toggle-nav'),
                    index = $parentUl.find('a').index(this);

                var destiDom = $parentUl.siblings('.slide-view').find('.slide-view-item').eq(index);

                destiDom.addClass('show').find('h1').css({
                    'WebkitTransition': 'all 1.8s ease .5s',
                    '-moz-transition': 'all 1.8s ease .5s'
                }).addClass('show');
                destiDom.addClass('show').find('h2').css({
                    'WebkitTransition': 'all 1.8s ease .5s',
                    '-moz-transition': 'all 1.8s ease .5s'
                }).addClass('show');
                destiDom.find('p').css({
                    'WebkitTransition': 'all 2.2s ease 1s',
                    '-moz-transition': 'all 2.2s ease 1s'
                }).addClass('show');
                destiDom.siblings().removeClass('show').find('h1').css({
                    'WebkitTransition': 'all 1s ease 0s',
                    '-moz-ransition': 'all 1s ease 0s'
                }).removeClass('show');
                destiDom.siblings().removeClass('show').find('h2').css({
                    'WebkitTransition': 'all 1s ease 0s',
                    '-moz-ransition': 'all 1s ease 0s'
                }).removeClass('show');
                destiDom.siblings().find('p').css({
                    'WebkitTransition': 'all 1s ease 0s',
                    '-moz-ransition': 'all 1s ease 0s'
                }).removeClass('show');
            },

            phoneGallery: function(event) {
                var ele = $(this).siblings('.gallery-collection').find('li'),
                    length = ele.length;

                if ($(this).attr('class') == 'gallery-prev') {
                    featureEvent.index = (featureEvent.index - 1 < 0) ? length - 1 : featureEvent.index - 1;
                } else {
                    featureEvent.index = (featureEvent.index + 1 > length - 1) ? 0 : featureEvent.index + 1;
                }
                ele.eq(featureEvent.index).addClass('show').siblings().removeClass('show');
                $(this).siblings('.photo-detail').find('a').attr('href', ele.eq(featureEvent.index).attr('data-url'));
            }
        };

        featureEvent.initFn();

    }]);
/**
 * @os.js 功能
 * @author wanghuijun(wanghuijun@smartisan.com) on 15/2/4.
 */
'use strict';

appsControllers
    .controller('osCtrl', ['$scope', 'PageScroll', 'Utils', function($scope, PageScroll, Utils) {}]);
/**
 * @overview.js 概览
 * @author wanghuijun(wanghuijun@smartisan.com) on 15/2/4.
 */
'use strict';

appsControllers
    .controller('overviewCtrl', ['$scope', 'PageScroll', 'Utils', '$rootScope', function($scope, PageScroll, Utils, $rootScope) {

        PageScroll.setPaginationTip(['主页', '设计', '功能', '操作系统']);
        $rootScope.productLinkActive = 'overview';

        PageScroll.init();
    }]);
/**
 * @specs.js 技术规格
 * @author wanghuijun(wanghuijun@smartisan.com) on 15/2/4.
 */
'use strict';

appsControllers
    .controller('specsCtrl', ['$rootScope', '$scope', 'PageScroll', 'Utils', function($rootScope, $scope, PageScroll, Utils) {
        var detailEvent = {
            initFn: function() {
                $('.color-option-black,.color-option-white').on({
                    'mouseover': detailEvent.mouseover,
                    'mouseout': detailEvent.mouseout,
                    'click': detailEvent.click
                });
            },

            mouseover: function(e) {
                e.preventDefault();

                if ($(this).find('.selected').is(':hidden')) {
                    if (PageScroll.checkIE()) {
                        $(this).find('.hover').show();
                    } else {
                        $(this).find('.hover').animate({
                            'opacity': '1'
                        }, {
                            queue: !1
                        });
                    }
                }
            },

            mouseout: function(e) {
                if (PageScroll.checkIE()) {
                    $(this).find('.hover').hide();
                } else {
                    $(this).find('.hover').animate({
                        'opacity': '0'
                    }, {
                        queue: !1
                    });
                }
            },

            click: function(e) {
                $(this).find('.selected').fadeIn(300);
                $(this).siblings().find('.selected').fadeOut(300);

                var checkBoswer = PageScroll.checkIE();
                if (window.navigator.userAgent.toLowerCase().indexOf('trident/7.0') > 0) {
                    checkBoswer = false;
                }

                var $productDetail = $('.product-detail-banner-bg');
                var $productParameter = $('.product-parameter-bg');

                if ($(this).hasClass('color-option-white') && $productDetail.hasClass('black')) {
                    $productDetail.removeClass('black').addClass('white');
                    $productParameter.removeClass('black').addClass('white');
                } else if ($(this).hasClass('color-option-black') && $productDetail.hasClass('white')) {
                    $productDetail.removeClass('white').addClass('black');
                    $productParameter.removeClass('white').addClass('black');
                }
            }

        };


        $rootScope.productLinkActive = 'specs';
        detailEvent.initFn();

    }]);

/**
 * @design.js
 * @author wanghuijun(wanghuijun@smartisan.cn)
 */

appsControllers.
controller('design-mobileCtrl', ['$scope', 'Utils', function($scope, Utils) {

    $('.t1-mobile-header').addClass('nav-white');
    $scope.headerScroll();
}]);
/**
 * @feature.js
 * @author wanghuijun(wanghuijun@smartisan.cn)
 */

appsControllers.
controller('features-mobileCtrl', ['$scope', 'Utils', function($scope, Utils) {

    $scope.headerScroll();

    $('.t1-mobile-header').addClass('nav-white');

}]);
/**
 * @os.js
 * @author wanghuijun(wanghuijun@smartisan.cn)
 */

appsControllers.
controller('os-mobileCtrl', ['$scope', 'Utils', function($scope, Utils) {

    $scope.headerScroll();

    $('.t1-mobile-header').addClass('nav-white');

}]);
/**
 * @overview.js 概览
 * @author wanghuijun(wanghuijun@smartisan.cn)
 */

appsControllers.
controller('overview-mobileCtrl', ['$scope', 'Utils', function($scope, Utils) {

    $scope.headerScroll();
    $('.t1-mobile-header').addClass('nav-white');


}]);
/**
 * @detail.js
 * @author wanghuijun(wanghuijun@smartisan.cn)
 */

appsControllers.
controller('specs-mobileCtrl', ['$rootScope', '$scope', 'Utils', function($rootScope, $scope, Utils) {

    // 设置英文 title
    if ($rootScope.lang == "en") {
        Utils.setTitle("Smartisan T1 - Tech Specs");
    }

    $scope.headerScroll();

    $('.t1-mobile-header').removeClass('nav-white');

    $('.detail .color-option .select-black').click(function() {
        $('.specs-mobile .product-black').animate({
            opacity: '1'
        }, 800);
        $('.specs-mobile .product-white').animate({
            opacity: '0'
        }, 800);

        $(this).addClass('active');
        $('.specs-mobile .select-white').removeClass('active');

        $('.specs-mobile .detail').removeClass("white-on");
        $('.specs-mobile .detail').addClass("black-on");

    });
    $('.detail .color-option .select-white').click(function() {
        $('.specs-mobile .product-white').animate({
            opacity: '1'
        }, 800);
        $('.specs-mobile .product-black').animate({
            opacity: '0'
        }, 800);

        $(this).addClass('active');
        $('.specs-mobile .select-black').removeClass('active');

        $('.specs-mobile .detail').removeClass("black-on");
        $('.specs-mobile .detail').addClass("white-on");

    });

}]);
/**
 * @OrderService.js 商品 Service
 * @author shenghanqin(shenghanqin@smartisan.com)
 */

'use strict';

appsServices.factory('OrderService', ['$q', 'StorageService', function($q, StorageService) {
    /**
     * @author XuChen 
     * @name Goods
     * @class GoodsService
     */

    function Order() {
        self.OrderParseService = null;
        self.CartService = null;
        self.OrderCollection = null;
        self.StorageService = null;
    };

    /**
     * 创建临时订单
     * @type Function
     * @param {JSON}           data             数据
     * @param {Array}          data.carts       商品 model 数组
     * @param {Object}         data.suitGoods   套餐
     */
    Order.prototype.createTempOrder = function(data) {
        var self = this;
        // 拼接新版 checkout 结构
        var checkout = {};

        // 生成 key value 形式的 goodsInfo, sku: count
        for (var i = 0; i < data.normalGoods.length; i++) {
            var oGoods = data.normalGoods[i];

            checkout[oGoods.id] = {
                checked: true,
                skuId: oGoods.id,
                count: oGoods.num,
                subItems: {},
            }
        }

        // 套餐
        if (data.suitGoods && data.suitGoods.skuId) {
            checkout[data.suitGoods.skuId] = {
                checked: true,
                skuId: data.suitGoods.skuId,
                count: data.suitGoods.num,
                subItems: {}
            }

            angular.forEach(data.suitGoods.items, function(oGoods) {
                checkout[data.suitGoods.skuId].subItems[oGoods.skuId] = {
                    skuId: oGoods.skuId,
                    count: oGoods.num,
                    checked: true
                }
            });
        }

        self.removeCache(function() {
            StorageService.set('CHECKOUT', checkout, {
                useCookie: false,
                domain: '.smartisan.com'
            });
        });

        var delay = $q.defer();
        delay.resolve();
        return delay.promise;
    };

    /**
     * 创建临时订单
     * @type Function
     * @param {JSON}           data                        数据
     * @param {String}         data.mobile_id         [可选]所要购买的手机 SKU
     * @param {String}         data.pay_type               支付类型 [1.预售, 2.全款]
     * @param {String}         data.id                [可选]cookie id
     * @param {String}         data.safety1           [可选]意外保修服务
     * @param {String}         data.safety2           [可选]延长保修服务
     */
    Order.prototype.completeTempOrder = function(data) {
        var self = this,
            order = $.extend({}, data, {
                mobileGoods: [data.mobile_id]
            });

        order.id = order.id || ('to' + (new Date()).getTime());

        data.safety1 && order.mobileGoods.push(data.safety1);
        data.safety2 && order.mobileGoods.push(data.safety2);

        // delete data.mobile_id;
        // delete data.safety1;
        // delete data.safety2;

        // 默认数量为1
        order.mobileGoods.push(1);

        order.mobileGoods = order.mobileGoods.join(':');

        self.removeCache(function() {
            StorageService.set(orderID, order, {
                useCookie: true,
                domain: '.smartisan.com'
            });
        });

        var delay = $q.defer();
        delay.resolve(order);
        return delay.promise;
    }

    /**
     * 清除所有订单 cookie
     * @type Function
     */
    Order.prototype.removeCache = function(callback) {
        var self = this;

        var caches = $.cookies.filter('CHECKOUT');

        var exp = new Date();
        exp.setTime(exp.getTime() - 1);

        $.each(caches, function(key, value) {
            StorageService.remove(key, {
                domain: '.smartisan.com',
                expires: exp
            });
        });

        typeof callback == 'function' && callback();
    }

    return (new Order())
}]);