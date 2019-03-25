/*CUSTOM SLIDER*/

// feedback slider

$(document).ready(function() {

    var owl = $("#slider-feedback");
    owl.owlCarousel({
        dots: true,
        loop:true,
        autoplay:true,
        autoplayHoverPause:true,
        nav: true,
        items:3,
        margin:10,
        navText:['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
        responsive:{
            0:{
                items:1
            },
            600:{
                items:2
            },
            1000:{
                items:3
            }
        }
    });
});


// sort table
$(document).ready(function() {
    $('.table-product').DataTable( {
        "order": [[ 4, "asc" ]]
    });
} );

// Menu main

$(document).ready(function(){
    $('span.bar').click(function(){
        $('nav.menu-main ul.level-1').slideToggle();
    });
});

