/*** Camera Z-Way HA module *******************************************

Version: 1.0.0
(c) Z-Wave.Me, 2013
-----------------------------------------------------------------------------
Author: Stanislav Morozov <r3b@seoarmy.ru>
Description:
    This module stores params of camera

******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------

function Camera (id, controller) {
    // Call superconstructor first (AutomationModule)
    Camera.super_.call(this, id, controller);
}

inherits(Camera, AutomationModule);

_module = Camera;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

_.extend(Camera.prototype, {
    init: function (config) {
        Camera.super_.prototype.init.call(this, config);

        var that = this;
        
        var opener = function(command) {
            config.doorDevices.forEach(function(el) {
                var vDev = that.controller.devices.get(el);
                
                if (vDev) {
                    var type = vDev.get("deviceType");
                    if (type === "switchBinary") {
                        vDev.performCommand(command == "open" ? "on" : "off");
                    } else if (type === "doorlock") {
                            vDev.performCommand(command);
                    }
                }
            });
        };
        
        this.vDev = this.controller.devices.create("CameraDevice_" + this.id, {
            deviceType: "camera",
            metrics: {
                url: config.url,
                hasZoomIn: !!config.zoomInUrl,
                hasZoomOut: !!config.zoomOutUrl,
                hasLeft: !!config.leftUrl,
                hasRight: !!config.rightUrl,
                hasUp: !!config.upUrl,
                hasDown: !!config.downUrl,
                hasOpen: !!config.openUrl || config.doorDevices.length,
                hasClose: !!config.closeUrl || config.doorDevices.length,
                icon: 'camera',
                title: 'Camera ' + this.id
            }
        }, function(command) {
            var reqUrl = null;
            
            if (command == "zoomIn") {
                url = config.zoomInUrl;
            } else if (command == "zoomOut") {
                url = config.zoomInUrl;
            } else if (command == "left") {
                url = config.leftUrl;
            } else if (command == "right") {
                url = config.rightUrl;
            } else if (command == "up") {
                url = config.upUrl;
            } else if (command == "down") {
                url = config.downUrl;
            } else if (command == "open") {
                url = config.openUrl;
                opener(command);
            } else if (command == "close") {
                url = config.closeUrl;
                opener(command);
            }
            
            if (url) {
                http.request({
                    url: url,
                    async: true
                });
            }
        });
    },
    stop: function () {
        Camera.super_.prototype.stop.call(this);

        if (this.vDev) {
            this.controller.devices.remove(this.vDev.id);
            this.vDev = null;
        }
    }
});
