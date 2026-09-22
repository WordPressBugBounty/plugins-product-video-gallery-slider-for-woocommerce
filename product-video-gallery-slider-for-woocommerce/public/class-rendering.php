<?php
/**
@package WC_PRODUCT_VIDEO_GALLERY_RENDERING
-------------------------------------------------*/

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
	RENDERING Class
 */
if ( ! class_exists( 'WC_PRODUCT_VIDEO_GALLERY_RENDERING' ) ) {
	class WC_PRODUCT_VIDEO_GALLERY_RENDERING {
		/** @var $extend Lic value */
		public $extend;

		function __construct() {
			$this->add_actions( new NICKX_LIC_CLASS() );
		}
		private function add_actions( $extend ) {
			$this->extend = $extend;
			add_action( 'wp_enqueue_scripts', array( $this, 'nickx_enqueue_scripts' ), 99 );
			add_shortcode( 'product_gallery_shortcode', array( $this, 'product_gallery_shortcode_callback' ) );
			add_filter( 'wc_get_template', array( $this, 'nickx_get_template' ), 99, 5 );
			add_filter( 'wp_is_mobile', array( $this, 'include_ipad_in_mobile_view') );
			add_filter( 'woocommerce_available_variation', array( $this, 'load_variation_media' ), 10, 3 );
		}
		public function include_ipad_in_mobile_view( $is_mobile ) {
			if ( ! is_product() ) {
				return $is_mobile;
			}

			if ( isset( $_SERVER['HTTP_USER_AGENT'] ) && strpos( $_SERVER['HTTP_USER_AGENT'], 'Macintosh' ) !== false ) {
				$is_mobile = true;
			}
			return $is_mobile;
		}
		public function nickx_enqueue_scripts() {
			if ( ! is_admin() ) {
				if ( class_exists( 'WooCommerce' ) && is_product() || is_page_template( 'page-templates/template-products.php' ) ) {
					wp_enqueue_script( 'jquery' );
					if ( get_option( 'nickx_show_lightbox' ) == 'yes' ) {
						wp_enqueue_script( 'nickx-nfancybox-js', plugins_url( 'js/jquery.fancybox.js', __FILE__ ), array( 'jquery' ), NICKX_PLUGIN_VERSION, array( 'in_footer' => true ) );
						wp_enqueue_style( 'nickx-nfancybox-css', plugins_url( 'css/fancybox.css', __FILE__ ), array(), NICKX_PLUGIN_VERSION, 'all' );
					}
					if ( get_option( 'nickx_show_zoom' ) != 'off' ) {
						wp_enqueue_script( 'nickx-zoom-js', plugins_url( 'js/jquery.zoom.min.js', __FILE__ ), array( 'jquery' ), '1.7.4', array( 'in_footer' => true ) );
						wp_enqueue_script( 'nickx-elevatezoom-js', plugins_url( 'js/jquery.elevatezoom.min.js', __FILE__ ), array( 'jquery' ), NICKX_PLUGIN_VERSION, array( 'in_footer' => true ) );
					}
					wp_enqueue_style( 'nickx-front-css', plugins_url( 'css/nickx-front.css', __FILE__ ), array(), NICKX_PLUGIN_VERSION, 'all' );
					// Add inline style to set fancybox icon from settings
					$fancybox_icon = get_option( 'nickx_lightbox_icon', 'magnifying-glass-zoom-in.svg' );
					$icon_url = plugins_url( 'css/' . $fancybox_icon, __FILE__ );
					// Add background-image and position rules based on settings
					$position = get_option( 'nickx_lightbox_icon_position', 'bottom-right' );
					$position_css = '';
					switch ( $position ) {
						case 'top-right':
							$position_css = '.images.nickx_product_images_with_video span.nickx-popup{ top:10px; right:10px; }';
							break;
						case 'top-left':
							$position_css = '.images.nickx_product_images_with_video span.nickx-popup{ top:10px; left:10px; }';
							break;
						case 'bottom-left':
							$position_css = '.images.nickx_product_images_with_video span.nickx-popup{ bottom:10px; left:10px; }';
							break;
						default:
							$position_css = '.images.nickx_product_images_with_video span.nickx-popup{ bottom:10px; right:10px; }';
					}
					$custom_css = ".images.nickx_product_images_with_video span.nickx-popup{ background-image: url('" . esc_url( $icon_url ) . "'); }" . $position_css;
					wp_add_inline_style( 'nickx-front-css', $custom_css );
					wp_enqueue_script( 'nickx-swiper-js', plugins_url( 'js/swiper-bundle.min.js', __FILE__ ), array( 'jquery' ), NICKX_PLUGIN_VERSION, array( 'in_footer' => true ) );
					wp_register_script( 'nickx-front-js', plugins_url( 'js/nickx.front.js', __FILE__ ), array( 'jquery', 'nickx-swiper-js' ), NICKX_PLUGIN_VERSION, array( 'in_footer' => true ) );
					$product_id = get_the_ID();
					$video_type = get_post_meta( $product_id, '_nickx_product_video_type', true );
					if( ( is_array( $video_type ) && in_array( 'nickx_video_url_vimeo', get_post_meta( $product_id, '_nickx_product_video_type', true ) ) ) || get_post_meta( $product_id, '_nickx_product_video_type', true ) == 'nickx_video_url_vimeo' ) {
						wp_enqueue_script( 'nickx-vimeo-js', 'https://player.vimeo.com/api/player.js', array(), '1.0', array( 'strategy' => 'defer', 'in_footer' => true ) );
					}
					$nfancybox_options = array(
						'slideShow' => array( 'speed'=> 3000 ),
						'fullScreen' => true,
						'transitionEffect'=> "slide",
						'arrows'=> true,
						'thumbs' => false,
						'infobar' => true,
						'loop' => true
					);
					$translation_array = array(
						'nickx_slider_layout'      => get_option( 'nickx_slider_layout' ),
						'nickx_slider_responsive'  => get_option( 'nickx_slider_responsive' ),
						'nickx_sliderautoplay'     => get_option( 'nickx_sliderautoplay' ),
						'nickx_sliderfade'         => get_option( 'nickx_sliderfade' ),
						'nickx_rtl'                => is_rtl(),
						'nickx_arrowinfinite'      => get_option( 'nickx_arrowinfinite' ),
						'nickx_arrowdisable'       => get_option( 'nickx_arrowdisable' ),
						'nickx_arrow_thumb'        => get_option( 'nickx_arrow_thumb' ),
						'nickx_hide_thumbnails'    => get_option( 'nickx_hide_thumbnails' ),
						'nickx_hide_thumbnail'     => get_option( 'nickx_hide_thumbnail' ),
						'nickx_adaptive_height'    => get_option( 'nickx_adaptive_height', 'yes' ),
						'nickx_thumbnails_to_show' => get_option( 'nickx_thumbnails_to_show', 4 ),
						'nickx_thumnails_layout'   => get_option( 'nickx_thumnails_layout', 'slider' ),
						'nickx_show_lightbox'      => get_option( 'nickx_show_lightbox' ),
						'nickx_show_zoom'          => wp_is_mobile() && get_option( 'nickx_mobile_zoom') == 'yes' ? 'off' : get_option( 'nickx_show_zoom' ),
						'nickx_zoomlevel'          => get_option( 'nickx_zoomlevel', 1 ),
						'nickx_arrowcolor'         => get_option( 'nickx_arrowcolor' ),
						'nickx_arrowbgcolor'       => get_option( 'nickx_arrowbgcolor' ),
						'nickx_video_icon_color'   => get_option( 'nickx_video_icon_color', '#FFF' ),
						'nickx_variation_selector' => apply_filters( 'nickx_variation_selector', 'document'),
						'nickx_lic'                => $this->extend->is_nickx_act_lic(),
						'nfancybox'                => apply_filters( 'nickx_nfancybox_options', $nfancybox_options ),
					);
					if ( $custom_icon = get_option( 'custom_icon' ) ) {
						if ( is_numeric( $custom_icon ) ) {
							$translation_array['custom_icon'] = wp_get_attachment_image_url( $custom_icon, 'thumbnail' );
						} else {
							$translation_array['custom_icon'] = $custom_icon;
						}
					}
					if ( $this->extend->is_nickx_act_lic() ) {
						$translation_array['nickx_place_of_the_video'] = get_option( 'nickx_place_of_the_video' );
						$translation_array['nickx_videoloop']          = get_option( 'nickx_videoloop' );
						$translation_array['nickx_vid_autoplay']       = get_option( 'nickx_vid_autoplay' );
						$translation_array['nickx_controls']           = get_option( 'nickx_controls', 'yes' );
						$translation_array['nickx_preload']            = get_option( 'nickx_preload', 'yes' );
						$translation_array['nickx_poster_img']         = get_option( 'nickx_poster_img' );
						$translation_array['nickx_show_only_video']     = get_option( 'nickx_show_only_video' );
					}
					wp_localize_script( 'nickx-front-js', 'wc_prd_vid_slider_setting', $translation_array );
					wp_enqueue_script( 'nickx-front-js' );
					wp_enqueue_script( 'nickx-variation-js', plugins_url( 'js/nickx.variation.js', __FILE__ ), array( 'jquery', 'nickx-front-js' ), NICKX_PLUGIN_VERSION, array( 'in_footer' => true ) );
				}
			}
		}
		public function product_gallery_shortcode_callback( $atts = array() ) {
			ob_start();
			echo '<span id="product_gallery_shortcode">';
			$lic_chk_stateus = $this->extend->is_nickx_act_lic();
			if ( $lic_chk_stateus ) {
				$this->nickx_show_product_image('shortcode');
			} else {
				echo 'To use shortcode you need to activate license key...!!';
			}
			echo '</span>';
			return ob_get_clean();
		}
		public function nickx_get_template( $located, $template_name, $args, $template_path, $default_path ) {
			if ( is_product() && 'single-product/product-image.php' == $template_name && get_option( 'nickx_template' ) == 'yes' ) {
				$located = plugin_dir_path( __FILE__ ).'template/product-video-template.php';
			}
			return $located;
		}
		function nickx_get_embed_yt_url($url) {
			preg_match( '/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/', $url, $matches );
			if( !empty( $matches[2] ) ){
				$query_string = parse_url($url, PHP_URL_QUERY);
				$nocookie = '';   
				if( strpos($url, "nocookie" ) ){
					$nocookie = '-nocookie';   
				}
				$url = 'https://www.youtube'.$nocookie.'.com/embed/' . $matches[2] . '?enablejsapi=1';
				if ( get_option( 'nickx_vid_autoplay' ) == 'yes' && get_option( 'nickx_place_of_the_video' ) == 'yes' ) {
					$url .= '&autoplay=1&mute=1';
				}
				if( !empty( $query_string ) ){
					parse_str($query_string, $yt_params);
					unset($yt_params['v'], $yt_params['autoplay'], $yt_params['mute']);
					if (!empty($yt_params)) {
						$url .= '&'.http_build_query($yt_params);
					}
				}
			}
			return $url;
		}
		function nickx_get_embed_vimeo_url( $url ) {
			if ( preg_match( '/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/i', $url, $matches ) ) {
				$player_url = 'https://player.vimeo.com/video/' . $matches[1] . '?api=1';
				if ( get_option( 'nickx_vid_autoplay' ) == 'yes' && get_option( 'nickx_place_of_the_video' ) == 'yes' ) {
					$player_url .= '&autoplay=1&muted=1';
				}
				$parsed_url = wp_parse_url( $url );
				if ( ! empty( $parsed_url['query'] ) ) {
					parse_str( $parsed_url['query'], $query_params );
					unset( $query_params['api'], $query_params['autoplay'], $query_params['muted'] );
					if ( ! empty( $query_params ) ) {
						$player_url .= '&' . http_build_query( $query_params );
					}
				}
				$url = $player_url;
			}
			return $url;
		}
		public function nickx_get_gmt_offset(){
			$offset  = (float) get_option( 'gmt_offset' );
			$hours   = (int) $offset;
			$minutes = ( $offset - $hours );

			$sign      = ( $offset < 0 ) ? '-' : '+';
			$abs_hour  = abs( $hours );
			$abs_mins  = abs( $minutes * 60 );
			$tz_offset = sprintf( '%s%02d:%02d', $sign, $abs_hour, $abs_mins );
			return $tz_offset;
		}
		public function nickx_get_product_id( $product_id ) {
			// If WPML is not active, return same product ID
			if ( ! defined( 'ICL_SITEPRESS_VERSION' ) ) {
				return $product_id;
			}

			// Get current & default language
			$current_lang = apply_filters( 'wpml_current_language', null );
			$default_lang = apply_filters( 'wpml_default_language', null );
			
			// If current language IS primary, return same product ID
			if ( $current_lang === $default_lang ) {
				return $product_id;
			}

			// Check meta for current language product
			$meta_value = get_post_meta( $product_id, '_nickx_video_text_url', true );

			// If meta exists, return same product ID
			if ( ! empty( $meta_value[0] ) ) {
				return $product_id;
			}

			// Get primary language product ID
			$primary_product_id = apply_filters(
				'wpml_object_id',
				$product_id,
				'product',
				false,
				$default_lang
			);
			
			// Final fallback safety
			return $primary_product_id ?: $product_id;
		}
		public function nickx_get_nickx_video_schema(){
			if( is_product() ){
				$product_id = $this->nickx_get_product_id( get_the_ID() );
				$product_video_types = get_post_meta( $product_id, '_nickx_product_video_type', true );
				$product_video_urls  = get_post_meta( $product_id, '_nickx_video_text_url', true ); 
				$video_thumb_ids     = get_post_meta( $product_id, '_nickx_product_video_thumb_ids', true );
				$video_schemas       = get_post_meta( $product_id, '_video_schema', true );
				$video_upload_dates  = get_post_meta( $product_id, '_nickx_video_upload_date', true );
				$video_names         = get_post_meta( $product_id, '_nickx_video_name', true );
				$video_descriptions  = get_post_meta( $product_id, '_nickx_video_description', true );
				if ( is_array($product_video_urls) ) {
					$extend = new NICKX_LIC_CLASS();
					foreach ($product_video_urls as $key => $product_video_url) {
						if( !empty( $product_video_url ) ){
							if( isset($video_schemas[$key]) && $video_schemas[$key] == 'yes' && !empty( $video_names[$key] ) && !empty( $video_upload_dates[$key] ) && !empty( $video_descriptions[$key] ) ) {
								$product_video_thumb_url = wc_placeholder_img_src();
								if ( ! empty( $video_thumb_ids[$key] ) ) {
									$product_video_thumb_url = wp_get_attachment_image_url( $video_thumb_ids[$key] );
								}
								$schema_data = array(
									'@context'     => 'https://schema.org/',
									'@type'        => 'VideoObject',
									'uploadDate'   => $video_upload_dates[$key] . ':00' . $this->nickx_get_gmt_offset(),
									'thumbnailUrl' => $product_video_thumb_url,
									'name'         => $video_names[$key],
									'description'  => $video_descriptions[$key],
									'@id'          => $product_video_url,
									'embedUrl'     => $product_video_url,
								);
								echo '<script type="application/ld+json">' . wp_json_encode( $schema_data ) . '</script>';
							}
							if(!$extend->is_nickx_act_lic()){
								break;
							}				
						}
					}
				}
			}
		}
		public function nickx_get_nickx_video_html( $product_video_url, $extend, $key = 1, $product_video_type = 'nickx_video_url_youtube', $product_video_thumb_id = '', $nickx_preload = 'auto' ) {
			$is_shorts = ( strpos( $product_video_url, 'shorts' ) !== false ) ? ' data-shorts="yes" data-ratio="1.7777" ' : '';
			if ( strpos( $product_video_url, 'youtube' ) > 0 || strpos( $product_video_url, 'youtu' ) > 0 ) {
				$product_video_url = $this->nickx_get_embed_yt_url( $product_video_url );
				return '<div class="tc_video_slide nswiper-slide"><iframe id="nickx_yt_video_'.$key.'" '.$is_shorts.' loading="lazy" width="100%" height="100%" class="product_video_iframe fitvidsignore" video-type="youtube" src="' . esc_url( $product_video_url ) . '" frameborder="0" allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><span class="product_video_iframe_light nickx-popup nfancybox-media" data-nfancybox="product-gallery"></span></div>';
			} elseif ( strpos( $product_video_url, 'vimeo' ) > 0 && $extend->is_nickx_act_lic() ) {
				$product_video_url = $this->nickx_get_embed_vimeo_url( $product_video_url );
				return '<div class="tc_video_slide nswiper-slide"><iframe width="100%" loading="lazy" height="100%" class="product_video_iframe fitvidsignore" video-type="vimeo" src="' . esc_url( $product_video_url ) . '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen=""></iframe><span href="' . esc_url( $product_video_url ) . '?enablejsapi=1&wmode=opaque" class="nickx-popup nfancybox-media" data-nfancybox="product-gallery"></span></div>';
			} elseif ( ( $product_video_type == 'nickx_video_url_local' || strpos( $product_video_url, $_SERVER['SERVER_NAME'] ) > 0 ) && $extend->is_nickx_act_lic() ) {
				if ( $product_video_thumb_id ) {
					$poster = 'poster="'.esc_url( wp_get_attachment_image_url( $product_video_thumb_id, 'full' ) ).'"';
				}
				return '<div class="tc_video_slide nswiper-slide"><video '. ( $poster ?? '' ) .' width="100%" height="100%" preload="'.esc_attr( $nickx_preload ).'" class="product_video_iframe fitvidsignore" video-type="html5" ' . ( ( get_option( 'nickx_controls' ) == 'yes' ) ? 'controls' : '' ) . ' ' . ( ( get_option( 'nickx_vid_autoplay' ) == 'yes' && get_option( 'nickx_place_of_the_video' ) == 'yes' ) ? 'autoplay muted' : '' ) . ' playsinline webkit-playsinline><source src="' . esc_url( $product_video_url ) . '"><p>Your browser does not support HTML5</p></video><span href="' . esc_url( $product_video_url ) . '?enablejsapi=1&wmode=opaque" class="nickx-popup nfancybox-media" data-nfancybox="product-gallery"></span></div>';
			} elseif ( $product_video_type == 'nickx_video_url_iframe' && $extend->is_nickx_act_lic() ) {
				return '<div class="tc_video_slide nswiper-slide"><iframe loading="lazy" width="100%" height="100%" class="product_video_iframe fitvidsignore" video-type="iframe" src="' . esc_url( $product_video_url ) . '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen=""></iframe></div>';
			} else {
				return '<div class="tc_video_slide nswiper-slide"><iframe data-skip-lazy="true" width="100%" height="100%" class="product_video_iframe fitvidsignore" video-type="youtube" data_src="' . esc_url( $product_video_url ) . '" src="" frameborder="0" allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
			}
		}
		public function get_css_classes(){
			$css_classes = array( 'images', 'nickx_product_images_with_video' );
			if( get_option( 'nickx_show_lightbox' ) == 'yes' ){
				$css_classes[] = 'show_lightbox';
			}
			if( get_option( 'nickx_slider_responsive' ) == 'yes' ){
				$css_classes[] = 'yes';
			}
			if( get_option( 'nickx_thumnails_layout' ) == 'grid' ){
				$css_classes[] = 'grid';
			} else {
				$css_classes[] = 'v-'.get_option( 'nickx_slider_layout' );
			}
			return implode( ' ', $css_classes );
		}
		public function nickx_show_product_image($call_type = 'action') {
			global $post, $product;
			if ( $call_type != 'action' || ( !empty( $product ) && !$product->is_type( 'gift-card' ) ) ) {
				$product_id = $this->nickx_get_product_id( get_the_ID() );
				$show_thumb = 0;
				$product_video_urls = get_post_meta( $product_id, '_nickx_video_text_url', true );
				$product_video_types = get_post_meta( $product_id, '_nickx_product_video_type', true );
				$extend = new NICKX_LIC_CLASS();
				$is_rtl = is_rtl() ? 'rlt' : '';
				echo '<div dir="'.$is_rtl.'" class="'. $this->get_css_classes() .'">';
				if( wp_is_mobile() ){
					echo '<span class="nickx-popup_trigger"></span>';
				}
				echo '<div class="nickx-slider nswiper nickx-slider-for"><div class="nswiper-wrapper">';
				if ( has_post_thumbnail() || ! empty( $product_video_urls[0] ) ) {
					$attachment_ids    = ($product) ? $product->get_gallery_image_ids() : array();
					$imgfull_src       = get_the_post_thumbnail_url($product_id,'full');
					$htmlvideo         = '';
					if ( ! empty( $product_video_urls ) ) {
						$product_video_thumb_ids = get_post_meta( $product_id, '_nickx_product_video_thumb_ids', true );
						if ( is_array($product_video_urls) ) {
							$nickx_preload = get_option( 'nickx_preload', 'yes' ) == 'yes' ? 'auto' : 'none';
							$poster_img = get_option( 'nickx_poster_img' );
							foreach ( $product_video_urls as $key => $product_video_url) {
								if( !empty( $product_video_url ) ) {
									$show_thumb++;
									$product_video_thumb_id = ( isset($product_video_thumb_ids[$key]) && $poster_img == 'yes' ) ? $product_video_thumb_ids[$key] : '';
									$htmlvideo .= $this->nickx_get_nickx_video_html($product_video_url,$extend,$key,$product_video_types[$key],$product_video_thumb_id,$nickx_preload);
								}
								if(!$extend->is_nickx_act_lic()){
									break;
								}
							}
						}
						else{
							$show_thumb++;
							$htmlvideo .= $this->nickx_get_nickx_video_html( $product_video_urls, $extend, 1, 'nickx_video_url_youtube' );
						}
					}
					$product_image = get_the_post_thumbnail( $product_id, 'woocommerce_single', array( 'data-skip-lazy' => 'true', 'data-zoom-image' => $imgfull_src, 'fetchpriority' => 'high', 'decoding' => 'async' ) );
					$html = '';
					if( !empty($htmlvideo) && get_option( 'nickx_show_only_video' ) == 'yes' && $extend->is_nickx_act_lic() ){
						$html .= $htmlvideo;
					} else {
						$product_featured_image_id = get_post_thumbnail_id();
						$html .= ( ( get_option( 'nickx_place_of_the_video' ) == 'yes' && $extend->is_nickx_act_lic() ) ? $htmlvideo : '' );
						if( !empty ( $product_image ) ){
							$show_thumb++;
							$html .= '<div class="nswiper-slide zoom woocommerce-product-gallery__image">'.$product_image.'<span title="'.esc_attr( get_the_title( $product_featured_image_id ) ).'" href="'.esc_url( $imgfull_src ).'" class="nickx-popup" data-nfancybox="product-gallery"></span></div>';
						}
						$html .= ( ( get_option( 'nickx_place_of_the_video' ) == 'second' && $extend->is_nickx_act_lic() ) ? $htmlvideo : '' );
						foreach ( $attachment_ids as $attachment_id ) {
							if( $attachment_id == $product_featured_image_id ) {
								continue;
							}
							$show_thumb++;
							$imgfull_src = wp_get_attachment_image_url( $attachment_id, 'full' );
							$html       .= '<div class="nswiper-slide zoom">' . wp_get_attachment_image( $attachment_id, 'woocommerce_single', 0, array( 'data-skip-lazy' => 'true', 'data-zoom-image' => $imgfull_src ) ) . '<span title="'.esc_attr( get_the_title($attachment_id) ).'" href="' . esc_url( $imgfull_src ) . '" class="nickx-popup" data-nfancybox="product-gallery"></span></div>';
						}
						$html .= ( ( get_option( 'nickx_place_of_the_video' ) == 'no' || ! $extend->is_nickx_act_lic() ) ? $htmlvideo : '' );
					}
					echo apply_filters( 'woocommerce_single_product_image_html', $html, $product_id );
				} else {
					echo apply_filters( 'woocommerce_single_product_image_html', sprintf( '<div class="nswiper-slide zoom woocommerce-product-gallery__image"><img class="attachment-woocommerce_single size-woocommerce_single wp-post-image" data-skip-lazy="true" src="%s" data-zoom-image="%s" alt="%s" /></div>', wc_placeholder_img_src(), wc_placeholder_img_src(), __( 'Placeholder', 'woocommerce' ) ), $product_id );
				}
				echo '</div><div class="nswiper-button-next main_arrow"></div><div class="nswiper-button-prev main_arrow"></div></div>';
				if ( get_option( 'nickx_hide_thumbnails' ) != 'yes' ) {
					if( $show_thumb > 1 || get_option('nickx_hide_thumbnail') != 'yes' ){
						$this->nickx_show_product_thumbnails($product_id);
					}
				}
				do_action( 'nickx_after_product_video_gallery_thumbnails' );
				if ( get_option( 'nickx_thumbnails_hook' ) == 'yes' ) {
					do_action( 'woocommerce_product_thumbnails' );
				}
				echo '</div>';
			} else {
				woocommerce_show_product_images();
			}
		}
		public function nickx_get_video_thumbanil_html( $product_id, $thumbnail_size) {
			$product_video_urls = get_post_meta( $product_id, '_nickx_video_text_url', true );
			$video_icon_color = get_option( 'nickx_video_icon_color', '#FFF' );
			$wc_placeholder_img = wc_placeholder_img_src();
			if ( ! empty( $product_video_urls ) ) {
				$gallery_thumbnail_size = wc_get_image_size( $thumbnail_size );
				$hwstring = image_hwstring( $gallery_thumbnail_size['width'], $gallery_thumbnail_size['height'] );
				$product_video_thumb_ids  = get_post_meta( $product_id, '_nickx_product_video_thumb_ids', true );
				$custom_thumbnails        = get_post_meta( $product_id, '_custom_thumbnail', true );
				if ( is_array($product_video_urls) ) {
					$extend = new NICKX_LIC_CLASS();
					foreach ($product_video_urls as $key => $product_video_url) {
						if( !empty( $product_video_url ) ) {
							$product_video_thumb_id   = isset($product_video_thumb_ids[$key]) ? $product_video_thumb_ids[$key] : '';
							$custom_thumbnail        = isset($custom_thumbnails[$key]) && !empty($product_video_thumb_id) ? 'custom_thumbnail="' . esc_attr($custom_thumbnails[$key]) . '"' : '';
							$product_video_thumb_url = $wc_placeholder_img;
							$global_thumb = '';
							if ( $product_video_thumb_id ) {
								$product_video_thumb_url = wp_get_attachment_image_url( $product_video_thumb_id, $thumbnail_size );
							} elseif ($custom_icon = get_option( 'custom_icon' ) ) {
								$custom_thumbnail        = 'custom_thumbnail="yes"';
								if(is_numeric($custom_icon)){
									$product_video_thumb_url = wp_get_attachment_image_url( get_option( 'custom_icon' ), $thumbnail_size );
								} else {
									$product_video_thumb_url = $custom_icon;
								}
								$global_thumb = 'global-thumb="' . esc_url( $product_video_thumb_url ).'"';
							}
							echo apply_filters( 'woocommerce_single_product_image_thumbnail_html', '<div title="video" class="nswiper-slide nickx-thumbnail video-thumbnail"><img ' . $hwstring . ' data-skip-lazy="true" ' . $global_thumb . ' src="' . esc_url( $product_video_thumb_url ) . '" ' . $custom_thumbnail . ' class="product_video_img img_'.$key.' attachment-thumbnail size-thumbnail" alt="video-thumb-'.$key.'"><svg class="video_icon_img" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="80 35 80 85"><path fill="'.$video_icon_color.'" width="16px" height="16px" d="M140.3 77c.6.2.8.8.6 1.4-.1.3-.3.5-.6.6L110 96.5c-1 .6-1.7.1-1.7-1v-35c0-1.1.8-1.5 1.7-1L140.3 77z"/><path fill="none" stroke="'.$video_icon_color.'" stroke-width="5" d="M82.5 79c0-20.7 16.8-37.5 37.5-37.5s37.5 16.8 37.5 37.5-16.8 37.5-37.5 37.5S82.5 99.7 82.5 79z"/></svg></div>', '', $product_id );
							if(!$extend->is_nickx_act_lic()){
								break;
							}
						}
					}
				} else {
					$product_video_thumb_url = $wc_placeholder_img;
					$global_thumb = '';
					if ( $product_video_thumb_ids ) {
						$product_video_thumb_url = wp_get_attachment_image_url( $product_video_thumb_ids, $thumbnail_size );
					} elseif ($custom_icon = get_option( 'custom_icon' ) ) {
						$custom_thumbnails        = 'custom_thumbnail="yes"';
						if(is_numeric($custom_icon)){
							$product_video_thumb_url = wp_get_attachment_image_url( get_option( 'custom_icon' ), $thumbnail_size );
						} else {
							$product_video_thumb_url = $custom_icon;
						}
						$global_thumb = 'global-thumb=" ' . esc_url( $product_video_thumb_url ).' "';
					}
					echo apply_filters( 'woocommerce_single_product_image_thumbnail_html', '<div title="video" class="nswiper-slide nickx-thumbnail video-thumbnail"><img ' . $hwstring . ' data-skip-lazy="true" ' . $global_thumb . ' src="' . esc_url( $product_video_thumb_url ) . '" ' . $custom_thumbnails . ' class="product_video_img img_0 attachment-thumbnail size-thumbnail" alt="video-thumb-0"><svg class="video_icon_img" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="80 35 80 85"><path fill="'.$video_icon_color.'" width="16px" height="16px" d="M140.3 77c.6.2.8.8.6 1.4-.1.3-.3.5-.6.6L110 96.5c-1 .6-1.7.1-1.7-1v-35c0-1.1.8-1.5 1.7-1L140.3 77z"/><path fill="none" stroke="'.$video_icon_color.'" stroke-width="5" d="M82.5 79c0-20.7 16.8-37.5 37.5-37.5s37.5 16.8 37.5 37.5-16.8 37.5-37.5 37.5S82.5 99.7 82.5 79z"/></svg></div>', '', $product_id );
				}
			} else {
				return;
			}
		}
		public function nickx_show_product_thumbnails($product_id) {
			global $post, $product;
			if (empty($product->get_type()) || ( !empty( $product ) && !$product->is_type( 'gift-card' ) ) ) {
				$product_video_urls = get_post_meta( $product_id, '_nickx_video_text_url', true );
				$extend         = new NICKX_LIC_CLASS();
				$attachment_ids = $product->get_gallery_image_ids();
				if ( has_post_thumbnail() ) {
					$thumbanil_id   = get_post_thumbnail_id();
					$attachment_ids = array_diff( $attachment_ids, array( $thumbanil_id ) );
					$attachment_ids = array_merge( array( $thumbanil_id ), $attachment_ids );
				}
				$thumbnail_size    = apply_filters( 'woocommerce_gallery_thumbnail_size', 'woocommerce_gallery_thumbnail' );
				if ( ( $attachment_ids && $product->get_image_id() ) || ! empty( get_post_meta( $product_id, '_nickx_video_text_url', true ) ) ) {
					echo '<div id="nickx-gallery" thumbsSlider class="thumbnail-slider nswiper nickx-slider-nav"><div class="nswiper-wrapper">';
					if( ( ! empty( $product_video_urls ) && get_option( 'nickx_show_only_video' ) == 'yes' && $extend->is_nickx_act_lic() ) || empty( $attachment_ids )){
						$this->nickx_get_video_thumbanil_html( $product_id, $thumbnail_size );
					} else {
						if ( ( get_option( 'nickx_place_of_the_video' ) == 'yes' || empty( $thumbanil_id ) ) && $extend->is_nickx_act_lic() ) {
							$this->nickx_get_video_thumbanil_html( $product_id, $thumbnail_size );
						}
						foreach ( $attachment_ids as $attachment_id ) {
							$props = wc_get_product_attachment_props( $attachment_id, $post );
							if ( ! $props['url'] ) {
								continue;
							}
							echo apply_filters( 'woocommerce_single_product_image_thumbnail_html', '<div class="nswiper-slide nickx-thumbnail product_thumbnail_item ' . ( ( !empty( $thumbanil_id ) && $thumbanil_id == $attachment_id ) ? 'wp-post-image-thumb' : '' ) . '" title="'.esc_attr( $props['caption'] ).'">'.wp_get_attachment_image( $attachment_id, $thumbnail_size, 0, array( 'data-skip-lazy' => 'true' ) ).'</div>', $attachment_id );
							if ( !empty( $thumbanil_id ) && $thumbanil_id == $attachment_id && get_option( 'nickx_place_of_the_video' ) == 'second' && $extend->is_nickx_act_lic() ) {
								$this->nickx_get_video_thumbanil_html( $product_id, $thumbnail_size );
							}
						}
						if ( get_option( 'nickx_place_of_the_video' ) == 'no' || ! $extend->is_nickx_act_lic() ) {
							$this->nickx_get_video_thumbanil_html( $product_id, $thumbnail_size );
						}
					}
					echo '</div>'. ( ( get_option( 'nickx_arrow_thumb' ) == 'yes' ) ? '<div class="nswiper-button-next thumb_arrow"></div><div class="nswiper-button-prev thumb_arrow"></div>' : '' ). '</div>';
				}
			} else {
				woocommerce_show_product_thumbnails();
			}
		}

		public function load_variation_media( $variation_data, $product, $variation ) {
			$is_act_lic      = $this->extend->is_nickx_act_lic();
			$variation_id    = $variation->get_id();
			$product_image   = $product->get_image_id();
			$variation_image = $variation->get_image_id();
			$video_url       = '';
			$has_video       = false;
			
			if ( $is_act_lic ) {
				$video_url  = get_post_meta( $variation_id, '_nickx_variation_video_url', true );
				if ( ! empty( $video_url ) ) {
					$has_video = true;
				}
			}
			$wc_gallery_ids = array();
			if ( is_callable( array( $variation, 'get_gallery_image_ids' ) ) ) {
				$wc_gallery_ids = $variation->get_gallery_image_ids();
			}
			if ( empty( $wc_gallery_ids ) ) {
				$wc_gallery_ids = get_post_meta( $variation_id, '_product_image_gallery', true );
				$wc_gallery_ids = !empty( $wc_gallery_ids ) ? wp_parse_id_list( $wc_gallery_ids ) : [];
			}

			// If variation has no video and no image uploaded, default product gallery should show
			if ( ! $has_video && $product_image == $variation_image && empty( $wc_gallery_ids ) ) {
				$variation_data['nickx_has_no_media'] = true;
				return $variation_data;
			}

			if ( $has_video ) {
				$variation_data['nickx_variation_video_url']       = $video_url;
				$variation_data['nickx_variation_video_thumb_url'] = wc_placeholder_img_src();
				if ( strpos( $video_url, 'youtube' ) !== false || strpos( $video_url, 'youtu' ) !== false ) {
					$variation_data['nickx_variation_video_type']  = 'youtube';
					$variation_data['nickx_variation_video_embed'] = $this->nickx_get_embed_yt_url( $video_url );
				} elseif ( strpos( $video_url, 'vimeo' ) !== false ) {
					$variation_data['nickx_variation_video_type']  = 'vimeo';
					$variation_data['nickx_variation_video_embed'] = $this->nickx_get_embed_vimeo_url( $video_url );
				} else {
					$variation_data['nickx_variation_video_type']  = 'html5';
					$variation_data['nickx_variation_video_embed'] = $video_url;
				}
			} elseif ( $is_act_lic && ( $product_image != $variation_image || ! empty( $wc_gallery_ids ) ) ) {
				$parent_id = $product->get_id();
				static $parent_video_cache = array();
				if ( ! isset( $parent_video_cache[ $parent_id ] ) ) {
					$parent_video_urls      = get_post_meta( $parent_id, '_nickx_video_text_url', true );
					if ( ! empty( $parent_video_urls ) ) {
						$parent_video_types     = get_post_meta( $parent_id, '_nickx_product_video_type', true );
						$parent_video_thumb_ids = get_post_meta( $parent_id, '_nickx_product_video_thumb_ids', true );
	
						$_urls = is_array( $parent_video_urls ) ? array_filter( $parent_video_urls, 'strlen' ) : array();
						$parent_url      = $_urls ? (string) reset( $_urls ) : ( is_array( $parent_video_urls ) ? '' : (string) $parent_video_urls );
						$_types = is_array( $parent_video_types ) ? array_filter( $parent_video_types, 'strlen' ) : array();
						$parent_type     = $_types ? (string) reset( $_types ) : ( is_array( $parent_video_types ) ? '' : (string) $parent_video_types );
						$_thumbs = is_array( $parent_video_thumb_ids ) ? array_filter( $parent_video_thumb_ids, 'strlen' ) : array();
						$parent_thumb_id = $_thumbs ? (string) reset( $_thumbs ) : ( is_array( $parent_video_thumb_ids ) ? '' : (string) $parent_video_thumb_ids );
	
						if ( ! empty( $parent_url ) && is_string( $parent_url ) ) {
							$parent_thumb_url = '';
							if ( ! empty( $parent_thumb_id ) ) {
								$thumbnail_size    = apply_filters( 'woocommerce_gallery_thumbnail_size', 'woocommerce_gallery_thumbnail' );
								$parent_thumb_url = wp_get_attachment_image_url( $parent_thumb_id, $thumbnail_size );
							}
	
							$video_type  = 'html5';
							$video_embed = $parent_url;
	
							if ( strpos( $parent_url, 'youtube' ) !== false || strpos( $parent_url, 'youtu' ) !== false || $parent_type === 'nickx_video_url_youtube' ) {
								$video_type  = 'youtube';
								$video_embed = $this->nickx_get_embed_yt_url( $parent_url );
							} elseif ( strpos( $parent_url, 'vimeo' ) !== false || $parent_type === 'nickx_video_url_vimeo' ) {
								$video_type  = 'vimeo';
								$video_embed = $this->nickx_get_embed_vimeo_url( $parent_url );
							} elseif ( $parent_type === 'nickx_video_url_iframe' ) {
								$video_type  = 'iframe';
								$video_embed = $parent_url;
							}
							$parent_video_cache[ $parent_id ] = array(
								'url'       => $parent_url,
								'thumb_url' => ! empty( $parent_thumb_url ) ? $parent_thumb_url : wc_placeholder_img_src(),
								'type'      => $video_type,
								'embed'     => $video_embed,
							);
						}
					}
				}

				if ( ! empty( $parent_video_cache[ $parent_id ] ) ) {
					$cached = $parent_video_cache[ $parent_id ];
					$variation_data['nickx_variation_video_url']       = $cached['url'];
					$variation_data['nickx_variation_video_thumb_url'] = $cached['thumb_url'];
					$variation_data['nickx_variation_video_type']      = $cached['type'];
					$variation_data['nickx_variation_video_embed']     = $cached['embed'];
					$variation_data['nickx_is_parent_video']           = true;
				}
			}
			if ( ! empty( $wc_gallery_ids ) ) {
				$thumbnail_size = apply_filters( 'woocommerce_gallery_thumbnail_size', 'woocommerce_gallery_thumbnail' );
				$gallery_array  = array();
				static $image_cache = array();
				foreach ( $wc_gallery_ids as $img_id ) {
					if ( ! empty( $img_id ) ) {
						if ( ! isset( $image_cache[ $img_id ] ) ) {
							$full_url = wp_get_attachment_url( $img_id );
							if ( $full_url ) {
								$single_src = wp_get_attachment_image_url( $img_id, 'woocommerce_single' );
								$thumb_src  = wp_get_attachment_image_url( $img_id, $thumbnail_size );
								$srcset     = wp_get_attachment_image_srcset( $img_id, 'woocommerce_single' );
								$sizes      = wp_get_attachment_image_sizes( $img_id, 'woocommerce_single' );
								$image_cache[ $img_id ] = array(
									'id'     => $img_id,
									'full'   => $full_url,
									'single' => $single_src ?: $full_url,
									'thumb'  => $thumb_src ?: $full_url,
									'srcset' => $srcset ?: '',
									'sizes'  => $sizes ?: '',
									'title'  => get_the_title( $img_id ),
								);
							}
						}
						if ( $image_cache[ $img_id ] ) {
							$gallery_array[] = $image_cache[ $img_id ];
						}
					}
				}
				$variation_data['nickx_variation_gallery'] = $gallery_array;
			}
			return $variation_data;
		}
	}
}