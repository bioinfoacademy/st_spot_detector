'use strict';

(function() {
    var self;
    var LogicHandler = function(canvas, camera, spotSelector, spotAdjuster, calibrator, updateCanvasFunction) {
        self = this;
        self.canvas = canvas;
        self.camera = camera;
        self.spotSelector = spotSelector;
        self.spotAdjuster = spotAdjuster;
        self.calibrator = calibrator;
        self.updateCanvasFunction = updateCanvasFunction;

        self.mouseEvent = Object.freeze({"down": 1, "up": 2, "move": 3, "drag": 4, "wheel": 5});
        self.mouseButton = Object.freeze({"left": 0, "right": 2})
        self.keyEvent = camera.dir;
        self.state = Object.freeze({
            "upload_ready": 1,
            "loading": 2,
            "error": 3,
            "spot_detecting": 4,
            "move_camera": 5,
            "calibrate": 6,
            "select_spots": 7,
            "adjust_spots": 8,
            "add_spots": 9
        });

        self.currentState = self.state.upload_ready;
    };
  
    LogicHandler.prototype = {
        processKeydownEvent: function(keyEvent, eventData) {
            /*
            if(self.currentState == self.state.move_camera) {
                self.camera.navigate(keyEvent);
            }
            */
            if(self.currentState == self.state.adjust_spots) {
                if(keyEvent == self.keyEvent.shift) {
                    self.spotSelector.toggleShift(true);
                }
                else {
                    self.spotAdjuster.adjustSpots(keyEvent);
                }
            }
            self.updateCanvasFunction();
        },
        processKeyupEvent: function(keyEvent, eventData) {
            if(self.currentState == self.state.adjust_spots) {
                self.spotSelector.toggleShift(false);
            }
            self.updateCanvasFunction();
        },
        processMouseEvent: function(mouseEvent, eventData) {
            // upload ready state
            if(self.currentState == self.state.upload_ready) {
                if(mouseEvent == self.mouseEvent.up) {
                    // load image
                }
            }
            // calibrate state
            else if(self.currentState == self.state.calibrate) {
                if(self.calibrator.selected) {
                    if(mouseEvent == self.mouseEvent.drag) {
                        self.calibrator.moveSpot(eventData.position);
                    }
                }
                else {
                    // moving the canvas normally
                    if(mouseEvent == self.mouseEvent.drag) {
                        // maybe this should take the position rather than the difference
                        self.camera.pan(eventData.difference);
                    }
                    else if(mouseEvent == self.mouseEvent.wheel) {
                        self.camera.navigate(eventData);
                    }
                }
                if(mouseEvent == self.mouseEvent.down) {
                    self.calibrator.detectSelection(eventData.position);
                }
                else if(mouseEvent == self.mouseEvent.up) {
                    self.calibrator.endSelection();
                }
            }
            // adjusting spots state
            else if(self.currentState == self.state.adjust_spots) {
                if(eventData.button == self.mouseButton.left) {
                    // LMB, moving canvas or spots
                    if(mouseEvent == self.mouseEvent.down) {
                        self.spotAdjuster.moving = self.spotAdjuster.atSelectedSpots(eventData.position);
                        console.log("Down at: " + eventData.position.x + ", " + eventData.position.y);
                        var hej = self.camera.mouseToCameraPosition(eventData.position);
                        console.log("Or: " + hej.x + ", " + hej.y);
                    }
                    else if(mouseEvent == self.mouseEvent.up) {
                        self.spotAdjuster.moving = false;
                        console.log("Up at: " + eventData.position.x + ", " + eventData.position.y);
                        var hej = self.camera.mouseToCameraPosition(eventData.position);
                        console.log("Or: " + hej.x + ", " + hej.y);
                        // drop possible selected spots
                    }
                    else if(mouseEvent == self.mouseEvent.drag) {
                        // needs to depend on if spots are getting dragged around or not
                        if(self.spotAdjuster.moving) {
                            self.spotAdjuster.dragSpots(eventData.difference);
                        }
                        else {
                            self.camera.pan(eventData.difference);
                        }
                    }
                }
                else if(eventData.button == self.mouseButton.right) {
                    // RMB, selecting spots
                    if(mouseEvent == self.mouseEvent.down) {
                        self.spotSelector.beginSelection(eventData.position);
                    }
                    else if(mouseEvent == self.mouseEvent.up) {
                        self.spotSelector.endSelection();
                    }
                    else if(mouseEvent == self.mouseEvent.drag) {
                        self.spotSelector.updateSelection(eventData.position);
                    }
                }
                if(mouseEvent == self.mouseEvent.wheel) {
                    // scrolling
                    self.camera.navigate(eventData);
                }
            }
            // add spots state
            else if(self.currentState == self.state.add_spots) {
                if(mouseEvent == self.mouseEvent.up) {
                    self.spotAdjuster.addSpot(eventData.position);
                }
            }
            self.updateCanvasFunction();
        }
    };
  
    this.LogicHandler = LogicHandler;
    
}).call(self);
