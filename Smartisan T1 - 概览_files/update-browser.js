(function BrowserUpgrade(){
  var pixelRatio = window.devicePixelRatio || 1;
  var ua = window.navigator.userAgent.toLowerCase();
  //ie 11 safari 9
  if( (/(iPhone|iPod|Android|ios|ipad|Windows Phone|SymbianOS)/gi).test(ua) && (window.innerWidth <= 736 && (screen.width <= 736 || pixelRatio >= 2))){
    if(!/chrome/.test(ua) && /Version\/[0-8]{1}\.[\s\S]*Safari/i.test(ua)){
        window.location.href = '//www.smartisan.com/docs/update-browser-wap.html';
      }
  } else {
    if (/msie/.test(ua) || /Macintosh[\s\S]*Version\/[0-8]{1}\.[\s\S]*Safari/i.test(ua)) {
        window.location.href = '//www.smartisan.com/docs/update-browser-web.html';
    }
    
  }
  
})();
