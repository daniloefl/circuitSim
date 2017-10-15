
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

  var mainJson = {'elements' : {}, 'connections': {}, 'simulation': {}};
  mainJson['simulation']['tFinal'] = 1;
  mainJson['simulation']['dt'] = 0.001;
  mainJson['simulation']['method'] = "BE";
  mainJson['simulation']['internalStep'] = 1;
  mainJson['simulation']['nodes'] = [];
  mainJson['simulation']['fft'] = false;

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

  function makeNodeGroup (name, left, top, scale = 2) {
    var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 0-4,
                        top: 5-4
                        });
    n1.name = name+"#N1";
    var singleNode = new fabric.Group([n1], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
    });
    singleNode.name = name;
    singleNode.lockRotation = true;
    singleNode.lockScalingX = true;
    singleNode.lockScalingY = true;
    singleNode.rotated = false;
    return singleNode;
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
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4,
                        top: 5-4+8
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 32.5-4,
                        top: 5-4+8
                        });
      var resistor = new fabric.Group([poly, n1, n2, t1, t2, text], {
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
                        left: -15+4,
                        top: 0-4
                        });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: -15+4,
                        top: 32.5-4
                        });
      n2.name = name+"#N2";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: -15+4+8,
                        top: 0-4
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: -15+4+8,
                        top: 32.5-4
                        });
      var resistor = new fabric.Group([poly, n1, n2, t1, t2, text], {
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

  function addResistor() {
    window.Rcount += 1;
    var name = "R"+window.Rcount;
    resistor = makeResistorGroup(name, 5, 5, true);
    resistor.rotate = rotateResistor;
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
      var p2 = new fabric.Line([20, 4, 20, 16], {
                        stroke: 'black',
                        fill: ''
                        });
      var p3 = new fabric.Line([23, 8, 23, 12], {
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
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4,
                        top: 10-4+8
                        });
      var gnd = new fabric.Group([p1, p2, p3, l1, n1, t1], {
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale,
        subTargetCheck: true
      });
    } else {
      var p1 = new fabric.Line([18, 18, 22, 18], {
                        stroke: 'black',
                        fill: ''
                        });
      var p2 = new fabric.Line([14, 14, 26, 14], {
                        stroke: 'black',
                        fill: ''
                        });
      var p3 = new fabric.Line([10, 10, 30, 10], {
                        stroke: 'black',
                        fill: ''
                        });
      var l1 = new fabric.Line([20, 0, 20, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 20-4,
                        top: 0-4
                         });
      n1.name = name+"#N1";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 20-4+8,
                        top: 0-4
                        });
      var gnd = new fabric.Group([p1, p2, p3, l1, n1, t1], {
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
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4,
                        top: 10-4+8
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 40-4,
                        top: 10-4+8
                        });
      var source = new fabric.Group([p1, p2, l1, l2, n1, n2, t1, t2, text], {
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
                        top: -3-4
                         });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 20-4,
                        top: 30-4
                        });
      n2.name = name+"#N2";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 20-4+8,
                        top: -3-4
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 20-4+8,
                        top: 30-4
                        });
      var source = new fabric.Group([p1, p2, l1, l2, n1, n2, t1, t2, text], {
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
      var tp = new fabric.Text("+", {
                        fontSize: 10,
                        left: 15,
                        top: 5
                        });
      var tm = new fabric.Text("-", {
                        fontSize: 10,
                        left: 22,
                        top: 5
                        });
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
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4,
                        top: 10-4+8
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 40-4,
                        top: 10-4+8
                        });
      var source = new fabric.Group([c, tp, tm, l1, l2, n1, n2, t1, t2, text], {
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
      var tp = new fabric.Text("+", {
                        fontSize: 10,
                        left: 17,
                        top: 3
                        });
      var tm = new fabric.Text("-", {
                        fontSize: 10,
                        left: 18,
                        top: 8
                        });
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
                        top: -10-4
                         });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#aaa',
                        left: 20-4,
                        top: 30-4
                        });
      n2.name = name+"#N2";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 20-4+8,
                        top: -10-4
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 20-4+8,
                        top: 30-4
                        });
      var source = new fabric.Group([c, tp, tm, l1, l2, n1, n2, t1, t2, text], {
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
    img_div1.setAttribute("id", "result_img");
    img_div.appendChild(img_div1)
    c.appendChild(img_div);
    c.appendChild(document.createElement("br"));

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
          $("#result_img").html(rawImageData.img);
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
    $('#edit_content')[0].appendChild(c);
    if (element.name.includes("R")) {
      var toAdd = '<input type="hidden" name="objName" id="objName" value="'+element.name+'"><div class="form-group row"><label for="objName" class="col-2 col-form-label">Value (Ohms)</label><div class="col-10"><input class="form-control" type="number" value="'+e.value+'" id="value"></div></div>'
      $('#edit_content').html(toAdd);
    } else if (element.name.includes("V")) {
      var toAdd = '<input type="hidden" name="objName" id="objName" value="'+element.name+'"><div class="form-group row"><label for="objName" class="col-2 col-form-label">Value (V)</label><div class="col-10"><input class="form-control" type="number" value="'+e.value+'" id="value"></div></div>'
      $('#edit_content').html(toAdd);
    } else if (element.name.includes("C")) {
      var toAdd = '<input type="hidden" name="objName" id="objName" value="'+element.name+'"><div class="form-group row"><label for="objName" class="col-2 col-form-label">Value (F)</label><div class="col-10"><input class="form-control" type="number" value="'+e.value+'" id="value"></div></div>'
      $('#edit_content').html(toAdd);
    }
  }
  function endEdit() {
    var objName = $('#edit_content #objName')[0].value;
    var value = $('#edit_content #value')[0].value;
    mainJson['elements'][objName].value = value;
    $('#edit_content').html('');
  }

  function endSimulOpt() {
    if (!$("#simulopt_content #nodes").val() || $("#simulopt_content #nodes").val().length == 0) {
      window.alert("You must select at least one node to analyse.");
      return;
    }
    var tFinal = $('#simulopt_content #tFinal')[0].value;
    var dt = $('#simulopt_content #dt')[0].value;
    var method = $('#simulopt_content #method')[0].value;
    var internalStep = $('#simulopt_content #internalStep')[0].value;
    var fft = $('#simulopt_content #fft')[0].value;
    var nodes = $('#simulopt_content #nodes')[0].value;
    mainJson['simulation']['tFinal'] = tFinal;
    mainJson['simulation']['dt'] = dt;
    mainJson['simulation']['method'] = method;
    mainJson['simulation']['internalStep'] = internalStep;
    if (fft == "true")
      mainJson['simulation']['fft'] = true;
    else
      mainJson['simulation']['fft'] = false;
    mainJson['simulation']['nodes'] = $("#simulopt_content #nodes").val();
    $('#simulopt_window').modal('hide');
    run();
    $('#results_window').modal('show');
  }

  function addDCVoltageSource() {
    window.Vcount += 1;
    var name = "V"+window.Vcount;
    source = makeDCVGroup(name, 5, 5, true);
    source.rotate = rotateDCV;
    canvas.add(source);
    mainJson['elements'][name] = {'name': name, 'value': 1.0};
  }

  function addCapacitor() {
    window.Ccount += 1;
    var name = "C"+window.Ccount;
    cap = makeCapacitorGroup(name, 5, 5, true);
    cap.rotate = rotateCapacitor;
    canvas.add(cap);
    mainJson.elements[name] = {'name': name, 'value': 1.0};
  }

  function addGnd() {
    window.GNDcount += 1;
    var name = "GND"+window.GNDcount;
    gnd = makeGndGroup(name, 5, 5, true);
    gnd.rotate = rotateGnd;
    canvas.add(gnd);
    mainJson.elements[name] = {'name': name};
  }

  function addConnection(e, state) {
    if (state) {
      window.addConnectionMode = true;
      canvas.selection = false;
      canvas.forEachObject(function(o) {
        o.selectable = false;
      });
    } else {
      window.addConnectionMode = false;
      canvas.selection = true;
      canvas.forEachObject(function(o) {
        o.selectable = true;
      });
    }
  }

  function deleteObj() {
    element = canvas.getActiveObject();
    if (element.name.includes("Conn")) {
      deleteConnection(element);
    } else if (element.name.includes("R") || element.name.includes("V") || element.name.includes("C") || element.name.includes("E")) {
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

  function prepareSimulOpt() {
    $("#simulopt_content #tFinal")[0].value = mainJson.simulation.tFinal;
    $("#simulopt_content #dt")[0].value = mainJson.simulation.dt;
    $("#simulopt_content #internalStep")[0].value = mainJson.simulation.internalStep;
    $("#simulopt_content #method")[0].value = mainJson.simulation.method;
    if (mainJson.simulation.fft) {
      $("#simulopt_content #fft").val("true");
    } else {
      $("#simulopt_content #fft").val("false");
    }
    $("#simulopt_content #nodes").html("");
    for (var k in mainJson.elements) {
      if (k.includes("Conn")) continue;
      if (k.includes("E")) continue;
      if (k.includes("GND")) continue;
      var number_nodes = 2;
      for (var n = 1; n <= number_nodes; ++n) {
        var nname = k + "#N" + n;
        var sel = false;
        for (var j = 0; j < mainJson.simulation.nodes.length; ++j) {
          if (mainJson.simulation.nodes[j] == nname) {
            sel = true;
            break;
          }
        }
        var o = document.createElement("option");
        o.value = nname;
        o.innerHTML = nname;
        $("#simulopt_content #nodes")[0].appendChild(o);
        $("#simulopt_content #nodes option[value='" + nname + "']").prop("selected", sel);
      }
    }
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
  $("#addDCVoltageSourceLink")[0].onclick = addDCVoltageSource;
  $("#addResistorBtn")[0].onclick = addResistor;
  $("#addResistorLink")[0].onclick = addResistor;
  $("#addCapacitorBtn")[0].onclick = addCapacitor;
  $("#addCapacitorLink")[0].onclick = addCapacitor;
  $("#addGndBtn")[0].onclick = addGnd;
  $("#addGndLink")[0].onclick = addGnd;
  $("#addConnectionBtn").on('switchChange.bootstrapSwitch', addConnection);
  function addConnectionLink() {
    $('#addConnectionBtn').bootstrapSwitch('toggleState');
  }
  $("#addConnectionLink")[0].onclick = addConnectionLink;
  $("#deleteBtn")[0].onclick = deleteObj;
  $("#deleteLink")[0].onclick = deleteObj;
  $("#rotateBtn")[0].onclick = rotateElement;
  $("#rotateLink")[0].onclick = rotateElement;
  $("#editBtn")[0].onclick = edit;
  $("#editLink")[0].onclick = edit;
  $("#simulOptBtn")[0].onclick = prepareSimulOpt;
  $("#simulOptLink")[0].onclick = prepareSimulOpt;
  
  function save() {
    var canvas_json = canvas.toJSON(['name']);
    full_json = {};
    full_json.mainJson = mainJson;
    full_json.canvasJson = canvas_json;
    var str_json = JSON.stringify(full_json);
    var blob = new Blob([str_json], {type: "application/json"});
    var url  = URL.createObjectURL(blob);
    $('#save_content').html('<div class="form-group row"><label for="download_fname" class="col-2 col-form-label">File name</label><div class="col-10"><input class="form-control" type="text" value="circuit.json" id="download_fname"></div></div>');
    $('#save_close')[0].onclick = function() {
      var element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', $('#download_fname')[0].value);
      element.style.display = 'none';
      document.body.appendChild(element);
      $('#save_close')[0].download = $('#download_fname')[0].value;
      element.click();
      document.body.removeChild(element);
    }
  }
  $('#saveLink')[0].onclick = save;

  function openFile() {
    var files = $('#open_file_input')[0].files;
    if (files.length <= 0) {
      return false;
    }

    var fr = new FileReader();

    fr.onload = function(e) { 
      var result = JSON.parse(e.target.result);
      mainJson = result.mainJson;
      prepareSimulOpt();
      canvas.loadFromJSON(result.canvasJson, function() {
        canvas.renderAll(); 
      },function(o,object){
      });
    }

    fr.readAsText(files.item(0));
  }
  $('#open_file_load')[0].onclick = openFile;

  $(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
      if (window.addConnectionMode) {
        canvas.remove(window.line);
        window.line = null;
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
      $('#addConnectionBtn').bootstrapSwitch('state', false, false);
    } else if (e.keyCode == 46) { // delete
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

  function moveNode(nodeName, x, y) {
    // TODO
    var idx = -1;
    for (var k = 0; k < canvas.getObjects().length; ++k) {
      if (canvas.getObjects()[k].name == nodeName) {
        idx = k;
        break;
      }
    }
    if (canvas.getObjects()[idx].fresh) return;
    canvas.remove(canvas.getObjects()[idx]);
    var en = makeNodeGroup(nodeName, x-4, y-4, 2);
    en.fresh = true;
    canvas.add(en);

    for (var key in mainJson.connections) {
      if (mainJson.connections[key].from == nodeName) {
        moveLine(key, nodeName, true);
      }
      if (mainJson.connections[key].to == nodeName) {
        moveLine(key, nodeName, false);
      }
    }
  }

  // TODO
  // Fails in many cases!
  canvas.on('object:moving', function(o) {
    for (var k = 0; k < canvas.getObjects().length; ++k) {
      canvas.getObjects()[k].fresh = false;
    }
    o = o.target;
    for (var i = 0; i < o._objects.length; ++i) {
      if (("name" in o._objects[i]) && o._objects[i].name.includes("#N")) {
        // found node
        for (var key in mainJson.connections) {
          if (mainJson.connections[key].from == o._objects[i].name) {
            // move this connection
            moveLine(key, o._objects[i].name, true);

          }
          if (mainJson.connections[key].to == o._objects[i].name) {
            // move this connection
            moveLine(key, o._objects[i].name, false);
          }
        }
      }
    }
  });

  function moveLine(lineName, nodeName, first) {
    var elName = nodeName.split("#")[0];
    var nName = "";
    if (!nodeName.includes("E")) nName = nodeName.split('#')[1];
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
    if (lineObj.fresh) return;

    // update path
    var nx = elObj.left;
    var ny = elObj.top;
    if (nName != "") {
      nx += elObj.scaleX*nObj.left + elObj.scaleX*elObj.width/2 + elObj.scaleX*nObj.width/2;
      ny += elObj.scaleY*nObj.top + elObj.scaleY*elObj.height/2 + elObj.scaleY*nObj.height/2;
    } else {
      nx += 4;
      ny += 4;
    }
    var x1 = lineObj.get('x1');
    var y1 = lineObj.get('y1');
    var x2 = lineObj.get('x2');
    var y2 = lineObj.get('y2');
    var dx = Math.abs(x1 - x2);
    var dy = Math.abs(y1 - y2);
    if (first) {
      x1 = nx;
      y1 = ny;
      if (dx > dy) {
        y2 = ny;
      } else {
        x2 = nx;
      }
    } else {
      x2 = nx;
      y2 = ny;
      if (dx > dy) {
        y1 = ny;
      } else {
        x1 = nx;
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
    nline.fresh = true;
    canvas.add(nline);

    // look for all connected to this line
    for (var key in mainJson.connections) {
      if (first && mainJson.connections[key].from == nodeName) {
        var toMove = mainJson.connections[key].to;
        if (toMove.includes("E")) {
          moveNode(toMove, x2, y2);
        }
      }
      if (!first && mainJson.connections[key].to == nodeName) {
        var toMove = mainJson.connections[key].from;
        if (toMove.includes("E")) {
          moveNode(toMove, x1, y1);
        }
      }
    }
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
        if (o.subTargets && o.subTargets.length > 0 && "name" in o.subTargets[0] && o.subTargets[0].name.includes("#N")) {
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
        } else { // nothing selected yet and we did not select an element
          // just stop
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
          $('#addConnectionBtn').bootstrapSwitch('state', false, false);
        }
      } else { // already selected first node
        // if it is a node, end selection
        // TODO
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

          var lastX = lastItem.get('x1');
          var lastY = lastItem.get('y1');
          var dx = Math.abs(lastX - nx);
          var dy = Math.abs(lastY - ny);
          if (dx > dy) {
            lastY = ny;
          } else {
            lastX = nx;
          }

          canvas.remove(lastItem)
          // add information in JSON
          mainJson.connections[lastItem.name] = {'from': window.connectionPoint1, 'to': o.name};

          var l = new fabric.Line( [lastX, lastY, nx, ny],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
          l.name = lastItem.name;
          canvas.add(l);
          var en = findLine(window.connectionPoint1);
          en.left = lastX-4;
          en.top = lastY-4;

          window.isDown = false;
          window.line = {};
        } else if ('target' in o && o.target && 'name' in o.target && o.target.name.includes("Conn")) {
          // TODO
          // split line
          // add information in JSON
          bifurcate_name = o.target.name;
          bifurcate = mainJson.connections[bifurcate_name];
          window.extraCount += 1;
          mainJson.elements['E'+window.extraCount] = {'name': 'E'+window.extraCount}

          // bifurcate removing old line and making 2
          // o is the node where the bifurcation happens
          var o = o.target;

          // get x and y of the node where we clicked
          var pointer = canvas.getPointer(o.e);
          var nx = pointer.x;
          var ny = pointer.y;

          // remove old one
          var lastItem = findLine(bifurcate_name);

          window.connectionCount += 1;
          var l = new fabric.Line( [lastItem.get('x1'), lastItem.get('y1'), nx, ny],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
          l.name = "Conn"+window.connectionCount;
          canvas.remove(lastItem)
          canvas.add(l);
          mainJson.connections['Conn'+window.connectionCount] = {'from': bifurcate.from, 'to': 'E'+window.extraCount}

          var en = makeNodeGroup("E"+window.extraCount, nx-4, ny-4, 2);
          canvas.add(en);

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
          window.line = {};
        } else { // it is not a node, nor another line, so make a line and keep going
          // add new connection point in JSON
          window.extraCount += 1;
          var origname = window.line.name;
          mainJson.elements["E"+window.extraCount] = {'name': "E"+window.extraCount}
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

          var en = makeNodeGroup("E"+window.extraCount, nx, ny, 2);
          canvas.add(en);

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



