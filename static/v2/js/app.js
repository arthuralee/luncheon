$(document).ready(function(){
	// resize content
	var viewheight = document.documentElement.clientHeight;
	$("#content").css({height: viewheight - 44 + "px"});

	// pull to refresh
	$('.scrollable').pullToRefresh({
		callback: function() {
			var def = $.Deferred();

			setTimeout(function() {
				def.resolve();      
			}, 3000); 

			return def.promise();
		}
	});

	// touchable buttons
	$('#btn-exit')
		.hammer()
		.bind('touchstart', function(e) {
			$(this).addClass('touched');
		})
		.bind('release', function(e) {
			$(this).removeClass('touched');
			var iframe = document.createElement("IFRAME");
		    iframe.setAttribute("src", "nativejs:reloadUIWebView");
		    document.documentElement.appendChild(iframe);
		    iframe.parentNode.removeChild(iframe);
		    iframe = null;
		});

	// for telephoning
	$('#userlist li')
		.hammer()
		.bind('touchstart', function(e) {
			$(this).addClass('touched');
		})
		.bind('drag release', function(e) {
			$(this).removeClass('touched');
		})
		.bind('tap', function(e) {
			window.location = 'tel:' + $(this).attr('data-tel');
		});

});