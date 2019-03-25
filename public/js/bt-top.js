 $(document).ready(function() {
	$(".btn-top").hide();
	// back top
		if($(".btn-top").length > 0){
			$(window).scroll(function () {
				var e = $(window).scrollTop();
				if (e > 350) {
					$(".btn-top").show()
				} else {
					$(".btn-top").hide()
				}
			});
			$(".btn-top").click(function () {
				$('body,html').animate({
					scrollTop: 0
			})
		})
	}

});


 $(document).ready(function(){
 	$('.sidebar .area-content-tab:not(:first)').hide();

 	$(".sidebar-tab ul li a").click(function(){
 		$(".sidebar-tab ul li a").parent().removeClass("active-tab");
 		$(this).parent('li').addClass("active-tab");
 		$('.area-content-tab').hide();

 		var activeTab = $(this).attr('href');
		$(activeTab).slideToggle();

		return false;

 	});

 });
