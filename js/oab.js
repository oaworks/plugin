var apiaddress = 'https://api.opendatabutton.org';
var siteaddress = 'https://openaccessbutton.org';

var oab = {
    ///////////////////////////////////
    // Using the oab api
    ///////////////////////////////////

    // Tell the API which plugin version is in use for each POST
    plugin_version_sign: function(pdata) {
        var manifest = chrome.runtime.getManifest();
        return $.extend(pdata, { plugin: manifest['version_name'], type: 'article' } );
    },

    api_request: function(request_type, data, requestor, success_callback, failure_callback) {
        $.ajax({
            'type': 'POST',
            'url': apiaddress + request_type,
            'contentType': 'application/json; charset=utf-8',
            'dataType': 'JSON',
            'processData': false,
            'cache': false,
            'data': JSON.stringify(this.plugin_version_sign(data)),
            'success': function(data){
                success_callback(data['data'], requestor)
            },
            'error': function(data) {
                failure_callback(data)
            }
        });
        console.log(request_type + JSON.stringify(data));
    },

    handle_api_error: function (data, displayFunction) {               // todo: check for more errors
    var error_text = '';
    if (data.status == 401) {
        error_text = "Unauthorised - check your API key is valid."
    } else if (data.status == 403) {
        error_text = "Forbidden - account may already exist."
    }
    if (error_text != '') {
        displayFunction(error_text);
    }
}
};