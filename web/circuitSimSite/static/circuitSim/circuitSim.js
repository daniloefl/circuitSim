
  window.Rcount = 0;
  window.Vcount = 0;
  window.connectionCount = 0;

  window.addConnectionMode = false;
  window.connectionStarted = false;
  window.isDown = false;
  window.connectionPoint1 = '';
  window.connectionPoint2 = '';

  var line = [];

  var mainJson = {}

  mainJson.elements = {}
  mainJson.connections = {}

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

  function makeResistorGroup (name, left, top, horizontal) {
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
                        radius: 2,
                        fill: '#aaa',
                        left: 0-2,
                        top: 5-2
                        });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 2,
                        fill: '#aaa',
                        left: 32.5-2,
                        top: 5-2
                        });
      n2.name = name+"#N2";
      var resistor = new fabric.Group([poly, n1, n2, text], {
        left: left,
        top: top,
        scaleX: 2,
        scaleY: 2,
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
                        radius: 2,
                        fill: '#aaa',
                        left: -10+2,
                        top: 0-2
                        });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 2,
                        fill: '#aaa',
                        left: -10+2,
                        top: 32.5-2
                        });
      n2.name = name+"#N2";
      var resistor = new fabric.Group([poly, n1, n2, text], {
        left: left,
        top: top,
        scaleX: 2,
        scaleY: 2,
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
    resistor = makeResistorGroup(name, 150, 150, true);
    resistor.rotate = rotateResistor;
    console.log("Adding resistor named "+resistor.name);
    canvas.add(resistor);
    mainJson.elements[name] = {'name': name, 'value': 1.0};
  }

  function rotateElement() {
    o = canvas.getActiveObject();
    o.rotate();
    canvas.requestRenderAll();
  }

  function makeDCVGroup (name, left, top, horizontal) {
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
                        radius: 2,
                        fill: '#aaa',
                        left: 0-2,
                        top: 10-2
                         });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 2,
                        fill: '#aaa',
                        left: 40-2,
                        top: 10-2
                        });
      n2.name = name+"#N2";
      var source = new fabric.Group([c, l1, l2, n1, n2, text], {
        left: left,
        top: top,
        scaleX: 2,
        scaleY: 2,
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
                        radius: 2,
                        fill: '#aaa',
                        left: 20-2,
                        top: 30-2
                         });
      n1.name = name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 2,
                        fill: '#aaa',
                        left: 20-2,
                        top: -10-2
                        });
      n2.name = name+"#N2";
      var source = new fabric.Group([c, l1, l2, n1, n2, text], {
        left: left,
        top: top,
        scaleX: 2,
        scaleY: 2,
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

  function findConnection(node) {
    for (var c in mainJson.connections) {
      if (mainJson.connections[c].from == node) {
        return c;
      } else if (mainJson.connections[c].to == node) {
        return c;
      }
    }
  }

  function run() {
    // TODO
    // make net list
    var netlist = "";
    var lastNodeNumber = -1;
    var nodeId = {};
    for (var e in mainJson.elements) {
      if (e.includes("R") || e.includes("V")) { // two nodes
        var line = e+" ";
        var n1 = findConnection(e+"#N1");
        if (!(n1 in nodeId)) {
          lastNodeNumber += 1;
          nodeId[n1] = lastNodeNumber;
        }
        line += nodeId[n1]+" ";
        var n2 = findConnection(e+"#N2");
        if (!(n2 in nodeId)) {
          lastNodeNumber += 1;
          nodeId[n2] = lastNodeNumber;
        }
        line += nodeId[n2]+" ";
        line += mainJson.elements[e].value+"\n";
        netlist += line;
      }
    }
    console.log(netlist);
    var c = document.createElement("center");
    c.setAttribute("id", "content");
    var hide = document.createElement("button");
    hide.setAttribute("id", "resHideBtn");
    hide.setAttribute("class", "btn btn-info");
    hide.setAttribute("onclick", "$('#results_window').hide(); $('#results_window > #content').html('');");
    hide.appendChild(document.createTextNode("Hide"));
    c.appendChild(hide);
    var img = document.createElement("img");
    img.setAttribute("id", "result_img");
    img.setAttribute("src", "");
    c.appendChild(img);
    // run! (AJAX) TODO
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
        data: {
          'netlist': netlist
        },
        dataType: 'json',
        success: function (rawImageData) {
          $("#result_img").attr("src", "data:image/gif;base64," + rawImageData.img);
        }
      });
    // show results
    $('#results_window')[0].appendChild(c);
    $('#results_window').show();
  }

  function edit() {
    element = canvas.getActiveObject();
    if (element.name.includes("Conn")) return;
    e = mainJson.elements[element.name];
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
      var s = document.createElement('input');
      s.setAttribute('type', 'submit');
      s.setAttribute('value', 'Submit');
      s.setAttribute('onclick', 'endEdit()');
      c.appendChild(oname);
      c.appendChild(label);
      c.appendChild(text);
      c.appendChild(s);
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
      var s = document.createElement('input');
      s.setAttribute('type', 'submit');
      s.setAttribute('value', 'Submit');
      s.setAttribute('onclick', 'endEdit()');
      c.appendChild(oname);
      c.appendChild(label);
      c.appendChild(text);
      c.appendChild(s);
    }
    $('#edit_window')[0].appendChild(c);
    $('#edit_window').show();
  }
  function endEdit() {
    var objName = $('#content > #objName')[0].value;
    var value = $('#content > #value')[0].value;
    console.log(objName);
    console.log(value);
    mainJson.elements[objName].value = value;
    $('#edit_window > #content').html('');
    $('#edit_window').hide();
  }

  function addDCVoltageSource() {
    window.Vcount += 1;
    var name = "V"+window.Vcount;
    source = makeDCVGroup(name, 150, 150, true);
    source.rotate = rotateDCV;
    console.log("Adding source named "+source.name);
    canvas.add(source);
    mainJson.elements[name] = {'name': name, 'value': 1.0};
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
    } else if (element.name.includes("R") || element.name.includes("V")) {
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
  fabric.Object.prototype.transparentCorners = false;
  $("#addDCVoltageSourceBtn")[0].onclick = addDCVoltageSource;
  $("#addResistorBtn")[0].onclick = addResistor;
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
        elObj = canvas.getObjects()[i];;
        for (var k = 0; k < canvas.getObjects()[i]._objects.length; ++k) {
          if ("name" in canvas.getObjects()[i]._objects[k] && canvas.getObjects()[i]._objects[k].name == nodeName) {
            nObj = canvas.getObjects()[i]._objects[k];
          }
        }
      }
    }
   
    
    pointList = canvas.getObjects()[idx].pointList;
    // update path
    var nx = elObj.left + elObj.scaleX*nObj.left + elObj.scaleX*elObj.width/2 + elObj.scaleX*nObj.width/2;
    var ny = elObj.top + elObj.scaleY*nObj.top + elObj.scaleY*elObj.height/2 + elObj.scaleY*nObj.height/2;
    if (first) {
      var dx = Math.abs(nx - pointList[1][0]);
      var dy = Math.abs(ny - pointList[1][1]);
      pointList[0] = [nx, ny];
      if (dx > dy)
        pointList[1] = [pointList[1][0], ny];
      else
        pointList[1] = [nx, pointList[1][1]];
    } else {
      var dx = Math.abs(nx - pointList[pointList.length-2][0]);
      var dy = Math.abs(ny - pointList[pointList.length-2][1]);
      pointList[pointList.length-1] = [nx, ny];
      if (dx > dy)
        pointList[pointList.length-2] = [pointList[pointList.length-2][0], ny];
      else
        pointList[pointList.length-2] = [nx, pointList[pointList.length-2][1]];
    }

    var s = "M"+pointList[0][0]+","+pointList[0][1];
    for (var i = 1; i < pointList.length; ++i) {
      s += "L"+pointList[i][0]+","+pointList[i][1];
    }
    nline = new fabric.Path(s,
              {
              stroke: 'black',
              fill: "",
              });
    nline.pointList = pointList;
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

  canvas.on('object:moving', function(o) {
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

  canvas.on('mouse:down', function(o){
    if (window.addConnectionMode) {
      var pointer = canvas.getPointer(o.e);
      if (window.isDown) { // already selected first node
        // if it is a node, end selection
        if ("subTargets" in o && o.subTargets.length == 1 && "name" in o.subTargets[0] && o.subTargets[0].name.includes("#N")) {
          var father = o.target;
          o = o.subTargets[0];
          // add information in JSON
          var pointer = o;
          window.connectionCount += 1;
          mainJson.connections['Conn'+window.connectionCount] = {'from': window.connectionPoint1, 'to': pointer.name};


          // update path
          var elObj = father;
          var nObj = o;
          var nx = elObj.left + elObj.scaleX*nObj.left + elObj.scaleX*elObj.width/2 + elObj.scaleX*nObj.width/2;
          var ny = elObj.top + elObj.scaleY*nObj.top + elObj.scaleY*elObj.height/2 + elObj.scaleY*nObj.height/2;
          line.pointList.push( [nx, ny] );

          var s = "M"+line.pointList[0][0]+","+line.pointList[0][1];
          for (var i = 1; i < line.pointList.length; ++i) {
            s += "L"+line.pointList[i][0]+","+line.pointList[i][1];
          }
          nline = new fabric.Path(s,
                    {
                    stroke: 'black',
                    fill: "",
                    });
          nline.pointList = line.pointList;
          canvas.remove(line);
          line = nline;
          line.name="Conn"+window.connectionCount;
          canvas.add(line);

          window.isDown = false;
          window.addConnectionMode = false;
          window.line = null;
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
        } else { // it is not a node, make a line and keep going
          var pointer = canvas.getPointer(o.e);
          var lastX = line.pointList[line.pointList.length - 1][0];
          var lastY = line.pointList[line.pointList.length - 1][1];
          var dx = Math.abs(lastX - pointer.x);
          var dy = Math.abs(lastY - pointer.y);
          if (dx > dy) {
            var nx = pointer.x;
            var ny = lastY;
          } else {
            var nx = lastX;
            var ny = pointer.y;
          }
          line.pointList.push( [nx, ny] );

          var s = "M"+line.pointList[0][0]+","+line.pointList[0][1];
          for (var i = 1; i < line.pointList.length; ++i) {
            s += "L"+line.pointList[i][0]+","+line.pointList[i][1];
          }
          nline = new fabric.Path(s,
                    {
                    stroke: 'black',
                    fill: "",
                    });
          nline.name="Connection";
          nline.pointList = line.pointList;
          canvas.remove(line);
          line = nline;
          canvas.add(line);
        }
        canvas.renderAll();
      } else { // first point must be a node
        if (o.subTargets && "name" in o.subTargets[0] && o.subTargets[0].name.includes("#N")) {
          var father = o.target;
          o = o.subTargets[0];
          var pointer = o;
          window.isDown = true;
          var elObj = father;
          var nObj = o;
          var x0 = elObj.left + elObj.scaleX*nObj.left + elObj.scaleX*elObj.width/2 + elObj.scaleX*nObj.width/2;
          var y0 = elObj.top + elObj.scaleY*nObj.top + elObj.scaleY*elObj.height/2 + elObj.scaleY*nObj.height/2;
          line = new fabric.Path('M'+x0+','+y0,
                        {
                        stroke: 'black',
                        fill: "",
                        });
          line.pointList = []
          line.pointList.push( [x0,y0] );
          line.name="Connection";
          canvas.add(line);
          window.connectionPoint1 = pointer.name;
          canvas.renderAll();
        }
      }
    }
  });
  canvas.on('mouse:move', function(o){
    if (window.addConnectionMode) {
      if (!window.isDown) return;
      var pointer = canvas.getPointer(o.e);
      var lastX = line.pointList[line.pointList.length - 1][0];
      var lastY = line.pointList[line.pointList.length - 1][1];
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

      var s = "M"+line.pointList[0][0]+","+line.pointList[0][1];
      for (var i = 1; i < line.pointList.length; ++i) {
        s += "L"+line.pointList[i][0]+","+line.pointList[i][1];
      }
      s += "L"+nx+","+ny;

      nline = new fabric.Path(s,
                    {
                    stroke: 'black',
                    fill: "",
                    });
      nline.name="Connection";
      nline.pointList = line.pointList;
      canvas.remove(line);
      line = nline;
      canvas.add(line);
      canvas.renderAll();
    }
  });




