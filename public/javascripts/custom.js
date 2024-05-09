$(document).ready(function(){
    $('.slideshow').slick({
      dots: false,
      arrows: true,
      infinite: true,
      speed: 500,
    //   slidesToShow: 4,
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
  });