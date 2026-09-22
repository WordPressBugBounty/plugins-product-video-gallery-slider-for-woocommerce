(function ($) {
	const nquery = jQuery;
	if (typeof wc_prd_vid_slider_setting === 'undefined') return;

	nquery(document).ready(function () {
		if (typeof window.nickx_slider === 'undefined') return;
		if (!nquery('.variations_form, .single_variation_wrap, form.variations_form').length) return;

		let nickx_has_variation_custom_slides = false;
		let nickx_variation_selector = (wc_prd_vid_slider_setting.nickx_variation_selector == 'document') ? document : wc_prd_vid_slider_setting.nickx_variation_selector;

		function nickx_restore_default_gallery() {
			if (nickx_has_variation_custom_slides) {
				let slideWrapper = window.nickx_slider.slideWrapper;
				let slider_thumbs = window.nickx_slider.slider_thumbs;

				if (slideWrapper && slideWrapper.loopDestroy) {
					try { slideWrapper.loopDestroy(); } catch (err) { }
				}
				if (slider_thumbs && slider_thumbs.loopDestroy) {
					try { slider_thumbs.loopDestroy(); } catch (err) { }
				}

				nquery('.nickx-slider-for, .nickx-slider-for .nswiper-wrapper').css('height', '');
				nquery('.nickx-slider-for .nswiper-wrapper').html(window.nickx_slider.nickx_default_main_wrapper);
				nquery('.nickx-slider-nav .nswiper-wrapper').html(window.nickx_slider.nickx_default_thumb_wrapper);
				nickx_has_variation_custom_slides = false;

				if (slideWrapper) {
					slideWrapper.activeIndex = 0;
					if (slideWrapper.update) slideWrapper.update();
					if (slideWrapper.slideTo) slideWrapper.slideTo(0);
					if (slideWrapper.slideToLoop) slideWrapper.slideToLoop(0);
				}
				if (slider_thumbs) {
					slider_thumbs.activeIndex = 0;
					if (slider_thumbs.update) slider_thumbs.update();
					if (slider_thumbs.slideTo) slider_thumbs.slideTo(0);
				}
				if (slideWrapper && slideWrapper.loopCreate) {
					try { slideWrapper.loopCreate(); } catch (err) { }
				}
				if (slider_thumbs && slider_thumbs.loopCreate) {
					try { slider_thumbs.loopCreate(); } catch (err) { }
				}
				if (typeof window.nickx_slider.update_layout === 'function') {
					window.nickx_slider.update_layout();
				}
				var $restoredImgs = nquery('.nickx-slider-for img');
				if ($restoredImgs.length > 0 && typeof window.nickx_slider.update_layout === 'function') {
					$restoredImgs.one('load', function () {
						setTimeout(window.nickx_slider.update_layout, 50);
					});
				}
				if (typeof window.nickx_slider.update_layout === 'function') {
					setTimeout(window.nickx_slider.update_layout, 150);
					setTimeout(window.nickx_slider.update_layout, 400);
				}
			}
		}

		nquery(document).on('reset_image reset_data', function (e) {
			let slideWrapper = window.nickx_slider ? window.nickx_slider.slideWrapper : false;
			let slider_thumbs = window.nickx_slider ? window.nickx_slider.slider_thumbs : false;

			if (nickx_has_variation_custom_slides) {
				nickx_restore_default_gallery();
			} else {
				if (typeof window.nickx_slider.variations_image_reset === 'function') {
					window.nickx_slider.variations_image_reset();
				}
				if (typeof window.nickx_slider.update_layout === 'function') {
					window.nickx_slider.update_layout();
				}
			}
			if (slideWrapper) {
				slideWrapper.activeIndex = 0;
				if (slideWrapper.slideTo) slideWrapper.slideTo(0);
				if (slideWrapper.slideToLoop) slideWrapper.slideToLoop(0);
			}
			if (slider_thumbs) {
				slider_thumbs.activeIndex = 0;
				if (slider_thumbs.slideTo) slider_thumbs.slideTo(0);
			}
			if (window.nickx_slider && typeof window.nickx_slider.nickx_init_videoplayers === 'function') {
				window.nickx_slider.nickx_init_videoplayers('init_reset');
			}
		});

		nquery(nickx_variation_selector).on('found_variation', function (event, variation) {
			let slideWrapper = window.nickx_slider.slideWrapper;
			let slider_thumbs = window.nickx_slider.slider_thumbs;
			if (variation && variation.nickx_has_no_media) {
				nickx_restore_default_gallery();
				return;
			}

			var has_image = (variation.image_id && variation.image_id > 0) || (variation.nickx_variation_gallery && variation.nickx_variation_gallery.length > 0);
			var has_video = (wc_prd_vid_slider_setting.nickx_lic && variation.nickx_variation_video_url);

			if (has_image || has_video) {
				nickx_has_variation_custom_slides = true;
				var main_slides_html = '';
				var thumb_slides_html = '';
				var video_main_html = '';
				var video_thumb_html = '';
				var thumb_count = 0;
				if (has_video) {
					var v_url = variation.nickx_variation_video_url;
					var v_type = variation.nickx_variation_video_type || 'youtube';
					var v_embed = variation.nickx_variation_video_embed || v_url;
					var is_autoplay_place = (wc_prd_vid_slider_setting.nickx_vid_autoplay == 'yes' && wc_prd_vid_slider_setting.nickx_place_of_the_video == 'yes');

					if (v_type === 'youtube') {
						var yt_url = v_embed;
						var is_shorts_attr = (v_url.indexOf('shorts') > -1 || v_embed.indexOf('shorts') > -1) ? ' data-shorts="yes" data-ratio="1.5" ' : '';
						if (is_autoplay_place && yt_url.indexOf('autoplay=1') === -1) {
							yt_url += (yt_url.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1&mute=1';
						}
						video_main_html = '<div class="tc_video_slide nswiper-slide"><iframe id="nickx_yt_video_var" ' + is_shorts_attr + ' loading="lazy" width="100%" height="100%" class="product_video_iframe fitvidsignore" video-type="youtube" src="' + yt_url + '" frameborder="0" allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><span class="product_video_iframe_light nickx-popup nfancybox-media" data-nfancybox="product-gallery"></span></div>';
					} else if (v_type === 'vimeo') {
						var vimeo_url = window.nickx_slider.get_Vimeo_Embed_Url(v_embed || v_url);
						if (is_autoplay_place && vimeo_url.indexOf('autoplay=1') === -1) {
							vimeo_url += (vimeo_url.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1&muted=1';
						}
						video_main_html = '<div class="tc_video_slide nswiper-slide"><iframe width="100%" height="100%" loading="lazy" class="product_video_iframe fitvidsignore" video-type="vimeo" src="' + vimeo_url + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen=""></iframe><span href="' + vimeo_url + '?enablejsapi=1&wmode=opaque" class="nickx-popup nfancybox-media" data-nfancybox="product-gallery"></span></div>';
					} else if (v_type === 'html5') {
						var preload_val = (wc_prd_vid_slider_setting.nickx_preload == 'yes') ? 'auto' : 'none';
						var controls_attr = (wc_prd_vid_slider_setting.nickx_controls == 'yes') ? 'controls' : '';
						var loop_attr = (wc_prd_vid_slider_setting.nickx_videoloop == 'yes') ? 'loop="loop"' : '';
						var autoplay_attr = is_autoplay_place ? 'autoplay muted' : '';
						var poster_attr = '';
						if (wc_prd_vid_slider_setting.nickx_poster_img == 'yes') {
							var poster_src = variation.nickx_variation_video_thumb_url || wc_prd_vid_slider_setting.custom_icon || (variation.image && variation.image.src ? variation.image.src : '');
							if (poster_src) {
								poster_attr = 'poster="' + poster_src + '"';
							}
						}
						video_main_html = '<div class="tc_video_slide nswiper-slide"><video src="' + v_url + '" ' + poster_attr + ' width="100%" height="100%" preload="' + preload_val + '" class="product_video_iframe fitvidsignore" video-type="html5" ' + controls_attr + ' ' + loop_attr + ' ' + autoplay_attr + ' playsinline webkit-playsinline><source src="' + v_url + '"><p>Your browser does not support HTML5</p></video><span href="' + v_url + '?enablejsapi=1&wmode=opaque" class="nickx-popup nfancybox-media" data-nfancybox="product-gallery"></span></div>';
					} else {
						video_main_html = '<div class="tc_video_slide nswiper-slide"><iframe width="100%" height="100%" loading="lazy" class="product_video_iframe fitvidsignore" video-type="iframe" src="' + v_url + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen=""></iframe></div>';
					}

					var video_icon_color = wc_prd_vid_slider_setting.nickx_video_icon_color || '#FFF';
					var custom_thumb_attr = '';
					var thumb_img_src = '';

					if (wc_prd_vid_slider_setting.custom_icon) {
						thumb_img_src = wc_prd_vid_slider_setting.custom_icon;
						custom_thumb_attr = 'custom_thumbnail="yes"';
					} else if (variation.nickx_variation_video_thumb_url && variation.nickx_variation_video_thumb_url.indexOf('placeholder') === -1) {
						thumb_img_src = variation.nickx_variation_video_thumb_url;
					} else if (variation.image && variation.image.src) {
						thumb_img_src = variation.image.src;
					} else if (variation.nickx_variation_video_thumb_url) {
						thumb_img_src = variation.nickx_variation_video_thumb_url;
					}
					video_thumb_html = '<div title="video" class="nswiper-slide nickx-thumbnail video-thumbnail"><img data-skip-lazy="true" src="' + thumb_img_src + '" ' + custom_thumb_attr + ' class="product_video_img attachment-thumbnail size-thumbnail img_0" alt="video-thumb"><svg class="video_icon_img" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="80 35 80 85"><path fill="' + video_icon_color + '" width="16px" height="16px" d="M140.3 77c.6.2.8.8.6 1.4-.1.3-.3.5-.6.6L110 96.5c-1 .6-1.7.1-1.7-1v-35c0-1.1.8-1.5 1.7-1L140.3 77z"/><path fill="none" stroke="' + video_icon_color + '" stroke-width="5" d="M82.5 79c0-20.7 16.8-37.5 37.5-37.5s37.5 16.8 37.5 37.5-16.8 37.5-37.5 37.5S82.5 99.7 82.5 79z"/></svg></div>';
					thumb_count++;
				}
				var img_main_html = '';
				var img_thumb_html = '';
				var gallery_main_html = '';
				var gallery_thumb_html = '';
				var show_only_video = (wc_prd_vid_slider_setting.nickx_show_only_video == 'yes' && video_main_html !== '');

				if (!show_only_video) {
					if (variation.image && variation.image.src) {
						thumb_count++;
						img_main_html = '<div class="nswiper-slide zoom woocommerce-product-gallery__image"><img class="attachment-woocommerce_single size-woocommerce_single wp-post-image" data-skip-lazy="true" src="' + variation.image.src + '" data-zoom-image="' + variation.image.full_src + '" alt="' + (variation.image.title || '') + '" /><span title="' + (variation.image.title || '') + '" href="' + variation.image.full_src + '" class="nickx-popup" data-nfancybox="product-gallery"></span></div>';
						img_thumb_html = '<div class="nswiper-slide nickx-thumbnail product_thumbnail_item wp-post-image-thumb"><img src="' + (variation.image.gallery_thumbnail_src || variation.image.src) + '" data-skip-lazy="true" class="attachment-thumbnail size-thumbnail" /></div>';
					}
					if (variation.nickx_variation_gallery && variation.nickx_variation_gallery.length > 0) {
						variation.nickx_variation_gallery.forEach(function (g_item) {
							thumb_count++;
							var srcset_attr = g_item.srcset ? ' srcset="' + g_item.srcset + '"' : '';
							var sizes_attr = g_item.sizes ? ' sizes="' + g_item.sizes + '"' : '';
							gallery_main_html += '<div class="nswiper-slide zoom"><img class="attachment-woocommerce_single size-woocommerce_single" data-skip-lazy="true" src="' + g_item.single + '"' + srcset_attr + sizes_attr + ' data-zoom-image="' + g_item.full + '" alt="' + g_item.title + '" /><span title="' + g_item.title + '" href="' + g_item.full + '" class="nickx-popup" data-nfancybox="product-gallery"></span></div>';
							gallery_thumb_html += '<div class="nswiper-slide nickx-thumbnail product_thumbnail_item" title="' + g_item.title + '"><img src="' + g_item.thumb + '" data-skip-lazy="true" class="attachment-thumbnail size-thumbnail" /></div>';
						});
					}
				}

				var video_place = wc_prd_vid_slider_setting.nickx_place_of_the_video || 'no';
				if (video_place === 'yes') {
					main_slides_html = video_main_html + img_main_html + gallery_main_html;
					thumb_slides_html = video_thumb_html + img_thumb_html + gallery_thumb_html;
				} else if (video_place === 'second') {
					main_slides_html = img_main_html + video_main_html + gallery_main_html;
					thumb_slides_html = img_thumb_html + video_thumb_html + gallery_thumb_html;
				} else {
					main_slides_html = img_main_html + gallery_main_html + video_main_html;
					thumb_slides_html = img_thumb_html + gallery_thumb_html + video_thumb_html;
				}
				if (slideWrapper && slideWrapper.loopDestroy) {
					try { slideWrapper.loopDestroy(); } catch (err) { }
				}
				if (slider_thumbs && slider_thumbs.loopDestroy) {
					try { slider_thumbs.loopDestroy(); } catch (err) { }
				}
				nquery('.nickx-slider-for .nswiper-wrapper').html(main_slides_html);
				if (wc_prd_vid_slider_setting.nickx_hide_thumbnails == 'yes' || (wc_prd_vid_slider_setting.nickx_hide_thumbnail == 'yes' && thumb_count <= 1)) {
					nquery('.nickx-slider-nav').hide();
					nquery('.nickx-slider-nav .nswiper-wrapper').html('');
				} else {
					nquery('.nickx-slider-nav').show();
					nquery('.nickx-slider-nav .nswiper-wrapper').html(thumb_slides_html);
				}

				if (wc_prd_vid_slider_setting.nickx_show_lightbox != 'yes') {
					nquery('.nickx-slider-for .nickx-popup').remove();
				}

				if (slideWrapper) {
					slideWrapper.activeIndex = 0;
					if (slideWrapper.update) slideWrapper.update();
					if (slideWrapper.slideTo) slideWrapper.slideTo(0);
					if (slideWrapper.slideToLoop) slideWrapper.slideToLoop(0);
				}
				if (slider_thumbs) {
					slider_thumbs.activeIndex = 0;
					if (slider_thumbs.update) slider_thumbs.update();
					if (slider_thumbs.slideTo) slider_thumbs.slideTo(0);
				}
				if (slideWrapper && slideWrapper.loopCreate) {
					try { slideWrapper.loopCreate(); } catch (err) { }
				}
				if (slider_thumbs && slider_thumbs.loopCreate) {
					try { slider_thumbs.loopCreate(); } catch (err) { }
				}
				if (typeof window.nickx_slider.update_layout === 'function') {
					window.nickx_slider.update_layout();
				}
				var $varImgs = nquery('.nickx-slider-for img');
				if ($varImgs.length > 0 && typeof window.nickx_slider.update_layout === 'function') {
					$varImgs.one('load', function () {
						setTimeout(window.nickx_slider.update_layout, 50);
					});
				}
				if (typeof window.nickx_slider.update_layout === 'function') {
					setTimeout(window.nickx_slider.update_layout, 150);
					setTimeout(window.nickx_slider.update_layout, 400);
				}
			} else {
				if (nickx_has_variation_custom_slides) {
					nickx_restore_default_gallery();
				}
			}
			if (window.nickx_slider && typeof window.nickx_slider.nickx_init_videoplayers === 'function') {
				window.nickx_slider.nickx_init_videoplayers('init_reset');
			}
		});
	});
})(jQuery);
