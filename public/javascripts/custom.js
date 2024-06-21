$(document).ready(function(){
    $('.slideshow').slick({
      dots: false,
      arrows: true,
      infinite: false,
      speed: 500,
      // slidesToShow: 4,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 4,
          }
        }
      ]
    });

    $(".loginInfo").click(function(event){
      var submenu = $('.hide');
      submenu.toggle();
      event.stopPropagation();
    });

    $(".menu_sec a").click(function(event){
      event.stopPropagation(); 
    });

    $(document).click(function() {
      var submenu = $('.hide');
      if (submenu.is(":visible")) {
          submenu.hide();
      }
    });

    // 클립보드 복사 이벤트
    $(".copy_to_clipboard").click (function(event) {
      console.log("copy_to_clipboard")
        event.preventDefault();
        var copyText = $(this).data('copy-text');
  
        console.log(copyText)
        copyToClipboard(copyText);
        $("#confirm").css("display", "block");
        $("#confirm .title").append("Copied to clipboard: " + copyText);
    });
  
    function copyToClipboard(text) {
        var tempInput = $("<input>");
        $("body").append(tempInput);
        tempInput.val(text).select();
        document.execCommand("copy");
        tempInput.remove();
    }
});




 