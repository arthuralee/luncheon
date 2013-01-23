/*!
* jquery.plugin.pullToRefresh.js
* version 1.0
* author: Damien Antipa
* https://github.com/dantipa/pull-to-refresh-js
*/
(function( $ ){

	$.fn.pullToRefresh = function( options ) {

		var isTouch = !!('ontouchstart' in window),
			cfg = $.extend(true, {
			  message: {
				pull: '',
				release: '',
				loading: '<div class="bubblingG spinner large"><span id="bubblingG_1"></span><span id="bubblingG_2"></span><span id="bubblingG_3"></span></div>'
				}
			}, options),
			html = '<div class="pull-to-refresh">' +
				'<div class="icon"></div>' +
				'<div class="message">' +
					'<i class="arrow"></i>' +
					//'<span class="pull">' + cfg.message.pull + '</span>' +
					//'<span class="release">' + cfg.message.release + '</span>' +
					'<span class="loading">' + cfg.message.loading + '</span>' +
				  '</div>' +
				'</div>';



		return this.each(function() {
			if (!isTouch) {
				return;
			}

			var e = $(this).prepend(html),
				content = e.find('.wrap'),
				ptr = e.find('.pull-to-refresh'),
				arrow = e.find('.arrow'),
				spinner = e.find('.spinner'),
				pull = e.find('.pull'),
				release = e.find('.release'),
				loading = e.find('.loading'),
				ptrHeight = ptr.height(),
				arrowDelay = ptrHeight / 3 * 2,
				isActivated = false,
				isLoading = false;

			content.on('touchstart', function (ev) {
				if (e.scrollTop() === 0) { // fix scrolling
					e.scrollTop(1);
				}
			}).on('drag touchmove', function (ev) {
				var top = e.scrollTop(),
					deg = 180 - (top < -ptrHeight ? 180 : // degrees to move for the arrow (starts at 180° and decreases)
						  (top < -arrowDelay ? Math.round(180 / (ptrHeight - arrowDelay) * (-top - arrowDelay)) 
						  : 0));

				if (isLoading) { // if is already loading -> do nothing
					return true;
				}

				arrow.show();
				
				//spinner.hide();

				if (-top > ptrHeight) { // release state
					arrow.css('transform', 'rotate(180deg)'); // move arrow

					release.css('opacity', 1);
					pull.css('opacity', 0);
					loading.css('opacity', 0);
					
					isActivated = true;
				} else if (top > -ptrHeight) { // pull state
					arrow.css('transform', 'rotate(0deg)'); // move arrow
					release.css('opacity', 0);
					loading.css('opacity', 0);
					pull.css('opacity', 1);

					isActivated = false;
				}
			}).on('touchend', function(ev) {
				var top = e.scrollTop();

				arrow.css('transform', 'rotate(0deg)'); // move arrow
				
				if (isActivated) { // loading state
					isLoading = true;
					isActivated = false;

					ptr.css({'position':'static'});
					ptr.css({'height':'23px'});
					loading.css('opacity', 1);
					spinner.show();
					arrow.hide();
					release.css('opacity', 0);
					pull.css('opacity', 0);


					cfg.callback().done(function() {
						ptr.animate({
							height: 0
						}, 'fast', 'linear', function () {
							ptr.css({
								position: 'absolute',
								height: ptrHeight
							});
							isLoading = false;
						});
					});
				}
			});
		});

	};
})( jQuery );
