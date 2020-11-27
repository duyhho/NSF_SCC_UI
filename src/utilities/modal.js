import $ from 'jquery'
import 'bootstrap-notify'

import { browserHistory } from 'react-router'

class Modal {
  	constructor() {
  		this.bodyDom = "body";
	}
	showDangerModal(title,message) {
		// #  Reset data
		this.resetModals();

		var html = '<div class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog modal-sm"><div class="modal-content"> <div class="modal-header alert-danger"><button type="button" class="close" data-dismiss="modal" aria-label="Ok"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="gridSystemModalLabel">'+title+'</h4></div><div class="modal-body"><div class="row"><div class="col-lg-10">'+message+'</div></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
		$(this.bodyDom).append(html);
		$(".modal").modal('show');
	}
	showDangerModalWithOK(title,message,okText) {
		// #  Reset data
		this.resetModals();

		var html = '<div class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog modal-sm"><div class="modal-content"> <div class="modal-header alert-danger"><button type="button" class="close" data-dismiss="modal" aria-label="Ok"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="gridSystemModalLabel">'+title+'</h4></div><div class="modal-body"><div class="row"><div class="col-lg-10">'+message+'</div></div><div class="modal-footer">       <button type="button" class="btn btn-default move-on" data-dismiss="modal">'+okText+'</button>       <button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
		$(this.bodyDom).append(html);
		$(".modal").modal('show');
	}
	showSuccessModalWithOK(title,message,okText) {
		this.resetModals();

		var html = '<div class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog modal-sm"><div class="modal-content"> <div class="modal-header alert-success"><button type="button" class="close" data-dismiss="modal" aria-label="Ok"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="gridSystemModalLabel">'+title+'</h4></div><div class="modal-body"><div class="row"><div class="col-lg-10">'+message+'</div></div><div class="modal-footer"><button type="button" class="btn btn-default move-on" data-dismiss="modal">'+okText+'</button>       <button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
		$(this.bodyDom).append(html);
		$(".modal").modal('show');
	}
	showSuccess(title, message, goToLink, goToText) {
		// #  Reset data
		this.resetModals();
		var html = '<div class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog modal-sm"><div class="modal-content"> <div class="modal-header alert-success"><button type="button" class="close" data-dismiss="modal" aria-label="Ok"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="gridSystemModalLabel">'+title+'</h4></div><div class="modal-body"><div class="row"><div class="col-lg-10">'+message+'</div></div><div class="modal-footer"><button type="button" class="btn btn-default move-on" data-dismiss="modal">Close</button></div></div></div></div>';
		if(goToLink) {
			html = '<div class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog modal-sm"><div class="modal-content"> <div class="modal-header alert-success"><button type="button" class="close" data-dismiss="modal" aria-label="Ok"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="gridSystemModalLabel">'+title+'</h4></div><div class="modal-body"><div class="row"><div class="col-lg-10">'+message+'</div></div><div class="modal-footer"><button type="button" class="btn btn-default move-on" data-dismiss="modal">Close</button><button type="button" class="btn btn-default goto" data-dismiss="modal">'+goToText+'</button></div></div></div></div>';
		}
		$(this.bodyDom).append(html);
		$(".modal").modal('show');

		if(goToLink) {
			$('.modal .goto').on('click', function(e) {
				browserHistory.push(goToLink.props.to);
			});
		}
	}
	resetModals() {
		// #  Reset all modals from the dom
		$(".modal").remove();
	}
	resetBackDrop() {
		// Sometimes we have to hard reset
		$(".modal-backdrop").fadeOut().remove();
	}
	showInfo(message, color, from, align){
    	$.notify({
        	icon: "pe-7s-info",
        	message: message
        },{
            type: color,
            delay: 3000,
            placement: {
                from: from,
                align: align
			},
			animate: {
				enter: "animated",
				exit: "animated"
			}
        });
	}
	/**
	 * Displays popover with optional form field
	 */
	showPopOverWithDataEntry(title, message, formFields = '', saveMessage = 'Let\'s Go!', callback = null) {
		var self = this;
		// #  Reset data
		this.resetModals();
		var html = '<div class="modal fade" tabindex="-1" role="dialog">' +
		'<div class="modal-dialog modal-sm"><div class="modal-content">' + 
		'<div class="modal-header alert-info">' +
		'<button type="button" class="close" data-dismiss="modal" aria-label="Ok">' +
		'<span aria-hidden="true">&times;</span>' +
		'</button>' +
		'<h4 class="modal-title" id="gridSystemModalLabel">'+title+'</h4></div>' +
		'<div class="modal-body"><div class="row"> ' +
		'<div class="col-lg-12">'+message+''+formFields+'</div></div> '+
		'<div class="modal-footer"><button type="button" class="btn btn-default move-on" data-dismiss="modal">'+saveMessage+'</button>' +
		'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
		'</div></div></div></div>';

		$(this.bodyDom).append(html);
		$(".modal").modal('show');
		if(callback != null) {
			$('.modal .move-on').on('click', function(e) {
				callback(e);
			});
		}
	}
};

export let modal = new Modal();