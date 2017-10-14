
  window.Rcount = 0;
  window.Vcount = 0;
  window.Ccount = 0;
  window.connectionCount = 0;
  window.extraCount = 0;
  window.GNDcount = 0;

  window.addConnectionMode = false;
  window.connectionStarted = false;
  window.isDown = false;
  window.connectionPoint1 = '';
  window.connectionPoint2 = '';

  window.line = {};

  var mainJson = {'elements' : {}, 'connections': {}};

  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
        }
      }
    }
    return cookieValue;
  }
  function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }


  function makeResistorGroup (name, left, top, horizontal, scale = 2) {
    if (horizontal) {
      var poly = new fabric.Path('M0,5L5,5L7.5,0L10,10L12.5,0L15,10L17.5,0L20,10L22.5,0L25,10L27.5,5L32.5,5',
                        {
                        stroke: 'black',
                        fill: "",
                        left: 0,
                        top: 0
                        });
      var text = new fabric.Text(name, {
                        fontSize: 12,
                        left: 10,
                        top: 20
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 0-4,
                        top: 5-4
                        });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 32.5-4,
                        top: 5-4
                        });
      n2.name = name+"#N2";
      var resistor = new fabric.Group([poly, n1, n2, text], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
      });
    } else {
      var poly = new fabric.Path('M0,5L5,5L7.5,0L10,10L12.5,0L15,10L17.5,0L20,10L22.5,0L25,10L27.5,5L32.5,5',
                        {
                        stroke: 'black',
                        fill: "",
                        left: 0,
                        angle: 90,
                        top: 0
                        });
      var text = new fabric.Text(name, {
                        fontSize: 12,
                        left: 10,
                        top: 20
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: -10+4,
                        top: 0-4
                        });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: -10+4,
                        top: 32.5-4
                        });
      n2.name = name+"#N2";
      var resistor = new fabric.Group([poly, n1, n2, text], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
      });
    }
    resistor.name = name;
    resistor.lockRotation = true;
    resistor.lockScalingX = true;
    resistor.lockScalingY = true;
    resistor.rotated = false;
    return resistor;
  }

  function rotateResistor() {
    canvas.remove(this);
    var name = this.name;
    if (this.rotated) {
      theNew = makeResistorGroup(name, this.left, this.top, true);
      theNew.rotated = false;
    } else {
      theNew = makeResistorGroup(name, this.left, this.top, false);
      theNew.rotated = true;
    }
    theNew.rotate = rotateResistor;
    canvas.add(theNew);
  };

  console.log("Running");
  function addResistor() {
    window.Rcount += 1;
    var name = "R"+window.Rcount;
    resistor = makeResistorGroup(name, 5, 5, true);
    resistor.rotate = rotateResistor;
    console.log("Adding resistor named "+resistor.name);
    canvas.add(resistor);
    mainJson['elements'][name] = {'name': name, 'value': 1.0};
  }

  function rotateElement() {
    o = canvas.getActiveObject();
    o.rotate();
    canvas.requestRenderAll();
  }

  function makeGndGroup (name, left, top, horizontal, scale = 2) {
    if (horizontal) {
      var p1 = new fabric.Line([17, 0, 17, 20], {
                        stroke: 'black',
                        fill: ''
                        });
      var p2 = new fabric.Line([23, 4, 23, 14], {
                        stroke: 'black',
                        fill: ''
                        });
      var p3 = new fabric.Line([26, 10, 26, 11], {
                        stroke: 'black',
                        fill: ''
                        });
      var l1 = new fabric.Line([0, 10, 17, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 0-4,
                        top: 10-4
                         });
      n1.name = name+"#N1";
      var gnd = new fabric.Group([p1, p2, p3, l1, n1,], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
      });
    } else {
      var p1 = new fabric.Line([10, 17, 30, 17], {
                        stroke: 'black',
                        fill: ''
                        });
      var p2 = new fabric.Line([16, 10, 24, 10], {
                        stroke: 'black',
                        fill: ''
                        });
      var p3 = new fabric.Line([19, 10, 20, 10], {
                        stroke: 'black',
                        fill: ''
                        });
      var l1 = new fabric.Line([20, 17, 20, 30],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 20-4,
                        top: 30-4
                         });
      n1.name = name+"#N1";
      var gnd = new fabric.Group([p1, p2, p3, l1, n1], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
      });
    }
    gnd.name = name;
    gnd.lockRotation = true;
    gnd.lockScalingX = true;
    gnd.lockScalingY = true;
    gnd.rotated = false;
    return gnd;
  }

  function makeCapacitorGroup (name, left, top, horizontal, scale = 2) {
    if (horizontal) {
      var p1 = new fabric.Line([17, 0, 17, 20], {
                        stroke: 'black',
                        fill: ''
                        });
      var p2 = new fabric.Line([23, 0, 23, 20], {
                        stroke: 'black',
                        fill: ''
                        });
      var l1 = new fabric.Line([0, 10, 17, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var l2 = new fabric.Line([23, 10, 40, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var text = new fabric.Text(name, {
                        fontSize: 12,
                        left: 10,
                        top: 20
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 0-4,
                        top: 10-4
                         });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 40-4,
                        top: 10-4
                        });
      n2.name = name+"#N2";
      var source = new fabric.Group([p1, p2, l1, l2, n1, n2, text], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
      });
    } else {
      var p1 = new fabric.Line([10, 17, 30, 17], {
                        stroke: 'black',
                        fill: ''
                        });
      var p2 = new fabric.Line([10, 10, 30, 10], {
                        stroke: 'black',
                        fill: ''
                        });
      var l1 = new fabric.Line([20, 17, 20, 30],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var l2 = new fabric.Line([20, -3, 20, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var text = new fabric.Text(name, {
                        fontSize: 12,
                        left: 35,
                        top: 10
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 20-4,
                        top: 30-4
                         });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 20-4,
                        top: -3-4
                        });
      n2.name = name+"#N2";
      var source = new fabric.Group([p1, p2, l1, l2, n1, n2, text], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
      });
    }
    source.name = name;
    source.lockRotation = true;
    source.lockScalingX = true;
    source.lockScalingY = true;
    source.rotated = false;
    return source;
  }

  function makeDCVGroup (name, left, top, horizontal, scale = 2) {
    if (horizontal) {
      var c = new fabric.Circle({
                        radius: 10,
                        fill: '',
                        stroke: 'black',
                        left: 10,
                        top: 0 }
                        );
      var l1 = new fabric.Line([0, 10, 10, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var l2 = new fabric.Line([30, 10, 40, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var text = new fabric.Text(name, {
                        fontSize: 12,
                        left: 10,
                        top: 20
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 0-4,
                        top: 10-4
                         });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 40-4,
                        top: 10-4
                        });
      n2.name = name+"#N2";
      var source = new fabric.Group([c, l1, l2, n1, n2, text], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
      });
    } else {
      var c = new fabric.Circle({
                        radius: 10,
                        fill: '',
                        stroke: 'black',
                        left: 10,
                        top: 0 }
                        );
      var l1 = new fabric.Line([20, 20, 20, 30],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var l2 = new fabric.Line([20, -10, 20, 0],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var text = new fabric.Text(name, {
                        fontSize: 12,
                        left: 35,
                        top: 10
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 20-4,
                        top: 30-4
                         });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 20-4,
                        top: -10-4
                        });
      n2.name = name+"#N2";
      var source = new fabric.Group([c, l1, l2, n1, n2, text], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
      });
    }
    source.name = name;
    source.lockRotation = true;
    source.lockScalingX = true;
    source.lockScalingY = true;
    source.rotated = false;
    return source;
  }

  function rotateDCV() {
    canvas.remove(this);
    var name = this.name;
    if (this.rotated) {
      theNew = makeDCVGroup(name, this.left, this.top, true);
      theNew.rotated = false;
    } else {
      theNew = makeDCVGroup(name, this.left, this.top, false);
      theNew.rotated = true;
    }
    theNew.rotate = rotateDCV;
    canvas.add(theNew);
  };

  function rotateCapacitor() {
    canvas.remove(this);
    var name = this.name;
    if (this.rotated) {
      theNew = makeCapacitorGroup(name, this.left, this.top, true);
      theNew.rotated = false;
    } else {
      theNew = makeCapacitorGroup(name, this.left, this.top, false);
      theNew.rotated = true;
    }
    theNew.rotate = rotateCapacitor;
    canvas.add(theNew);
  };

  function rotateGnd() {
    canvas.remove(this);
    var name = this.name;
    if (this.rotated) {
      theNew = makeGndGroup(name, this.left, this.top, true);
      theNew.rotated = false;
    } else {
      theNew = makeGndGroup(name, this.left, this.top, false);
      theNew.rotated = true;
    }
    theNew.rotate = rotateGnd;
    canvas.add(theNew);
  };

  function run() {
    // make net list
    $('#results_content').html('');
    var c = document.createElement("center");
    c.setAttribute("id", "content");

    var img_div = document.createElement("div");
    img_div.setAttribute("class", "row");
    var img_div1 = document.createElement("div");
    img_div1.setAttribute("class", "col-ms-12 col-md-12");
    img_div.appendChild(img_div1)
    var img = document.createElement("img");
    img.setAttribute("id", "result_img");
    img.setAttribute("src", "");
    img_div1.appendChild(img)
    c.appendChild(img_div);

    var text_div = document.createElement("div");
    text_div.setAttribute("class", "row");
    var text_div1 = document.createElement("div");
    text_div1.setAttribute("class", "col-ms-6 col-md-6");
    text_div1.setAttribute("id", "text1");
    var text_div2 = document.createElement("div");
    text_div2.setAttribute("class", "col-ms-6 col-md-6");
    text_div2.setAttribute("id", "text2");
    text_div.appendChild(text_div1)
    text_div.appendChild(text_div2)
    c.appendChild(text_div);

    // run! (AJAX)
    var csrftoken = getCookie('csrftoken');
    console.log(csrftoken);
    $.ajaxSetup({
      crossDomain: false, // obviates need for sameOrigin test
      beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
      }
    });
    $.ajax({
        type: 'POST',
        url: '/run',
        data: { data: JSON.stringify(mainJson)},
        dataType: 'json',
        success: function (rawImageData) {
          $("#result_img").attr("src", "data:image/png;base64," + rawImageData.img);
          $("#text1").html(rawImageData.node_description);
          $("#text2")[0].appendChild(document.createTextNode(rawImageData.extra_text));
        }
      });
    // show results
    $('#results_content')[0].appendChild(c);
  }

  function edit() {
    element = canvas.getActiveObject();
    if (element.name.includes("Conn")) return;
    e = mainJson['elements'][element.name];
    var c = document.createElement("div");
    c.setAttribute("id", "content");
    if (element.name.includes("R")) {
      var label = document.createElement("p");
      label.appendChild(document.createTextNode("Value (Ohms)"));
      var oname = document.createElement("input");
      oname.setAttribute('type', 'hidden');
      oname.setAttribute('name', 'objName');
      oname.setAttribute('id', 'objName');
      oname.setAttribute('value', element.name);
      var text = document.createElement("input");
      text.setAttribute('type', 'text');
      text.setAttribute('name', 'value');
      text.setAttribute('id', 'value');
      text.setAttribute('value', e.value);
      $("#edit_close").attr("onclick", "endEdit()");
      c.appendChild(oname);
      c.appendChild(label);
      c.appendChild(text);
    } else if (element.name.includes("V")) {
      var label = document.createElement("p");
      label.appendChild(document.createTextNode("Value (V)"));
      var oname = document.createElement("input");
      oname.setAttribute('type', 'hidden');
      oname.setAttribute('name', 'objName');
      oname.setAttribute('id', 'objName');
      oname.setAttribute('value', element.name);
      var text = document.createElement("input");
      text.setAttribute('type', 'text');
      text.setAttribute('name', 'value');
      text.setAttribute('id', 'value');
      text.setAttribute('value', e.value);
      $("#edit_close").attr("onclick", "endEdit()");
      c.appendChild(oname);
      c.appendChild(label);
      c.appendChild(text);
    } else if (element.name.includes("C")) {
      var label = document.createElement("p");
      label.appendChild(document.createTextNode("Value (F)"));
      var oname = document.createElement("input");
      oname.setAttribute('type', 'hidden');
      oname.setAttribute('name', 'objName');
      oname.setAttribute('id', 'objName');
      oname.setAttribute('value', element.name);
      var text = document.createElement("input");
      text.setAttribute('type', 'text');
      text.setAttribute('name', 'value');
      text.setAttribute('id', 'value');
      text.setAttribute('value', e.value);
      $("#edit_close").attr("onclick", "endEdit()");
      c.appendChild(oname);
      c.appendChild(label);
      c.appendChild(text);
    }
    $('#edit_content')[0].appendChild(c);
  }
  function endEdit() {
    var objName = $('#edit_content > #content > #objName')[0].value;
    var value = $('#edit_content > #content > #value')[0].value;
    mainJson['elements'][objName].value = value;
    $('#edit_content').html('');
  }

  function addDCVoltageSource() {
    window.Vcount += 1;
    var name = "V"+window.Vcount;
    source = makeDCVGroup(name, 5, 5, true);
    source.rotate = rotateDCV;
    console.log("Adding source named "+source.name);
    canvas.add(source);
    mainJson['elements'][name] = {'name': name, 'value': 1.0};
  }

  function addCapacitor() {
    window.Ccount += 1;
    var name = "C"+window.Ccount;
    cap = makeCapacitorGroup(name, 5, 5, true);
    cap.rotate = rotateCapacitor;
    console.log("Adding capacitor named "+cap.name);
    canvas.add(cap);
    mainJson.elements[name] = {'name': name, 'value': 1.0};
  }

  function addGnd() {
    window.GNDcount += 1;
    var name = "GND"+window.GNDcount;
    gnd = makeGndGroup(name, 5, 5, true);
    gnd.rotate = rotateGnd;
    console.log("Adding ground named "+gnd.name);
    canvas.add(gnd);
    mainJson.elements[name] = {'name': name};
  }

  function addConnection() {
    window.addConnectionMode = true;
    canvas.selection = false;
    canvas.forEachObject(function(o) {
      o.selectable = false;
    });
  }

  function deleteObj() {
    element = canvas.getActiveObject();
    console.log("Deleting element named "+element.name);
    if (element.name.includes("Conn")) {
      deleteConnection(element);
    } else if (element.name.includes("R") || element.name.includes("V") || element.name.includes("C")) {
      deleteElement(element);
    }
  }
  function deleteConnection(element) {
    delete mainJson.connections[element.name];
    canvas.remove(element);
    canvas.requestRenderAll();
  }

  function deleteElement(element) {
    element = canvas.getActiveObject();
    console.log("Deleting element named "+element.name);

    var toDeleteConn = [];
    for (var i = 0; i < element._objects.length; ++i) {
      if (("name" in element._objects[i]) && element._objects[i].name.includes("#N")) {
        // found node
        for (var key in mainJson.connections) {
          if (mainJson.connections[key].from == element._objects[i].name) {
            // remove this connection
            deleteLine(key);
          }
          if (mainJson.connections[key].to == element._objects[i].name) {
            // remove this connection
            deleteLine(key);
          }
          toDeleteConn.push(key);
        }
      }
    }
    for (var i = 0 ; i < toDeleteConn.length; ++i)
      delete mainJson.connections[toDeleteConn[i]];

    delete mainJson.elements[element.name];
    canvas.remove(element);
    canvas.requestRenderAll();
  }

  var canvas = this.__canvas = new fabric.Canvas('c');
  var DCVBtnCanvas = new fabric.Canvas("DCVBtnCanvas");
  var ResistorBtnCanvas = new fabric.Canvas("ResistorBtnCanvas");
  var CapacitorBtnCanvas = new fabric.Canvas("CapacitorBtnCanvas");
  var GndBtnCanvas = new fabric.Canvas("GndBtnCanvas");
  var btn = makeDCVGroup("V", 0, 5, true, 1);
  btn.selectable = false;
  DCVBtnCanvas.add(btn);
  btn = makeResistorGroup("R", 0, 5, true, 1)
  btn.selectable = false;
  ResistorBtnCanvas.add(btn);
  var btn = makeCapacitorGroup("C", 0, 5, true, 1);
  btn.selectable = false;
  CapacitorBtnCanvas.add(btn);
  var btn = makeGndGroup("Gnd", 0, 5, true, 1);
  btn.selectable = false;
  GndBtnCanvas.add(btn);
  fabric.Object.prototype.transparentCorners = false;
  $("#addDCVoltageSourceBtn")[0].onclick = addDCVoltageSource;
  $("#addResistorBtn")[0].onclick = addResistor;
  $("#addCapacitorBtn")[0].onclick = addCapacitor;
  $("#addGndBtn")[0].onclick = addGnd;
  $("#addConnectionBtn")[0].onclick = addConnection;
  $("#deleteBtn")[0].onclick = deleteObj;
  $("#rotateBtn")[0].onclick = rotateElement;
  $("#editBtn")[0].onclick = edit;
  $("#runBtn")[0].onclick = run;
  
  $(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
      if (window.addConnectionMode) {
        canvas.remove(line);
        line = null;
        window.isDown = false;
      }
      window.addConnectionMode = false;
      canvas.forEachObject(function(o) {
        o.selectable = true;
        o.lockRotation = true;
        o.lockScalingX = true;
        o.lockScalingY = true;
        if (o.name.includes("Conn")) {
          o.lockMovementX = true;
          o.lockMovementY = true;
        }
      });
    } else if (e.keyCode == 127) { // delete
      deleteObj();
    }
  });

  function deleteLine(lineName) {
    var idx = -1;
    for (var i = 0; i < canvas.getObjects().length; ++i) {
      if (canvas.getObjects()[i].name == lineName) {
        idx = i;
      }
    }
    canvas.remove(canvas.getObjects()[idx]);
  }

  function moveLineAndLine(lineName, lineName2, first) {
    var idx = -1;
    var idx2 = -1;
    for (var i = 0; i < canvas.getObjects().length; ++i) {
      if (canvas.getObjects()[i].name == lineName) {
        idx = i;
      }
      if (canvas.getObjects()[i].name == lineName2) {
        idx2 = i;
      }
    }
    
    lineObj = canvas.getObjects()[idx];
    lineObj2 = canvas.getObjects()[idx2];
    // update path
    var x1 = lineObj2.get('x1');
    var y1 = lineObj2.get('y1');
    var x2 = lineObj2.get('x2');
    var y2 = lineObj2.get('y2');
    var nx = lineObj.get('x1');
    var ny = lineObj.get('y1');
    x2 = nx;
    y2 = ny;
    if (!first) {
      nx = lineObj.get('x2');
      ny = lineObj.get('y2');
      x1 = nx;
      y1 = ny;
    }

    var nline = new fabric.Line([x1, y1, x2, y2],
              {
              stroke: 'black',
              fill: "",
              strokeWidth: 3,
              });
    nline.selectable = true;
    nline.lockRotation = true;
    nline.lockMovementX = true;
    nline.lockMovementY = true;
    nline.lockScalingX = true;
    nline.lockScalingY = true;
    canvas.remove(canvas.getObjects()[idx2]);
    nline.name=lineName2;
    canvas.add(nline);
  }

  canvas.on('object:moving', function(o) {
    o = o.target;
    for (var i = 0; i < o._objects.length; ++i) {
      if (("name" in o._objects[i]) && o._objects[i].name.includes("#N")) {
        // found node
        for (var key in mainJson.connections) {
          if (mainJson.connections[key].from == o._objects[i].name) {
            // move this connection
            moveLine(key, o._objects[i].name, true);
            // check other connections
            if (mainJson.connections[key].to.includes("E")) {
              for (var key2 in mainJson.connections) {
                if (mainJson.connections[key2].from == mainJson.connections[key].to) {
                  moveLineAndLine(key, key2, false);
                }
              }
            }

          }
          if (mainJson.connections[key].to == o._objects[i].name) {
            // move this connection
            moveLine(key, o._objects[i].name, false);
            // check other connections
            if (mainJson.connections[key].from.includes("E")) {
              for (var key2 in mainJson.connections) {
                if (mainJson.connections[key2].to == mainJson.connections[key].from) {
                  moveLineAndLine(key, key2, true);
                }
              }
            }

          }
        }
      }
    }
  });

  function moveLine(lineName, nodeName, first) {
    var elName = nodeName.split("#")[0];
    var nName = nodeName.split('#')[1];
    var idx = -1;
    var elObj = -1;
    var nObj = -1;
    for (var i = 0; i < canvas.getObjects().length; ++i) {
      if (canvas.getObjects()[i].name == lineName) {
        idx = i;
      }
      if (canvas.getObjects()[i].name == elName) {
        elObj = canvas.getObjects()[i];
        for (var k = 0; k < canvas.getObjects()[i]._objects.length; ++k) {
          if ("name" in canvas.getObjects()[i]._objects[k] && canvas.getObjects()[i]._objects[k].name == nodeName) {
            nObj = canvas.getObjects()[i]._objects[k];
          }
        }
      }
    }
    
    lineObj = canvas.getObjects()[idx];
    // update path
    var nx = elObj.left + elObj.scaleX*nObj.left + elObj.scaleX*elObj.width/2 + elObj.scaleX*nObj.width/2;
    var ny = elObj.top + elObj.scaleY*nObj.top + elObj.scaleY*elObj.height/2 + elObj.scaleY*nObj.height/2;
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    if (first) {
      var dx = Math.abs(nx - lineObj.get('x1'));
      var dy = Math.abs(ny - lineObj.get('y1'));
      x1 = nx;
      y1 = ny;
      if (dx > dy) {
        x2 = nx;
        y2 = lineObj.get('y2');
      } else {
        x2 = lineObj.get('x2');
        y2 = ny;
      }
    } else {
      var dx = Math.abs(nx - lineObj.get('x2'));
      var dy = Math.abs(ny - lineObj.get('y2'));
      x2 = nx;
      y2 = ny;
      if (dx > dy) {
        x1 = nx;
        y1 = lineObj.get('y1');
      } else {
        x1 = lineObj.get("x1");
        y1 = ny;
      }
    }

    var nline = new fabric.Line([x1, y1, x2, y2],
              {
              stroke: 'black',
              fill: "",
              strokeWidth: 3,
              });
    nline.selectable = true;
    nline.lockRotation = true;
    nline.lockMovementX = true;
    nline.lockMovementY = true;
    nline.lockScalingX = true;
    nline.lockScalingY = true;
    canvas.remove(canvas.getObjects()[idx]);
    nline.name=lineName;
    canvas.add(nline);
  }

  function findLine(name) {
    for (var i = 0; i < canvas.getObjects().length; ++i) {
      var l = canvas.getObjects()[i];
      if (l.name == name) {
        return l;
      }
    }
    return false;
  }

  canvas.on('mouse:down', function(o){
    if (window.addConnectionMode) { // if we are in add wire mode
      var pointer = canvas.getPointer(o.e); // mouse pointer
      if (!window.isDown) { // did not start drawing a wire yet
        // check if we clicked in an element
        if (o.subTargets && "name" in o.subTargets[0] && o.subTargets[0].name.includes("#N")) {
          // father is the element
          var father = o.target;
          o = o.subTargets[0]; // o is the node itself

          window.isDown = true; // set state so we know that we now started drawing a wire

          // get x and y of the node where we clicked
          var elObj = father;
          var nObj = o;
          var x0 = elObj.left + elObj.scaleX*nObj.left + elObj.scaleX*elObj.width/2 + elObj.scaleX*nObj.width/2;
          var y0 = elObj.top + elObj.scaleY*nObj.top + elObj.scaleY*elObj.height/2 + elObj.scaleY*nObj.height/2;
          // draw connection and save each line to be drawn in line
          
          var l = new fabric.Line([x0,y0,x0,y0],
                        {
                        stroke: 'black',
                        fill: "",
                        strokeWidth: 3,
                        });
          window.line = l;
          window.connectionCount += 1;
          window.line.name = "Conn"+window.connectionCount;
          canvas.add(window.line);
          window.connectionPoint1 = o.name;
          canvas.renderAll();
        }
      } else { // already selected first node
        // if it is a node, end selection
        console.log(o);
        if ("subTargets" in o && o.subTargets.length == 1 && "name" in o.subTargets[0] && o.subTargets[0].name.includes("#N")) {
          // father is the element
          var father = o.target;
          o = o.subTargets[0]; // o is the node itself

          // get x and y of the node where we clicked
          var elObj = father;
          var nObj = o;
          var nx = elObj.left + elObj.scaleX*nObj.left + elObj.scaleX*elObj.width/2 + elObj.scaleX*nObj.width/2;
          var ny = elObj.top + elObj.scaleY*nObj.top + elObj.scaleY*elObj.height/2 + elObj.scaleY*nObj.height/2;

          var lastItem = window.line;
          canvas.remove(lastItem)
          // add information in JSON
          mainJson.connections[lastItem.name] = {'from': window.connectionPoint1, 'to': o.name};

          var l = new fabric.Line( [lastItem.get('x1'), lastItem.get('y1'), nx, ny],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
          l.name = lastItem.name;
          canvas.add(l);

          window.isDown = false;
          window.addConnectionMode = false;
          window.line = {};
          canvas.forEachObject(function(o) {
            o.selectable = true;
            o.lockRotation = true;
            o.lockScalingX = true;
            o.lockScalingY = true;
            if (o.name.includes("Conn")) {
              o.lockMovementX = true;
              o.lockMovementY = true;
            }
          });
        } else if ('target' in o && o.target && 'name' in o.target && o.target.name.includes("Conn")) {
          // split line
          // add information in JSON
          bifurcate_name = o.target.name;
          bifurcate = mainJson.connections[bifurcate_name];
          window.extraCount += 1;
          mainJson.elements['E'+window.extraCount] = {}

          // bifurcate removing old line and making 2
          // o is the node where the bifurcation happens
          var o = o.target;

          // get x and y of the node where we clicked
          var nx = o.left;
          var ny = o.top;

          // remove old one
          var lastItem = findLine(bifurcate_name);
          canvas.remove(lastItem)

          window.connectionCount += 1;
          var l = new fabric.Line( [lastItem.get('x1'), lastItem.get('y1'), nx, ny],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
          l.name = "Conn"+window.connectionCount;
          canvas.add(l);
          mainJson.connections['Conn'+window.connectionCount] = {'from': bifurcate.from, 'to': 'E'+window.extraCount}

          window.connectionCount += 1;
          var l = new fabric.Line( [nx, ny, lastItem.get('x2'), lastItem.get('y2')],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
          l.name = "Conn"+window.connectionCount;
          canvas.add(l);
          mainJson.connections['Conn'+window.connectionCount] = {'from': 'E'+window.extraCount, 'to': bifurcate.to}

          // remove the old connection from the JSON
          delete mainJson.connections[bifurcate_name];

          // add new connection point in JSON
          var origname = window.line.name;
          mainJson.connections[origname] = {'from': window.connectionPoint1, 'to': 'E'+window.extraCount};

          // and draw the new connection
          var lastItem = window.line;
          canvas.remove(lastItem)

          var l = new fabric.Line( [lastItem.get('x1'), lastItem.get('y1'), nx, ny],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
          l.name = origname;
          canvas.add(l);

          window.isDown = false;
          window.addConnectionMode = false;
          window.line = {};
          canvas.forEachObject(function(o) {
            o.selectable = true;
            o.lockRotation = true;
            o.lockScalingX = true;
            o.lockScalingY = true;
            if (o.name.includes("Conn")) {
              o.lockMovementX = true;
              o.lockMovementY = true;
            }
          });
        } else { // it is not a node, nor another line, so make a line and keep going
          // add new connection point in JSON
          window.extraCount += 1;
          var origname = window.line.name;
          mainJson.elements["E"+window.extraCount] = {}
          mainJson.connections[origname] = {'from': window.connectionPoint1, 'to': 'E'+window.extraCount};

          // and draw the new connection
          var lastItem = window.line;
          canvas.remove(lastItem)

          var pointer = canvas.getPointer(o.e);
          var lastX = lastItem.get('x1');
          var lastY = lastItem.get('y1');
          var dx = Math.abs(lastX - pointer.x);
          var dy = Math.abs(lastY - pointer.y);
          if (dx > dy) {
            var nx = pointer.x;
            var ny = lastY;
          } else {
            var nx = lastX;
            var ny = pointer.y;
          }

          var l = new fabric.Line( [lastItem.get('x1'), lastItem.get('y1'), nx, ny],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
          l.name = origname;
          canvas.add(l);

          window.isDown = true;
          window.addConnectionMode = true;
          window.connectionPoint1 = "E"+window.extraCount;
          var l = new fabric.Line( [nx, ny, nx, ny],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
          window.connectionCount += 1;
          l.name = "Conn"+window.connectionCount;
          canvas.add(l);
          window.line = l;
          canvas.forEachObject(function(o) {
            o.selectable = true;
            o.lockRotation = true;
            o.lockScalingX = true;
            o.lockScalingY = true;
            if (o.name.includes("Conn")) {
              o.lockMovementX = true;
              o.lockMovementY = true;
            }
          });
        }
        canvas.renderAll();
      }
    }
  });
  canvas.on('mouse:move', function(o){
    if (window.addConnectionMode) {
      if (!window.isDown) return;
      var pointer = canvas.getPointer(o.e);
      var lastX = window.line.get('x1');
      var lastY = window.line.get('y1');
      var dx = Math.abs(lastX - pointer.x);
      var dy = Math.abs(lastY - pointer.y);
      var ex = 0;
      var ey = 0;
      if (pointer.x > lastX) ex = -15;
      if (pointer.x <= lastX) ex =  15;
      if (pointer.y > lastY) ey = -15;
      if (pointer.y <= lastY) ey =  15;
      if (dx > dy) {
        var nx = pointer.x+ex;
        var ny = lastY;
      } else {
        var nx = lastX;
        var ny = pointer.y+ey;
      }

      nline = new fabric.Line([lastX, lastY, nx, ny],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
      nline.name=window.line.name;
      canvas.remove(window.line);
      window.line = nline;
      canvas.add(nline);
      canvas.renderAll();
    }
  });




