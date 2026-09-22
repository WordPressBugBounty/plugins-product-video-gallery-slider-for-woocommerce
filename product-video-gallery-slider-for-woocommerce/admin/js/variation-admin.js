(function ($) {
    'use strict';
    function openMediaUploader(input, multiple, type) {
        if (typeof wp === 'undefined' || !wp.media) {
            return;
        }
        const frame = wp.media({
            title: multiple ? 'Select Images' : 'Select Video',
            multiple: multiple,
            library: { type: type },
            button: { text: 'Use this' }
        });
        frame.on('open', function () {
            const selection = frame.state().get('selection');
            const existingIds = input.value ? input.value.split(',') : [];
            existingIds.forEach(function (id) {
                if (id) {
                    const attachment = wp.media.attachment(id);
                    attachment.fetch();
                    selection.add(attachment);
                }
            });
        });
        frame.on('select', function () {
            const selection = frame.state().get('selection');
            const selectedIds = [];
            selection.map(function (attachment) {
                selectedIds.push(attachment.id);
            });
            input.value = selectedIds.join(',');
            input.dispatchEvent(new Event('change', { bubbles: true }));
            const loopMatch = input.name.match(/\d+/);
            const loop = loopMatch ? loopMatch[0] : null;
            if (!loop) return;
            if (type === 'image') {
                const preview = document.querySelector(`.variation-media-preview[data-loop="${loop}"]`);
                if (preview) {
                    preview.innerHTML = '';
                    selectedIds.forEach(function (id) {
                        const attachmentObj = wp.media.attachment(id);
                        const url = attachmentObj.get('url');
                        const div = document.createElement('div');
                        div.className = 'media-thumb';
                        div.setAttribute('data-id', id);
                        div.innerHTML = `<img src="${url}" /><span class="remove-media">×</span>`;
                        preview.appendChild(div);
                    });
                }
            } else if (type === 'video') {
                const field = input.closest('.form-field');
                let videoPreview = field ? field.querySelector('.video-preview') : null;
                if (videoPreview) videoPreview.remove();

                if (selectedIds.length > 0 && field) {
                    const url = wp.media.attachment(selectedIds[0]).get('url');
                    videoPreview = document.createElement('div');
                    videoPreview.className = 'video-preview';
                    videoPreview.innerHTML = `
                        <video src="${url}" controls style="max-width:100%;height:auto;"></video>
                        <span class="remove-video" style="cursor:pointer;">×</span>
                    `;
                    field.appendChild(videoPreview);

                    const videoUrlInput = document.querySelector(`input[name="nickx_variation_video_url_${loop}"]`);
                    if (videoUrlInput) {
                        videoUrlInput.value = url;
                        videoUrlInput.dispatchEvent(new Event('input', { bubbles: true }));
                        videoUrlInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }
        });

        frame.open();
    }

    $(document).on('click', '.upload_video_button', function (e) {
        e.preventDefault();
        const input = this.parentNode.querySelector('.variation_video_file');
        if (input) {
            openMediaUploader(input, false, 'video');
        }
    });

    $(document).on('click', '.upload_gallery_button', function (e) {
        e.preventDefault();
        const input = this.parentNode.querySelector('.variation_gallery_ids');
        if (input) {
            openMediaUploader(input, true, 'image');
        }
    });

    $(document).on('click', '.remove-media', function (e) {
        e.preventDefault();
        const thumb = $(this).closest('.media-thumb');
        const container = thumb.parent();
        thumb.remove();

        const ids = container.find('.media-thumb').map(function () {
            return $(this).attr('data-id');
        }).get().join(',');

        const loop = container.attr('data-loop');
        const input = document.querySelector(`input[name="nickx_variation_gallery_ids_${loop}"]`);
        if (input) {
            input.value = ids;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    $(document).on('click', '.remove-video', function (e) {
        e.preventDefault();
        const field = $(this).closest('.form-field');
        if (field.length) {
            const loopId = field.attr('data-loop');
            const videoInput = field.find('.variation_video_file');
            if (videoInput.length) videoInput.val('');

            const videoPreview = $(this).closest('.video-preview');
            if (videoPreview.length) videoPreview.remove();

            const videoUrlInput = $(`input[name="nickx_variation_video_url_${loopId}"]`);
            if (videoUrlInput && videoUrlInput.length) {
                videoUrlInput.val('');
                videoUrlInput[0].dispatchEvent(new Event('input', { bubbles: true }));
                videoUrlInput[0].dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    });

    $(document).on('mouseenter touchstart', '.variation-media-preview', function () {
        if ($(this).data('ui-sortable')) return;
        if ($.fn.sortable) {
            $(this).sortable({
                items: '.media-thumb',
                update: function (event, ui) {
                    const ids = $(this).find('.media-thumb').map(function () {
                        return $(this).attr('data-id');
                    }).get().join(',');
                    const loop = $(this).data('loop');
                    $(`input[name="nickx_variation_gallery_ids_${loop}"]`).val(ids).trigger('change');
                }
            });
        }
    });
})(jQuery);
