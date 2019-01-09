import './d2l-html-editor-plugin.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';

function getQuickLinkSelectedText(editor) {

	var text;

	var selectedNode = window.D2LHtmlEditor.PolymerBehaviors.Plugin.getSelectedNode(editor);
	if (selectedNode && selectedNode.nodeName === 'A') {
		text = dom(selectedNode).textContent;
	} else {
		text = window.D2LHtmlEditor.PolymerBehaviors.Plugin.getSelectionContent(editor);
	}

	if (text === undefined || text === null) {
		text = '';
	}

	return text;
}

function getQuickLinkData(editor) {

	var node = window.D2LHtmlEditor.PolymerBehaviors.Plugin.getSelectedNode(editor);

	if (node === null || node.nodeName !== 'A') {
		return null;
	}

	var href = node.getAttribute('href');

	var title = dom(node).textContent;

	var target = node.getAttribute('target');
	if (target === '_top') {
		target = 'WholeWindow';
	} else if (target === '_blank') {
		target = 'NewWindow';
	} else {
		target = 'SameFrame';
	}

	var properties = [];
	properties.push({
		name: 'target',
		value: target
	});

	return {
		href: href,
		title: title,
		properties: properties,
		outputFormat: 'html'
	};
}

function getQuickLink(editor) {
	return {
		selectedText: getQuickLinkSelectedText(editor),
		itemData: getQuickLinkData(editor)
	};
}

function command(service, editor) {
	var quickLinkData = getQuickLink(editor);
	var bookmark = editor.selection.getBookmark();
	service.click(quickLinkData).then(function(response) {
		// setTimeout 10 required for IE to get focus back
		// document.activeELement.blur() required for Chrome to get focus back
		// moveToBookmark required by IE
		setTimeout(function() {
			document.activeElement.blur();
			editor.focus();
			editor.selection.moveToBookmark(bookmark);
			var selectedNode = window.D2LHtmlEditor.PolymerBehaviors.Plugin.getSelectedNode(editor);
			if (selectedNode !== null && selectedNode.nodeName === 'A') {
				// replace current link (i.e. if caret is inside of anchor)
				editor.selection.select(selectedNode);
			}
			editor.execCommand('mceInsertContent', false, response);
		}, 10);
	}, function() {
		setTimeout(function() {
			editor.focus();
			editor.selection.moveToBookmark(bookmark);
			window.D2LHtmlEditor.PolymerBehaviors.Plugin.clearBookmark(editor, bookmark);
		}, 100);
	});
}

function addPlugin(client) {
	return window.D2LHtmlEditor.PolymerBehaviors.Plugin.configureSimpleService(
		client, {
			id: 'd2l_link',
			label: 'Add Link',
			icon: 'd2l_link',
			serviceId: 'fra-html-editor-link',
			cmd: command,
			init: function() { }
		});
}

/** @polymerBehavior */
var LinkBehavior = {
	plugin: {
		addPlugin: addPlugin
	}
};

window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.Link = LinkBehavior;
