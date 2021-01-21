import 'bootstrap-notify'

import { modal } from './modal.js'

class DropZoneHandler {
  	constructor() {
        this.dropZone = null;
        this.dynamicUpdate = false;
        this.onSuccessCallback = null;
        this.filesAdded = false;
        this.uploadSuccess = false;
        this.dropZoneConfig = {
            iconFiletypes: ['.jpg', '.png'],
            showFiletypeIcon: false,
            postUrl: ''
        };
        this.dropZoneJSConfig = {
            addRemoveLinks: true,
            autoProcessQueue: false,
            uploadMultiple: true,
            withCredentials: true,
            headers: {
                'Cache-Control': null,
                'X-Requested-With': null,
            }
        };
        this.dropZoneEventHandlers = {
            init: this.dropZoneInit.bind(this),
            addedfile: this.addedfile.bind(this),
            processing: this.processing.bind(this),
            sending: this.sending.bind(this),
            complete: this.complete.bind(this),
            uploadprogress: this.uploadprogress.bind(this),
            success: this.success.bind(this),
            error: this.error.bind(this),
            removedfile: this.removedfile.bind(this),
        };
	}

	dropZoneInit(obj) {
        if (this.dropZone !== undefined && obj === undefined) {
        } else {
            this.dropZone = obj;
        }
	}

	addedfile(file) {
		this.filesAdded = true;
        this.uploadSuccess = false;
        if (file === undefined) {
            return;
        }
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            modal.showInfo("Invalid File Type! You can only upload a file of type .jpg or .png", "warning", "top", "center");
            this.dropZone.removeFile(file);
        }
    }

    processing(file) {
		if (!this.dynamicUpdate){return;}

        this.dropZone.options.url = this.dropZoneConfig.postUrl;
    }

    sending(file) {

    }

    complete(file) {

    }

    uploadprogress(file) {

	}

	success(file, response) {
		this.uploadSuccess = true;

        if (this.onSuccessCallback) {
            this.onSuccessCallback();
        }
	}

	error(file, message) {
		if (file === undefined) {
            return;
		}

        modal.showInfo(message, "warning", "top", "center");
        this.dropZone.removeFile(file);
    }

    removedfile(file) {
		this.filesAdded = false;
	}

	upload(callback) {
		this.onSuccessCallback = callback;
        this.dropZone.processQueue();
	}

	setup(context, uploadFor = '311Request', uploadID, dynamicUpdate = false) {
		if (uploadID === undefined) {
            uploadID = 0;
        }

        if (dynamicUpdate) {
            this.dynamicUpdate = true;
        }
        this.onSuccessCallback = null;
        this.dropZoneConfig.postUrl = process.env.APPLICATION_URL + 'upload/' + uploadFor + '/' + uploadID;
		context.setState({
            dropZoneSetup: true,
            dropZoneConfig: this.dropZoneConfig,
            dropZoneJSConfig: this.dropZoneJSConfig,
            dropZoneEventHandlers: this.dropZoneEventHandlers
        });
    }

    isUploadSuccess() {
        return this.uploadSuccess
    }

    isFilesAdded() {
        return this.filesAdded
    }
};

export let dropZone = new DropZoneHandler();