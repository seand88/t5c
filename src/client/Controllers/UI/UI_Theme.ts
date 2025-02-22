import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { Control } from "@babylonjs/gui/2D/controls/control";

const generatePanel = function (
    panelName:string = "Default Name",
    horizontal_position = Control.HORIZONTAL_ALIGNMENT_CENTER,
    vertical_position = Control.VERTICAL_ALIGNMENT_CENTER,
    width = "300px;",
    height = "400px",
    top = "0px",
    left = "0px",
    bg = getBg(),
    thickness = 0,
    cornerRadius = 2,
) {
    const panel:Rectangle = new Rectangle("panel-"+panelName);
    panel.top = top;
    panel.left = left;
    panel.width = width;
    panel.height = height;
    panel.verticalAlignment = horizontal_position;
    panel.horizontalAlignment = vertical_position;
    panel.thickness = thickness;
    panel.cornerRadius = cornerRadius;
    panel.background = bg;

    return panel;
};

const applyFont = function(p:Rectangle, size = "12px"){
    p.fontFamily = getFont();
    p.fontSize = size;
    return p;
}

const getFont = function(){
    return "Arial";
}

const getBg = function(){
    return "rgba(0,0,0,.8)";
}

const getPadding = function(multiplier = 1){
    return (multiplier*5);
}

export {
    applyFont,
    getBg,
    getPadding,
    generatePanel
}