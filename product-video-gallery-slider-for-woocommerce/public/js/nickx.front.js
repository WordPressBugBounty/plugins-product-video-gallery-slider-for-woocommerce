(function ($) { $.fn.touchwipe = function (settings) { var config = { min_move_x: 20, min_move_y: 20, wipeLeft: function () { }, wipeRight: function () { }, wipeUp: function () { }, wipeDown: function () { }, preventDefaultEvents: true }; if (settings) $.extend(config, settings); this.each(function () { var startX; var startY; var isMoving = false; function cancelTouch() { this.removeEventListener('touchmove', onTouchMove); startX = null; isMoving = false } function onTouchMove(e) { if (config.preventDefaultEvents) { e.preventDefault() } if (isMoving) { var x = e.touches[0].pageX; var y = e.touches[0].pageY; var dx = startX - x; var dy = startY - y; if (Math.abs(dx) >= config.min_move_x) { cancelTouch(); if (dx > 0) { config.wipeLeft() } else { config.wipeRight() } } else if (Math.abs(dy) >= config.min_move_y) { cancelTouch(); if (dy > 0) { config.wipeDown() } else { config.wipeUp() } } } } function onTouchStart(e) { if (e.touches.length == 1) { startX = e.touches[0].pageX; startY = e.touches[0].pageY; isMoving = true; this.addEventListener('touchmove', onTouchMove, false) } } if ('ontouchstart' in document.documentElement) { this.addEventListener('touchstart', onTouchStart, false) } }); return this } })(jQuery);
function parseURL(url) {
	url.match(/(http:|https:|)\/\/(player.|www.|m.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);
	if (RegExp.$3.indexOf('youtu') > -1) {
		var type = 'youtube';
	} else if (RegExp.$3.indexOf('vimeo') > -1) {
		var type = 'vimeo';
	}
	return { type: type, id: RegExp.$6 };
}
const nquery = jQuery;
function onYouTubePlayerStateChange(event) {
	if (event.data == 0) {
		if (wc_prd_vid_slider_setting.nickx_lic && wc_prd_vid_slider_setting.nickx_videoloop == 'yes') {
			playPauseVideo("play");
			nquery('.overlay-div').show();
		} else if (wc_prd_vid_slider_setting.nickx_sliderautoplay == 'yes') {
			window.slideWrapper.slideNext();
			window.slideWrapper.autoplay.start();
			nquery('.overlay-div').css({ display: '' });
		}
	}
	if (wc_prd_vid_slider_setting.nickx_sliderautoplay == 'yes') {
		if (event.data == 2) {
			window.slideWrapper.autoplay.start();
			nquery('.overlay-div').css({ display: '' });
		}
		if (event.data == 1 || event.data == 3) {
			window.slideWrapper.autoplay.stop();
			nquery('.overlay-div').css({ display: '' });
		}
	}
}
var prd_yt_player = [];
var prd_vimeo_players = {};
var vimeo_programmatic_pause_count = 0;
function nickx_bind_yt_players() {
	if (typeof YT !== 'undefined' && YT.Player) {
		nquery('.product_video_iframe[video-type="youtube"]').each(function () {
			var elem = this;
			if (!nquery(elem).data('yt_player_bound')) {
				nquery(elem).data('yt_player_bound', true);
				try {
					new YT.Player(elem, {
						events: {
							'onStateChange': onYouTubePlayerStateChange
						}
					});
				} catch (err) {
					console.log('YT Player init error:', err);
				}
			}
		});
	}
}
function onYouTubeIframeAPIReady() {
	nickx_bind_yt_players();
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
function postMessageToPlayer(player, command) {
	if (player == null || command == null) return;
	player.contentWindow.postMessage(JSON.stringify(command), "*");
}
var nickx_user_interacted = false;
if (typeof nquery !== 'undefined') {
	nquery(document).one('click touchstart keydown pointerdown', function (e) {
		if (e.originalEvent) {
			nickx_user_interacted = true;
		} else {
			nickx_user_interacted = false;
		}
	});
}
function playPauseVideo(control) {
	let player = nquery('.tc_video_slide.nswiper-slide-active').find('.product_video_iframe').get(0);
	switch (nquery(player).attr('video-type')) {
		case "vimeo":
			var vimeo_player = nquery(player).data('vimeo_player');
			if (!vimeo_player) {
				vimeo_player = new Vimeo.Player(player);
				nquery(player).data('vimeo_player', vimeo_player);
			}
			if (control === 'play') {
				vimeo_player.setLoop(wc_prd_vid_slider_setting.nickx_videoloop == 'yes');

				if (wc_prd_vid_slider_setting.nickx_sliderautoplay == 'yes') {
					vimeo_player.off('play');
					vimeo_player.off('playing');
					vimeo_player.off('pause');
					vimeo_player.off('ended');

					vimeo_programmatic_pause_count = 0;
					vimeo_player.on('play', function () {
						window.slideWrapper.autoplay.stop();
						nquery('.overlay-div').css({ display: '' });
					});
					vimeo_player.on('playing', function () {
						window.slideWrapper.autoplay.stop();
						nquery('.overlay-div').css({ display: '' });
					});
					vimeo_player.on('pause', function () {
						if (vimeo_programmatic_pause_count > 0) {
							vimeo_programmatic_pause_count--;
							return;
						}
						window.slideWrapper.autoplay.start();
						nquery('.overlay-div').css({ display: '' });
					});
					if (wc_prd_vid_slider_setting.nickx_videoloop != 'yes') {
						vimeo_player.on('ended', function () {
							nquery('.overlay-div').css({ display: '' });
							window.slideWrapper.slideNext();
							window.slideWrapper.autoplay.start();
						});
					}
				}
				vimeo_player.setVolume(nickx_user_interacted ? 1 : 0);
				vimeo_player.play();
			} else {
				vimeo_programmatic_pause_count++;
				vimeo_player.pause();
				if (wc_prd_vid_slider_setting.nickx_sliderautoplay == 'yes') {
					window.slideWrapper.autoplay.start();
				}
			}
			break;
		case "youtube":
			if (control === 'play') {
				postMessageToPlayer(player, {
					"event": "command",
					"func": "playVideo"
				});
				if (nickx_user_interacted) {
					postMessageToPlayer(player, { "event": "command", "func": "unMute" });
				} else {
					postMessageToPlayer(player, { "event": "command", "func": "mute" });
				}
			} else {
				postMessageToPlayer(player, {
					"event": "command",
					"func": "pauseVideo"
				});
			}
			break;
		case "html5":
			if (control === 'play') {
				if (nickx_user_interacted) {
					player.muted = false;
				} else {
					player.muted = true;
				}
				player.play();
			} else {
				player.pause();
			}
			if (wc_prd_vid_slider_setting.nickx_sliderautoplay == 'yes') {
				player.onplaying = function () {
					slideWrapper.autoplay.stop();
					nquery('.overlay-div').css({ display: '' });
				};
				player.onplay = function () {
					slideWrapper.autoplay.stop();
					nquery('.overlay-div').css({ display: '' });
				};
				player.onpause = function () {
					slideWrapper.autoplay.start();
					nquery('.overlay-div').css({ display: '' });
				};
				player.onended = function () {
					nquery('.overlay-div').show();
					if (wc_prd_vid_slider_setting.nickx_lic && wc_prd_vid_slider_setting.nickx_videoloop == 'yes') {
						player.play();
					} else {
						slideWrapper.slideNext();
						slideWrapper.autoplay.start();
					}
				};
			}
			break;
		case "iframe":
			if (control == "pause") {
				nquery(player).attr('src', nquery(player).attr('src'));
			}
			break;
	}
}
(function (nquery) {
	let initial_main_wrapper = '';
	let initial_thumb_wrapper = '';
	let initial_main_src = '';
	let initial_main_zoom = '';
	let initial_main_srcset = '';
	let initial_thumb_src = '';
	let initial_thumb_srcset = '';
	if (nquery('.nickx-slider-for .nswiper-wrapper').length) {
		initial_main_wrapper = nquery('.nickx-slider-for .nswiper-wrapper').html();
	}
	if (nquery('.nickx-slider-nav .nswiper-wrapper').length) {
		initial_thumb_wrapper = nquery('.nickx-slider-nav .nswiper-wrapper').html();
	}
	if (nquery('.zoom.nswiper-slide .wp-post-image').length) {
		initial_main_src = nquery('.zoom.nswiper-slide .wp-post-image').attr('src');
		initial_main_zoom = nquery('.zoom.nswiper-slide .wp-post-image').attr('data-zoom-image');
		initial_main_srcset = nquery('.zoom.nswiper-slide .wp-post-image').attr('srcset');
	}
	if (nquery('.nickx-slider-nav .wp-post-image-thumb img').length) {
		initial_thumb_src = nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('src');
		initial_thumb_srcset = nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('srcset');
	}
	function nickx_set_zoom_img() {
		if (wc_prd_vid_slider_setting.nickx_show_zoom != 'off') {
			if (wc_prd_vid_slider_setting.nickx_show_zoom == 'yes' || nquery(window).width() < 768) {
				nquery('.nickx-slider-for .nswiper-slide').zoom({ magnify: wc_prd_vid_slider_setting.nickx_zoomlevel });
				nquery('.nickx-slider-for .nswiper-slide-active').zoom({ magnify: wc_prd_vid_slider_setting.nickx_zoomlevel });
			} else {
				nquery('.zoomWindowContainer,.zoomContainer').remove();
				var $activeImage = nquery('.nickx-slider.nickx-slider-for .nswiper-slide-active img');
				if ($activeImage.length) {
					$activeImage.closest('.nswiper-slide-active').css('transform', 'none');
					$activeImage.elevateZoom({ zoomType: wc_prd_vid_slider_setting.nickx_show_zoom, cursor: "crosshair", borderSize: 1, containLensZoom: 1, scrollZoom: 1, zoomLevel: wc_prd_vid_slider_setting.nickx_zoomlevel, zoomWindowHeight: 550, zoomWindowWidth: 550, zoomWindowOffetx: 10 });
				}
			}
		}
	}
	function get_YT_Id(url) {
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		var match = url.match(regExp);
		if (match && match[2].length == 11) {
			return match[2];
		} else {
			return 'error';
		}
	}
	function get_Vimeo_Embed_Url(url) {
		if (!url) return '';
		if (url.indexOf('player.vimeo.com/video/') > -1) {
			return url;
		}
		var match = url.match(/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/i);
		if (match && match[1]) {
			var embed_url = 'https://player.vimeo.com/video/' + match[1];
			var queryIndex = url.indexOf('?');
			if (queryIndex > -1) {
				var queryStr = url.substring(queryIndex);
				embed_url += queryStr;
			}
			return embed_url;
		}
		return url;
	}
	function nickx_variations_image_reset() {
		nquery('.zoom.nswiper-slide .wp-post-image').attr('data-zoom-image', nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_zoom-image'));
		nquery('.zoom.nswiper-slide .wp-post-image').attr('src', nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_src'));
		nquery('.zoom.nswiper-slide.woocommerce-product-gallery__image span.nickx-popup').attr('href', nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_zoom-image'));
		nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('src', nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('data-o_src'));
		if (nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('srcset')) {
			nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('srcset', nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('data-o_srcset'));
		}
		if (nquery('.zoom.nswiper-slide .wp-post-image').attr('srcset')) {
			nquery('.zoom.nswiper-slide .wp-post-image').attr('srcset', nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_srcset'));
		}
	}
	nquery(document).ready(function () {
		setIframeHeight();
		nquery('span.nickx-popup_trigger').click(function (e) {
			nquery('.nswiper-slide-active span.nickx-popup').click();
		});
		if (nquery('.nickx-slider-for').length > 0) {
			let nickx_default_main_wrapper = initial_main_wrapper || nquery('.nickx-slider-for .nswiper-wrapper').html();
			let nickx_default_thumb_wrapper = initial_thumb_wrapper || nquery('.nickx-slider-nav .nswiper-wrapper').html();
			let nickx_has_variation_custom_slides = false;
			let slider_autoplay = (wc_prd_vid_slider_setting.nickx_sliderautoplay == 'yes') ? true : false;
			let infinitescroll = (wc_prd_vid_slider_setting.nickx_arrowinfinite == 'yes') ? true : false;
			let slider_arrow = (wc_prd_vid_slider_setting.nickx_arrowdisable == 'yes') ? true : false;
			let slider_arrow_thumb = (wc_prd_vid_slider_setting.nickx_arrow_thumb === 'yes') ? true : false;
			let sliderfade = (wc_prd_vid_slider_setting.nickx_sliderfade == 'yes') ? 'fade' : 'slide';
			let nickx_rtl = (wc_prd_vid_slider_setting.nickx_rtl == '1') ? true : false;
			let adaptiveHeight = (wc_prd_vid_slider_setting.nickx_adaptive_height == 'yes') ? true : false;
			let nickx_variation_selector = (wc_prd_vid_slider_setting.nickx_variation_selector == 'document') ? document : wc_prd_vid_slider_setting.nickx_variation_selector;
			if (wc_prd_vid_slider_setting.nickx_show_lightbox != 'yes') {
				nquery('a.nickx-popup').remove();
			}
			var slide_count = nquery('.images.nickx_product_images_with_video .zoom, .images.nickx_product_images_with_video .tc_video_slide').length;
			if (wc_prd_vid_slider_setting.nickx_hide_thumbnails == 'yes' || (wc_prd_vid_slider_setting.nickx_hide_thumbnail == 'yes' && slide_count <= 1)) {
				nquery('.nickx-slider-nav').remove();
			}
			var sliderlayout = (slide_count > 1 || wc_prd_vid_slider_setting.nickx_hide_thumbnail != 'yes') ? wc_prd_vid_slider_setting.nickx_slider_layout : 'horizontal';
			var verticalslider = (sliderlayout == 'horizontal' && sliderlayout != '') ? 'horizontal' : 'vertical';

			if (verticalslider == 'vertical' && wc_prd_vid_slider_setting.nickx_slider_responsive == 'yes' && window.innerWidth < 767) {
				verticalslider = 'horizontal';
			}
			let slider_thumbs = false;
			if (wc_prd_vid_slider_setting.nickx_hide_thumbnails != 'yes' && nquery('.nickx-slider-nav').length > 0) {
				if (wc_prd_vid_slider_setting.nickx_thumnails_layout == 'slider') {
					slider_thumbs = new nSwiper('.nickx-slider-nav', {
						slidesPerView: parseInt(wc_prd_vid_slider_setting.nickx_thumbnails_to_show),
						watchSlidesProgress: true,
						centeredSlides: false,
						focusableElements: true,
						spaceBetween: 8,
						freeMode: true,
						direction: verticalslider,
						loop: infinitescroll,
						rtl: nickx_rtl,
						navigation: {
							enabled: slider_arrow_thumb,
							nextEl: ".thumb_arrow.nswiper-button-next",
							prevEl: ".thumb_arrow.nswiper-button-prev",
						},
						allowTouchMove: (slide_count > parseInt(wc_prd_vid_slider_setting.nickx_thumbnails_to_show))
					});
				} else {
					nquery('div#nickx-gallery .nickx-thumbnail').click(function (e) {
						nquery('div#nickx-gallery .nickx-thumbnail').removeClass('nswiper-slide-thumb-active');
						nquery(this).addClass('nswiper-slide-thumb-active');
						var index = nquery("div#nickx-gallery .nickx-thumbnail").index(this);
						slideWrapper.slideToLoop(index);
					});
				}
				nquery(document).off('click.nickxThumbNav', '.nickx-slider-nav .nswiper-slide').on('click.nickxThumbNav', '.nickx-slider-nav .nswiper-slide', function (e) {
					var index = nquery('.nickx-slider-nav .nswiper-slide').index(this);
					if (index !== -1 && window.slideWrapper) {
						window.slideWrapper.slideTo(index);
					}
				});
				nquery('.nswiper-button-next.thumb_arrow').off('click.nickxThumbBtn').on('click.nickxThumbBtn', function (e) {
					e.preventDefault();
					e.stopPropagation();
					slideWrapper.slideNext();
				});
				nquery('.nswiper-button-prev.thumb_arrow').off('click.nickxThumbBtn').on('click.nickxThumbBtn', function (e) {
					e.preventDefault();
					e.stopPropagation();
					slideWrapper.slidePrev();
				});
			}
			const slideWrapper = new nSwiper('.nickx-slider-for', {
				spaceBetween: 10,
				focusableElements: true,
				thumbs: { nswiper: slider_thumbs },
				loop: infinitescroll,
				effect: sliderfade,
				rtl: nickx_rtl,
				autoplay: {
					enabled: slider_autoplay,
					pauseOnMouseEnter: true
				},
				autoHeight: adaptiveHeight,
				slideActiveClass: 'nswiper-slide-active',
				slideDuplicateActiveClass: 'nswiper-slide-duplicate-active',
				watchSlidesProgress: true,
				navigation: {
					enabled: slider_arrow,
					nextEl: ".main_arrow.nswiper-button-next",
					prevEl: ".main_arrow.nswiper-button-prev",
				},
				slidesPerView: 1,
				on: {
					init: function () {
						if (!nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_zoom-image')) {
							nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_zoom-image', initial_main_zoom || nquery('.zoom.nswiper-slide .wp-post-image').attr('data-zoom-image'));
						}
						if (!nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_src')) {
							nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_src', initial_main_src || nquery('.zoom.nswiper-slide .wp-post-image').attr('src'));
						}
						if (!nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('data-o_src')) {
							nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('data-o_src', initial_thumb_src || nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('src'));
						}
						if (nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('srcset') || initial_thumb_srcset) {
							if (!nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('data-o_srcset')) {
								nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('data-o_srcset', initial_thumb_srcset || nquery('.nickx-slider-nav .wp-post-image-thumb img').attr('srcset'));
							}
						}
						if (nquery('.zoom.nswiper-slide .wp-post-image').attr('srcset') || initial_main_srcset) {
							if (!nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_srcset')) {
								nquery('.zoom.nswiper-slide .wp-post-image').attr('data-o_srcset', initial_main_srcset || nquery('.zoom.nswiper-slide .wp-post-image').attr('srcset'));
							}
						}
						setIframeHeight();
						set_nickx_popup_trigger();
						setTimeout(nickx_set_zoom_img, 100);
						setTimeout(equalizeThumbHeights, 800);
					},
					slideChangeTransitionStart: function (nswiper) {
						playPauseVideo('pause');
					},
					slideChange: function (nswiper) {
						setTimeout(nickx_set_zoom_img, 100);
						nickx_set_zoom_img();
						if (wc_prd_vid_slider_setting.nickx_thumnails_layout == 'grid') {
							nquery('div#nickx-gallery .nickx-thumbnail').removeClass('nswiper-slide-thumb-active');
						}
						setTimeout(function (e) {
							set_nickx_popup_trigger();
							if (wc_prd_vid_slider_setting.nickx_thumnails_layout == 'grid') {
								let current = nquery('.nswiper-slide.nswiper-slide-active').attr('data-nswiper-slide-index');
								var active_slide = nquery('div#nickx-gallery .nickx-thumbnail').get(current);
								nquery(active_slide).addClass('nswiper-slide-thumb-active');
							}
							if (wc_prd_vid_slider_setting.nickx_lic && (wc_prd_vid_slider_setting.nickx_videoloop == 'yes' || wc_prd_vid_slider_setting.nickx_vid_autoplay == 'yes')) {
								if (nquery('.tc_video_slide.nswiper-slide-active').length > 0) {
									playPauseVideo("play");
								}
							}
						}, 400);
					}
				}
			});
			window.slideWrapper = slideWrapper;
			window.nickx_video_thumb_cache = window.nickx_video_thumb_cache || {};
			var nickx_video_thumb_cache = window.nickx_video_thumb_cache;

			function nickx_init_videoplayers(callback = 'init_videoplayers') {
				nickx_bind_yt_players();
				nquery('.product_video_iframe').each(function (index, elem) {
					var vtype = nquery(this).attr('video-type');
					if (vtype == 'youtube') {
						let yt_youtube_url = nquery(this).attr('src');
						var iframe_src = get_YT_Id(yt_youtube_url);
						let nocookie = '';
						if (yt_youtube_url.search("nocookie") > 0) {
							nocookie = '-nocookie';
						}
						var $ytIframe = nquery(this);
						nquery(this).parent('div').find('.product_video_iframe_light').attr('href', 'https://www.youtube' + nocookie + '.com/embed/' + iframe_src + '?enablejsapi=1&wmode=opaque&rel=0');
						if (iframe_src && !$ytIframe.attr('data-ratio')) {
							var oembedUrl = 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + iframe_src + '&format=json';
							var ytXhr = new XMLHttpRequest();
							ytXhr.open("GET", oembedUrl, true);
							ytXhr.onload = function () {
								if (ytXhr.readyState === 4 && ytXhr.status === 200) {
									try {
										var oData = JSON.parse(ytXhr.responseText);
										if (oData && oData.width && oData.height) {
											var ytRatio = oData.height / oData.width;
											$ytIframe.attr('data-ratio', ytRatio);
											setIframeHeight();
										}
									} catch (e) { }
								}
							};
							ytXhr.send(null);
						}
						if (nquery('.product_video_img.img_' + index).attr('custom_thumbnail') != 'yes') {
							if (!nickx_video_thumb_cache[iframe_src]) {
								nickx_video_thumb_cache[iframe_src] = 'https://img.youtube.com/vi/' + iframe_src + '/mqdefault.jpg';
							}
							nquery('.product_video_img.img_' + index).attr('src', nickx_video_thumb_cache[iframe_src]);
						}
						if (nquery('#iframe-demo').length == 0) {
							var tag = document.createElement('script');
							tag.id = 'iframe-demo';
							tag.src = 'https://www.youtube.com/iframe_api';
							var firstScriptTag = document.getElementsByTagName('script')[0];
							firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
						}
					}
					if (wc_prd_vid_slider_setting.nickx_lic) {
						if (vtype == 'vimeo') {
							var $vimeoIframe = nquery(this);
							var vimeo_url = $vimeoIframe.attr('src');
							var videoDetails = parseURL(vimeo_url);
							var videoID = videoDetails ? videoDetails.id : '';

							if (videoID) {
								if (nickx_video_thumb_cache[vimeo_url] && nquery('.product_video_img.img_' + index).attr('custom_thumbnail') != 'yes') {
									nquery('.product_video_img.img_' + index).attr('src', nickx_video_thumb_cache[vimeo_url]);
								}
								var xhr = new XMLHttpRequest();
								xhr.open("GET", "https://vimeo.com/api/v2/video/" + videoID + ".json", true);
								xhr.onload = function (e) {
									if (xhr.readyState === 4 && xhr.status === 200) {
										var data = xhr.responseText;
										var parsedData = JSON.parse(data);
										if (parsedData && parsedData[0]) {
											if (parsedData[0].width && parsedData[0].height) {
												var v_ratio = parsedData[0].height / parsedData[0].width;
												$vimeoIframe.attr('data-ratio', v_ratio);
												setIframeHeight();
											}
											if (parsedData[0].thumbnail_large && nquery('.product_video_img.img_' + index).attr('custom_thumbnail') != 'yes') {
												var thumbnail_large = parsedData[0].thumbnail_large;
												var width = nquery('.product_video_img.img_' + index).attr('width') || 100;
												var height = nquery('.product_video_img.img_' + index).attr('height') || 100;
												nickx_video_thumb_cache[vimeo_url] = thumbnail_large.replace("d_640", 'd_' + width + 'x' + height);
												nquery('.product_video_img.img_' + index).attr('src', nickx_video_thumb_cache[vimeo_url]);
											}
										}
									} else {
										console.error(xhr.statusText);
									}
								};
								xhr.send(null);
							}
						}
						if (vtype == 'html5') {
							var vid = this;
							var v_src = nquery(vid).attr('src');
							if (wc_prd_vid_slider_setting.nickx_videoloop == 'yes') {
								nquery(this).attr('loop', 'loop');
							}
							if (nquery('.product_video_img.img_' + index).attr('custom_thumbnail') != 'yes') {
								let video_thumb = nquery('.product_video_img.img_' + index);
								if (nickx_video_thumb_cache[v_src]) {
									video_thumb.attr('src', nickx_video_thumb_cache[v_src]);
								} else {
									let w = parseInt(video_thumb.attr('width')) || 300;
									let h = parseInt(video_thumb.attr('height')) || 300;
									let generateThumb = function () {
										try {
											if (vid.readyState >= 2 && vid.videoWidth > 0 && vid.videoHeight > 0) {
												var canvas = document.createElement('canvas');
												canvas.width = w;
												canvas.height = h;
												var ctx = canvas.getContext('2d');
												ctx.drawImage(vid, 0, 0, w, h);
												var data = canvas.toDataURL("image/jpeg", 0.85);
												if (data && data.length > 500) {
													nickx_video_thumb_cache[v_src] = data;
													video_thumb.attr('src', data);
													return true;
												}
											}
										} catch (err) { }
										return false;
									};

									let onSeeked = function () {
										nquery(vid).off('seeked.nickxThumb');
										if (!generateThumb()) {
											setTimeout(generateThumb, 500);
										}
										try { vid.currentTime = 0; } catch (e) { }
									};
									nquery(vid).off('seeked.nickxThumb loadeddata.nickxThumb')
										.on('seeked.nickxThumb', onSeeked)
										.on('loadeddata.nickxThumb', function () {
											if (vid.currentTime === 0) {
												try { vid.currentTime = 1; } catch (e) { }
											}
										});

									if (vid.readyState >= 2) {
										try { vid.currentTime = 1; } catch (e) { }
									} else {
										try { vid.load(); } catch (e) { }
									}
								}
							}
						}
					}
				});
				if (callback == 'init_videoplayers' && !nickx_has_variation_custom_slides) {
					nickx_default_thumb_wrapper = nquery('.nickx-slider-nav .nswiper-wrapper').html();
				}
				nickx_update_slider_layout();
			}
			nickx_init_videoplayers('init_videoplayers');
			if (nquery('.product_video_iframe').length > 0 && nquery(window).width() < 768) {
				var overlayDiv = '<div class="overlay-div" style="position:absolute; background-color:transparent">';
				var iframe = nquery('.product_video_iframe');
				iframe.parent().append(nquery(overlayDiv).css({
					'top': iframe.offset().top,
					'left': iframe.offset().left,
					"width": iframe.width() + "px",
					"height": iframe.height() + "px"
				}));
				nquery(document).on('click touchstart', function (event) {
					if (nquery(event.target).attr("class") != 'overlay-div' && nquery(event.target).attr("class") != 'product_video_iframe fitvidsignore') nquery('.overlay-div').css({ display: '' });
				});
				nquery('.overlay-div').on('click touchstart', function () { nquery(this).hide(); });
				nquery('.overlay-div').touchwipe({
					wipeLeft: function () { slideWrapper.slideNext(); },
					wipeRight: function () { slideWrapper.slidePrev(); },
					min_move_x: 30,
					min_move_y: 30,
					preventDefaultEvents: true
				});
			}
			if (wc_prd_vid_slider_setting.nickx_arrowcolor != '') {
				nquery(".nswiper-button-next, .nswiper-button-prev").css("color", wc_prd_vid_slider_setting.nickx_arrowcolor);
			}
			if (wc_prd_vid_slider_setting.nickx_arrowbgcolor != '') {
				nquery(".nswiper-button-next, .nswiper-button-prev").css("background", wc_prd_vid_slider_setting.nickx_arrowbgcolor);
			}
			const post_thumb_index = nquery('.nswiper-slide .wp-post-image').parent('.nswiper-slide').attr('data-nswiper-slide-index');
			function nickx_update_slider_layout() {
				nquery('.zoomWindowContainer,.zoomContainer').remove();

				var $navSlider = nquery('.nickx_product_images_with_video.v-left .nswiper.nickx-slider-nav, .nickx_product_images_with_video.v-right .nswiper.nickx-slider-nav');
				if ($navSlider.length > 0 && nquery(window).width() >= 768) {
					var mainWidth = nquery('.nickx-slider-for').outerWidth() || nquery('.nickx-slider-for').width();
					if (mainWidth && mainWidth > 0) {
						$navSlider.css('height', mainWidth + 'px');
					}
				} else {
					$navSlider.css('height', '');
				}

				if (slider_thumbs && slider_thumbs.update) {
					slider_thumbs.update();
				}
				if (slideWrapper && slideWrapper.update) {
					slideWrapper.update();
					if (slideWrapper.updateAutoHeight && wc_prd_vid_slider_setting.nickx_adaptive_height == 'yes') {
						slideWrapper.updateAutoHeight();
					}
				}
				setIframeHeight();
				nickx_set_zoom_img();
				equalizeThumbHeights();
				if (wc_prd_vid_slider_setting.nickx_show_lightbox == 'yes') {
					nquery('[data-nfancybox="product-gallery"]').nfancybox(wc_prd_vid_slider_setting.nfancybox);
				}
			}
			window.nickx_slider = {
				slideWrapper: slideWrapper,
				slider_thumbs: slider_thumbs,
				update_layout: nickx_update_slider_layout,
				variations_image_reset: nickx_variations_image_reset,
				nickx_default_main_wrapper: nickx_default_main_wrapper,
				nickx_default_thumb_wrapper: nickx_default_thumb_wrapper,
				get_Vimeo_Embed_Url: get_Vimeo_Embed_Url,
				nickx_init_videoplayers: nickx_init_videoplayers,
				post_thumb_index: post_thumb_index,
				slide_count: slide_count
			};
			if (wc_prd_vid_slider_setting.nickx_show_lightbox == 'yes') {
				nquery('[data-nfancybox="product-gallery"]').nfancybox(wc_prd_vid_slider_setting.nfancybox);
			}
		}
		if (nquery(window).width() > 768 && wc_prd_vid_slider_setting.nickx_show_zoom != 'yes') {
			nquery(document).on('click', '.zoomLens', function (e) {
				if (nquery('.nickx-slider-for .zoomContainer').length == 0) {
					let pageX = e.pageX;
					let pageY = e.pageY;
					const $container = nquery('.nickx-slider-for');
					const $prevArrow = nquery('.nswiper-button-prev');
					const $nextArrow = nquery('.nswiper-button-next');
					const containerOffset = $container.offset();
					const containerWidth = $container.outerWidth();
					const containerHeight = $container.outerHeight();
					const arrowZone = 60;
					if (
						pageX >= containerOffset.left &&
						pageX <= containerOffset.left + arrowZone &&
						pageY >= containerOffset.top &&
						pageY <= containerOffset.top + containerHeight
					) {
						$prevArrow.trigger('click');
					} else if (
						pageX >= containerOffset.left + containerWidth - arrowZone &&
						pageX <= containerOffset.left + containerWidth &&
						pageY >= containerOffset.top &&
						pageY <= containerOffset.top + containerHeight
					) {
						$nextArrow.trigger('click');
					} else {
						nquery('.nickx-slider.nickx-slider-for .nswiper-slide-active span').click();
					}
				} else {
					nquery('.nickx-slider.nickx-slider-for .nswiper-slide-active span').click();
				}
			});
		}
		setIframeHeight();
	});
	var nickx_resize_timer;
	nquery(window).on('resize', function () {
		setIframeHeight();
		set_nickx_popup_trigger();
		clearTimeout(nickx_resize_timer);
		nickx_resize_timer = setTimeout(function () {
			if (window.nickx_slider && typeof window.nickx_slider.update_layout === 'function') {
				window.nickx_slider.update_layout();
			} else {
				if (window.slideWrapper && window.slideWrapper.update) window.slideWrapper.update();
				if (typeof slider_thumbs !== 'undefined' && slider_thumbs && slider_thumbs.update) slider_thumbs.update();
			}
		}, 100);
	});
	nquery(window).on('load', setIframeHeight);
	nquery('.zoom.nswiper-slide img').on('load', setIframeHeight);
	function setIframeHeight() {
		nquery('iframe.product_video_iframe').each(function (i, item) {
			var $sliderFor = nquery(item).closest('.nickx-slider-for');
			var parentW = $sliderFor.width() || nquery('.images.nickx_product_images_with_video').width();
			var slide_1 = 0;

			var customRatio = parseFloat(nquery(item).attr('data-ratio'));
			if (customRatio && customRatio > 0 && parentW > 100) {
				slide_1 = Math.round(parentW * customRatio);
			}

			if (!slide_1) {
				var $img = $sliderFor.find('.zoom.nswiper-slide img').first();
				if ($img.length > 0 && $img.height() > 50) {
					slide_1 = $img.height();
				}
			}

			if (!slide_1 && parentW > 100) {
				slide_1 = Math.round(parentW * (9 / 16));
			}

			if (slide_1 > 0) {
				nquery(item).css({ 'height': slide_1 + 'px' });
				item.height = slide_1;
			}
		});
	}
	function set_nickx_popup_trigger() {
		if (nquery('span.nickx-popup_trigger').length > 0) {
			nquery('span.nickx-popup_trigger').css({ 'opacity': '0' });
			setTimeout(function (e) {
				let current_link = nquery('.show_lightbox .nswiper-slide-active span.nickx-popup');
				let offset = current_link.offset();
				if (current_link && offset) {
					current_link.css({ 'opacity': '0' });
					nquery('span.nickx-popup_trigger').offset({ top: offset.top, left: offset.left }).css({ 'opacity': '' });
				}
			}, 100);
		}
	}
	function equalizeThumbHeights() {
		let maxHeight = 100;
		const thumbs = document.querySelectorAll('.product_thumbnail_item img');
		thumbs.forEach(img => {
			if (img.offsetHeight > maxHeight) {
				maxHeight = img.offsetHeight;
			}
		});
		const videothumbs = document.querySelectorAll('.video-thumbnail img');
		videothumbs.forEach(videoimg => {
			videoimg.style.height = maxHeight + 'px';
		});
	}
})(jQuery);
