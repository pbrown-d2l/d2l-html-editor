/*
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 **/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import './d2l-html-editor-plugin.js';

function convertXSPLIFrameToXSPLImagePlaceholder(context) {

	if (context.content === null || context.content.length === 0) {
		return;
	}

	var tempContent = context.content;

	var replace = function(match) {

		var originalContent = getOriginalContent(match);

		var originalContentEncoded = tinymce.html.Entities.encodeAllRaw(originalContent);

		var img = '<img style="' + getDimensions() + '" class="disf_default d2l-xspl-image-placehoder" src="/d2l/img/LP/htmlEditor/eq_trans.gif" data-d2l-xspl-original-html="' +
			originalContentEncoded + '"/>';

		return img;
	};

	// remove the xspl place holder images
	tempContent = tempContent.replace(xsplIFrameRegEx(), replace);
	context.content = tempContent;
}

function xsplIFrameRegEx() {
	return /<iframe[^>]*class=\"d2l-xspl-box\"[^>]*>(.|\n|\r)*?<\/iframe>/gi; // eslint-disable-line no-useless-escape
}

function getDimensions(height, width) {
	return 'height:' + (height || 8.5) + 'rem;' + ' width:' + (width || 16.5) + 'rem;';
}

function getOriginalContent(html) {
	var tempContent = html;

	var replace = function(match) {

		// swap the iframe with the original content
		var originalContent = match;
		var originalContentHtmlEncodedMatch = match.match(/ data-original-html=\"([^\"]*)\"/i); // eslint-disable-line no-useless-escape

		if (originalContentHtmlEncodedMatch && originalContentHtmlEncodedMatch[1]) {
			var originalContentHtmlEncoded = originalContentHtmlEncodedMatch[1];

			originalContent = tinymce.html.Entities.decode(originalContentHtmlEncoded);
			originalContent = getOriginalContent(originalContent);
		}

		return originalContent;
	};

	tempContent = tempContent.replace(xsplIFrameRegEx(), replace);
	return tempContent;
}

function convertXSPLImagePlaceholderToOriginalContent(context) {

	if (context.content === null || context.content.length === 0) {
		return;
	}

	var tempContent = context.content;

	var replace = function(match) {

		// swap the iframe with the original content
		var originalContent = match;
		var originalContentHtmlEncodedMatch = match.match(/ data-d2l-xspl-original-html=\"([^\"]*)\"/i); // eslint-disable-line no-useless-escape

		if (originalContentHtmlEncodedMatch && originalContentHtmlEncodedMatch[1]) {
			var originalContentHtmlEncoded = originalContentHtmlEncodedMatch[1];
			originalContent = tinymce.html.Entities.decode(originalContentHtmlEncoded);
		}

		return originalContent;
	};

	// remove the xspl place holder images
	tempContent = tempContent.replace(/<img[^>]*class=\"disf_default d2l-xspl-image-placehoder\"[^>]*>/gi, replace); // eslint-disable-line no-useless-escape

	context.content = tempContent;
}

/*global tinymce:true */
/** @polymerBehavior */
var XsplConverterBehavior = {
	plugin: {
		addPlugin: function() {
			tinymce.PluginManager.add('d2l_xsplconverter', function(editor) {
				editor.on('BeforeSetContent', function(e) {
					convertXSPLIFrameToXSPLImagePlaceholder(e);
				});

				editor.on('PostProcess', function(e) {
					if (e.get) {
						convertXSPLImagePlaceholderToOriginalContent(e);
					}
				});
			});
		}
	}
};
window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.XsplConverter = XsplConverterBehavior;
