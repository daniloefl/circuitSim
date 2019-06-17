
  window.Rcount = 0;
  window.Vcount = 0;
  window.Ccount = 0;
  window.Lcount = 0;
  window.Dcount = 0;
  window.Qcount = 0;
  window.connectionCount = 0;
  window.extraCount = 0;
  window.GNDcount = 0;

  window.addConnectionMode = false;
  window.connectionStarted = false;
  window.currentConnection = null;

  window.isDown = false;

  var elementList = [];
  var connectionList = [];

  var simulation = {};
  simulation['tFinal'] = 1;
  simulation['dt'] = 0.001;
  simulation['method'] = "BE";
  simulation['internalStep'] = 1;
  simulation['nodes'] = [];
  simulation['fft'] = false;

  // using jQuery
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }
  var csrftoken = getCookie('csrftoken');

  function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }

  function clearAll() {
    for (var k = elementList.length-1; k >= 0; k--) {
      c = elementList[k];
      c.remove();
      c = null;
    }
    for (var k = connectionList.length-1; k >= 0; k--) {
      c = connectionList[k];
      c.remove();
      c = null;
    }
    canvas.renderAll();
    window.Rcount = 0;
    window.Vcount = 0;
    window.Ccount = 0;
    window.Lcount = 0;
    window.Dcount = 0;
    window.Qcount = 0;
    window.connectionCount = 0;
    window.extraCount = 0;
    window.GNDcount = 0;
  };

  function findConnection(name) {
    for (var k in connectionList) {
      if (connectionList[k].name == name) {
        return connectionList[k];
      }
    }
  };

  // find element and return a triplet with the element, the name of the subnode (or false) and the drawn subnode (or false)
  function findElement(name) {
    for (var k in elementList) {
      if (elementList[k].name == name) {
        return [elementList[k], false, false];
      }
      for (var l in elementList[k].nodes) {
        if (name == (elementList[k].name+"#"+elementList[k].nodes[l])) {
          if (name == elementList[k].drawn.name) {
            return [elementList[k], elementList[k].nodes[l], elementList[k].drawn];
          }
          if (elementList[k].drawn != null) {
            for (var n in elementList[k].drawn._objects) {
              if (name == elementList[k].drawn._objects[n].name) {
                return [elementList[k], elementList[k].nodes[l], elementList[k].drawn._objects[n]];
              }
            }
          }
          return [elementList[k], elementList[k].nodes[l], false];
        }
      }
    }
    return false;
  };

  function startConnectionInNode(firstNodeName, x, y) {
    window.connectionCount = window.connectionCount + 1;
    var connectionName = "Conn"+window.connectionCount;
    addNode("ETMP", x, y);
    var n = new Connection(connectionName);
    n.nodeList.push(firstNodeName);
    n.nodeList.push("ETMP#N1");
    connectionList.push(n);
    connectionList[connectionList.length-1].draw();
    window.currentConnection = connectionList[connectionList.length-1];
    canvas.renderAll();
  };

  function moveNode(nodeName, x, y) {
    n = findElement(nodeName);
    n[0].left = x;
    n[0].top = y;
    n[0].draw();
    window.currentConnection.draw();
    canvas.renderAll();
  };

  // adjust all connections to this node
  function adjustConnectionsTo(aNode) {
    // get the main element fo this (it could be a node of a larger element ... move only the full element)
    node = findElement(aNode);
    // loop over all connections to find the ones connected to this node
    for (var k in connectionList) {
      c = connectionList[k];

      // find connections that are connected to node or to that sub-element
      var foundIdx = -1;
      for (var m in c.nodeList) {
        n = c.nodeList[m];
        if (aNode == n) {
          // found connection that includes this node
          foundIdx = m;
          break;
        }
      }

      // move all other nodes in the connection
      if (foundIdx >= 0) {
        //console.log("Found connection ", c);
        // this is the original connection
        n1 = findElement(c.nodeList[foundIdx]);
        n1[0].adjusted = true;

        var matrix1 = n1[2].calcTransformMatrix();
        var x1 = matrix1[4];
        var y1 = matrix1[5];

        // for each other connection ...
        for (var m in c.nodeList) {
          if (m == foundIdx) continue; // except the original one
          n2 = findElement(c.nodeList[m]);
          if (n2[0].adjusted) continue; // and the ones already adjusted (avoid infinite loop)

          //console.log("Found node to be adjusted ", n2[0]);

          var matrix2 = n2[2].calcTransformMatrix();
          var x2 = matrix2[4];
          var y2 = matrix2[5];

          //console.log("Node diff to subelement ", n2[0].left - x2, n2[0].top - y2);

          // find out if the they are mostly horizontal or mostly vertical
          var dx = Math.abs(x2 - x1);
          var dy = Math.abs(y2 - y1);
          // and move the object so that it becomes purely only horizontal or only vertical
          if (dx > dy) {
            var d = -(y2 - n2[0].top);
            n2[0].top = y1 + d;
          } else {
            var d = -(x2 - n2[0].left);
            n2[0].left = x1 + d;
          }
          // mark it as adjusted so we do not do this again
          n2[0].adjusted = true;
          // now we have changed n2, keeping n1 still
          // marked both such that they should no longer be looked at
          // iterate on all other connections to n2 now

          //console.log("Adjusted node: ", n2[0]);

          // find all connections in n2
          var otherList = [];
          for (var n in n2[0].nodes) {
            if ((n2[0].name+"#"+n2[0].nodes[n]) == c.nodeList[m]) continue;
            otherList.push(n2[0].name+"#"+n2[0].nodes[n])
          }
          //console.log("Other nodes to adjust:", otherList)
          for (var other in otherList) {
            adjustConnectionsTo(otherList[other]);
          }
        }
      }
    }
  };

  // adjust connections such that each wire is only vertical or only horizontal, due to a change in seedNode
  function adjustNodesConnectedTo(seedNode) {
    //console.log("Adjusting nodes relative to seed ", seedNode);
    // keep a boolean value in each element to know which ones we have visited and stop infinite loops
    for (var k in elementList) {
      elementList[k].adjusted = false;
    }
    // adjust connections to the seedNode
    adjustConnectionsTo(seedNode);
    for (var k in elementList) {
      if (elementList[k].adjusted) {
        elementList[k].draw();
      }
    }
    for (var k in connectionList) {
      connectionList[k].draw();
    }
  };

  function endConnectionInNode(lastNodeName) {
    //console.log("Ending connection in node", lastNodeName);
    n = findElement("ETMP");
    n[0].remove();
    n[0] = null;
    window.currentConnection.nodeList[window.currentConnection.nodeList.length-1] = lastNodeName
    window.currentConnection = false;
    canvas.renderAll();
  };

  function makeStepInConnection(x, y) {
    n = findElement("ETMP");
    n[0].remove();
    n[0] = null;

    // keep it straight
    firstNode = findElement(window.currentConnection.nodeList[0]);
    var obj = firstNode[2];
    var matrix = obj.calcTransformMatrix();
    var lastX = matrix[4];
    var lastY = matrix[5];

    var dx = Math.abs(lastX - x);
    var dy = Math.abs(lastY - y);
    if (dx > dy) {
      var nx = x;
      var ny = lastY-9;
    } else {
      var nx = lastX-9;
      var ny = y;
    }
    window.extraCount = window.extraCount + 1;
    var lastNodeName = "E"+window.extraCount;
    addNode(lastNodeName, nx, ny);
    window.currentConnection.nodeList[window.currentConnection.nodeList.length-1] = lastNodeName+"#N1";
    window.currentConnection.draw();
    window.currentConnection = false;
    startConnectionInNode(lastNodeName+"#N1", x, y);
  };

  function bifurcateAndStartConnection(conn, x, y) {
    window.extraCount = window.extraCount + 1;
    var lastNodeName = "E"+window.extraCount;

    // project x and y in the line
    var e1 = findElement(conn.nodeList[0]);
    var e2 = findElement(conn.nodeList[1]);
    var matrix1 = e1[2].calcTransformMatrix();
    var x1 = matrix1[4];
    var y1 = matrix1[5];
    var matrix2 = e2[2].calcTransformMatrix();
    var x2 = matrix2[4];
    var y2 = matrix2[5];
    var lx = (x2 - x1);
    var ly = (y2 - y1);
    var x0 = (x - x1);
    var y0 = (y - y1);
    // normal to the line
    var nx = ((-ly)/Math.sqrt(lx*lx + ly*ly));
    var ny = ((lx)/Math.sqrt(lx*lx + ly*ly));
    var xp = (-ny*x0 + nx*y0)*(-ny);
    var yp = (-ny*x0 + nx*y0)*nx;
    xp += x1;
    yp += y1;

    addNode(lastNodeName, xp-9, yp-9);

    // now bifurcate conn
    window.connectionCount = window.connectionCount + 1;
    var connectionName1 = "Conn"+window.connectionCount;
    var n = new Connection(connectionName1);
    n.nodeList.push(conn.nodeList[0]);
    n.nodeList.push(lastNodeName+"#N1");
    connectionList.push(n);
    connectionList[connectionList.length-1].draw();

    window.connectionCount = window.connectionCount + 1;
    var connectionName2 = "Conn"+window.connectionCount;
    var n = new Connection(connectionName2);
    n.nodeList.push(lastNodeName+"#N1");
    n.nodeList.push(conn.nodeList[1]);
    connectionList.push(n);
    connectionList[connectionList.length-1].draw();

    // remove conn
    conn.remove();
    conn = null;

    // and create new connection
    window.connectionCount = window.connectionCount + 1;
    var connectionName = "Conn"+window.connectionCount;
    addNode("ETMP", x, y);
    var n = new Connection(connectionName);
    n.nodeList.push(lastNodeName+"#N1");
    n.nodeList.push("ETMP#N1");
    connectionList.push(n);
    connectionList[connectionList.length-1].draw();
    window.currentConnection = connectionList[connectionList.length-1];
  };

  function bifurcateAndEndConnection(conn, x, y) {
    n = findElement("ETMP");
    n[0].remove();
    n[0] = null;
    window.extraCount = window.extraCount + 1;
    var lastNodeName = "E"+window.extraCount;

    // project x and y in the line
    var e1 = findElement(conn.nodeList[0]);
    var e2 = findElement(conn.nodeList[1]);
    var matrix1 = e1[2].calcTransformMatrix();
    var x1 = matrix1[4];
    var y1 = matrix1[5];
    var matrix2 = e2[2].calcTransformMatrix();
    var x2 = matrix2[4];
    var y2 = matrix2[5];
    var lx = (x2 - x1);
    var ly = (y2 - y1);
    var x0 = (x - x1);
    var y0 = (y - y1);
    // normal to the line
    var nx = ((-ly)/Math.sqrt(lx*lx + ly*ly));
    var ny = ((lx)/Math.sqrt(lx*lx + ly*ly));
    var xp = (-ny*x0 + nx*y0)*(-ny);
    var yp = (-ny*x0 + nx*y0)*nx;
    xp += x1;
    yp += y1;


    addNode(lastNodeName, xp-9, yp-9);
    window.currentConnection.nodeList[window.currentConnection.nodeList.length-1] = lastNodeName+"#N1";
    window.currentConnection.draw();
    window.currentConnection = false;

    // now bifurcate conn
    window.connectionCount = window.connectionCount + 1;
    var connectionName1 = "Conn"+window.connectionCount;
    var n = new Connection(connectionName1);
    n.nodeList.push(conn.nodeList[0]);
    n.nodeList.push(lastNodeName+"#N1");
    connectionList.push(n);
    connectionList[connectionList.length-1].draw();

    window.connectionCount = window.connectionCount + 1;
    var connectionName2 = "Conn"+window.connectionCount;
    var n = new Connection(connectionName2);
    n.nodeList.push(lastNodeName+"#N1");
    n.nodeList.push(conn.nodeList[1]);
    connectionList.push(n);
    connectionList[connectionList.length-1].draw();

    // and remove conn
    conn.remove();
    conn = null;
  };

  function dropConnection() {
    n = findElement("ETMP");
    n[0].remove();
    n[0] = null;
    window.currentConnection.remove();
    window.currentConnection = null;
    canvas.renderAll();
  };

  class Connection {
    constructor(name) {
      this.name = name;
      this.hasBeenAddedInCanvas = false;
      this.nodeList = [];
    }
    makeSVG() {
      this.drawn = [];
      for (var k = 0; k < this.nodeList.length-1; ++k) {
        var n1 = findElement(this.nodeList[k]);
        var obj1 = n1[2];
        var matrix1 = obj1.calcTransformMatrix();
        var x1 = matrix1[4];
        var y1 = matrix1[5];

        var n2 = findElement(this.nodeList[k+1]);
        var obj2 = n2[2];
        var matrix2 = obj2.calcTransformMatrix();
        var x2 = matrix2[4];
        var y2 = matrix2[5];

        var l = new fabric.Line([x1,y1,x2,y2],
                    {
                    stroke: 'black',
                    fill: "",
                    strokeWidth: 3,
                    });
        l.lockRotation = true;
        l.lockScalingX = true;
        l.lockScalingY = true;
        l.father = this;
        l.itemInNodeList = k;
        this.drawn.push(l);
      }
    }
    draw() {
      if (this.hasBeenAddedInCanvas) {
        for (var k in this.drawn) {
          canvas.remove(this.drawn[k]);
          k = null;
        }
      }
      this.makeSVG();
      for (var k in this.drawn) {
        this.drawn[k].selectable = false;
        this.drawn[k].lockRotation = true;
        this.drawn[k].lockMovementX = true;
        this.drawn[k].lockMovementY = true;
        this.drawn[k].lockScalingX = true;
        this.drawn[k].lockScalingY = true;
        canvas.add(this.drawn[k]);
      }
      this.hasBeenAddedInCanvas = true;
    }
    remove() {
      for (var k in this.drawn) {
        if (this.hasBeenAddedInCanvas) {
          canvas.remove(this.drawn[k]);
        }
        k = null;
      }
      this.drawn = [];
      this.hasBeenAddedInCanvas = false;
      connectionList.splice(connectionList.indexOf(this), 1);
    }

  }

  class Element {
    constructor(name, left, top, scale = 2) {
      this.name = name;
      this.left = left;
      this.top = top;
      this.scale = scale;
      this.hasBeenAddedInCanvas = false;
      this.r = 0;
      this.f = false;
      this.nodes = [];
      this.lock = false;
    }
    rotate() {
      this.r = (this.r + 1) % 4;
      this.draw();
    }
    flip() {
      this.f = !this.f;
      this.draw();
    }
    makeSVG() {
      throw new Error("This method must be implemented in an inherited class to define this.drawn");
    }
    draw() {
      if (this.hasBeenAddedInCanvas) {
        canvas.remove(this.drawn);
        this.drawn = null;
      }
      this.makeSVG();
      if (this.lock) {
        this.drawn.selectable = false;
        this.drawn.lockMovementX = false;
        this.drawn.lockMovementY = false;
        this.drawn.lockRotation = true;
      } else {
        this.drawn.selectable = true;
        this.drawn.lockMovementX = false;
        this.drawn.lockMovementY = false;
        this.drawn.lockRotation = true;
      }
      this.drawn.lockScalingX = true;
      this.drawn.lockScalingY = true;
      canvas.add(this.drawn);
      this.hasBeenAddedInCanvas = true;
      canvas.renderAll();
    }
    remove() {
      if (this.hasBeenAddedInCanvas) {
        canvas.remove(this.drawn);
      }
      this.drawn = null;
      this.hasBeenAddedInCanvas = false;
      elementList.splice(elementList.indexOf(this), 1);
      canvas.renderAll();
    }
  }

  class Node extends Element {
    constructor(name, left, top, scale = 2) {
      super(name, left, top, scale);
      this.nodes = ['N1'];
    }
    makeSVG() {
      var n1 = new fabric.Circle({
                          radius: 4,
                          fill: '#000',
                          left: 0-4,
                          top: 5-4
                          });
      n1.name = this.name+"#N1";
      var singleNode = new fabric.Group([n1], {
          left: this.left,
          top: this.top,
          scaleX: this.scale,
          scaleY: this.scale,
          subTargetCheck: true
      });
      singleNode.lockRotation = true;
      singleNode.lockScalingX = true;
      singleNode.lockScalingY = true;
      singleNode.father = this;
      this.drawn = singleNode;
    }
  }

  class Resistor extends Element {
    constructor(name, left, top, r, scale = 2) {
      super(name, left, top, scale);
      this.r = r;
      this.param = {'value': 1.0};
      this.nodes = ['N1', 'N2'];
    }
    makeSVG() {
      var angle = (this.r%4)*90;
      var angleText = -(this.r%4)*90;
      var textTop = 0;
      var textLeft = 0;
      if (this.r % 4 == 1) textTop = 10;
      if (this.r % 4 == 2) { textTop = 10; textLeft = 5; }
      if (this.r % 4 == 3) textLeft = 10;
      var poly = new fabric.Path('M0,5L5,5L7.5,0L10,10L12.5,0L15,10L17.5,0L20,10L22.5,0L25,10L27.5,5L32.5,5',
                        {
                        stroke: 'black',
                        fill: "",
                        left: 0,
                        top: 0,
                        });
      var text = new fabric.Text(this.name, {
                        fontSize: 12,
                        left: 10+textLeft,
                        top: 20+textTop,
                        angle: angleText
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 0-4,
                        top: 5-4,
                        });
      n1.name = this.name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 32.5-4,
                        top: 5-4,
                        });
      n2.name = this.name+"#N2";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4+textLeft,
                        top: 5-4+8+textTop,
                        angle: angleText
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 32.5-4+textLeft,
                        top: 5-4+8+textTop,
                        angle: angleText
                        });
      var resistor = new fabric.Group([poly, n1, n2, t1, t2, text], {
        left: this.left,
        top: this.top,
        scaleX: this.scale,
        scaleY: this.scale,
        subTargetCheck: true,
        angle: angle
      });
      resistor.father = this;
      this.drawn = resistor;
    }
  }

  class Ground extends Element {
    constructor(name, left, top, r, scale = 2) {
      super(name, left, top, scale);
      this.r = r;
      this.param = {};
      this.nodes = ['N1'];
    }
    makeSVG() {
      var angle = (this.r%4)*90;
      var angleText = -(this.r%4)*90;
      var textTop = 0;
      var textLeft = 0;
      if (this.r % 4 == 1) textTop = 15;
      if (this.r % 4 == 2) textTop = -10;
      if (this.r % 4 == 3) textLeft = 10;
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
                        fill: '#000',
                        left: 0-4,
                        top: 10-4
                         });
      n1.name = this.name+"#N1";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4+textLeft,
                        top: 10-4+8+textTop,
                        angle: angleText
                        });
      var gnd = new fabric.Group([p1, p2, p3, l1, n1, t1], {
        left: this.left,
        top: this.top,
        scaleX: this.scale,
        scaleY: this.scale,
        subTargetCheck: true,
        angle: angle
      });
      gnd.father = this;
      this.drawn = gnd;
    }
  }

  class Inductor extends Element {
    constructor(name, left, top, r, scale = 2) {
      super(name, left, top, scale);
      this.r = r;
      this.param = {'value': 1.0};
      this.nodes = ['N1', 'N2'];
    }
    makeSVG() {
      var angle = (this.r%4)*90;
      var angleText = -(this.r%4)*90;
      var textTop = 0;
      var textLeft = 0;
      if (this.r % 4 == 1) textTop = 15;
      if (this.r % 4 == 2) { textTop = 10; textLeft = 5; }
      if (this.r % 4 == 3) textLeft = 10;
      var a1 = new fabric.Path('M 10 10 Q 20,20 15,0 M 15,0 Q 10,10 15,15 M 15,15 Q 25,20 20,0 M 20,0 Q 15,10 20,15 M 20,15 Q 30,20 25,0 M 25,0 Q 20,10 25,15 M 25,15 Q 30,10 32,10 M 32,10', { fill: '', stroke: 'black'});
      var l1 = new fabric.Line([4, 10, 10, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var l2 = new fabric.Line([32, 10, 40, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var text = new fabric.Text(this.name, {
                        fontSize: 12,
                        left: 10+textLeft,
                        top: 20+textTop,
                        angle: angleText
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 0-4,
                        top: 10-4
                         });
      n1.name = this.name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 40-4,
                        top: 10-4
                        });
      n2.name = this.name+"#N2";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4+textLeft,
                        top: 10-4+8+textTop,
                        angle: angleText
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 40-4+textLeft,
                        top: 10-4+8+textTop,
                        angle: angleText
                        });
      var inductor = new fabric.Group([a1, l1, l2, n1, n2, t1, t2, text], {
        left: this.left,
        top: this.top,
        scaleX: this.scale,
        scaleY: this.scale,
        subTargetCheck: true,
        angle: angle
      });
      inductor.father = this;
      this.drawn = inductor;
    }
  }

  class Capacitor extends Element {
    constructor(name, left, top, r, scale = 2) {
      super(name, left, top, scale);
      this.r = r;
      this.param = {'value': 1.0};
      this.nodes = ['N1', 'N2'];
    }
    makeSVG() {
      var angle = (this.r%4)*90;
      var angleText = -(this.r%4)*90;
      var textTop = 0;
      var textLeft = 0;
      if (this.r % 4 == 1) textTop = 15;
      if (this.r % 4 == 2) { textTop = 10; textLeft = 5; }
      if (this.r % 4 == 3) textLeft = 10;
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
      var text = new fabric.Text(this.name, {
                        fontSize: 12,
                        left: 10+textLeft,
                        top: 20+textTop,
                        angle: angleText
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 0-4,
                        top: 10-4
                         });
      n1.name = this.name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 40-4,
                        top: 10-4
                        });
      n2.name = this.name+"#N2";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4+textLeft,
                        top: 10-4+8+textTop,
                        angle: angleText
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 40-4+textLeft,
                        top: 10-4+8+textTop,
                        angle: angleText
                        });
      var source = new fabric.Group([p1, p2, l1, l2, n1, n2, t1, t2, text], {
        left: this.left,
        top: this.top,
        scaleX: this.scale,
        scaleY: this.scale,
        subTargetCheck: true,
        angle: angle
      });
      source.father = this;
      this.drawn = source;
    }
  }

  class Transistor extends Element {
    constructor(name, left, top, r, scale = 2) {
      super(name, left, top, scale);
      this.r = r;
      this.param = {'alpha': 0.99, 'alphaRev': 0.5, 'type': 'npn', 'IsBE': 3.7751345e-14, 'VtBE': 25e-3, 'IsBC': 3.7751345e-14, 'VtBC': 25e-3};
      this.nodes = ['N1', 'N2', 'N3'];
    }
    makeSVG() {
      var angle = (this.r%4)*90;
      var angleText = -(this.r%4)*90;
      var textTop = 0;
      var textLeft = 0;
      if (this.r % 4 == 1) { textTop = 7; }
      if (this.r % 4 == 2) { textTop = 10; textLeft = 20; }
      if (this.r % 4 == 3) { textLeft = 10; textTop = -10; }
      var tr1 = new fabric.Line([30, 10, 20, 20],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var tr2 = new fabric.Line([20, 20, 10, 10],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var tr3 = new fabric.Triangle(
                        {
                        height: 4,
                        width: 4,
                        left: 10-2,
                        top: 10+2,
                        angle: -45,
                        stroke: 'black',
                        fill: "black"}
                        );
      if (this.f) {
        tr3.left = 30-2;
        tr3.top = 7+2;
        tr3.angle = 45;
      }
      var lp1 = new fabric.Line([10, 20, 30, 20],
                        {
                        stroke: 'black',
                        fill: ""}
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
      var l3 = new fabric.Line([20, 20, 20, 30],
                        {
                        stroke: 'black',
                        fill: ""}
                        );
      var text = new fabric.Text(this.name, {
                        fontSize: 12,
                        left: 0+textLeft,
                        top: 30+textTop,
                        angle: angleText
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 0-4,
                        top: 10-4
                         });
      n1.name = this.name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 40-4,
                        top: 10-4
                        });
      n2.name = this.name+"#N2";
      if (this.f) {
        n1.left = 40-4;
        n1.top = 10-4;
        n2.left = 0-4;
        n2.top = 10-4;
      }
      var n3 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 20-4,
                        top: 30-4
                        });
      n3.name = this.name+"#N3";
      var t1 = new fabric.Text("1 (E)", {
                        fontSize: 9,
                        left: 0-4+textLeft,
                        top: 10-4-8+textTop,
                        angle: angleText
                        });
      var t2 = new fabric.Text("2 (C)", {
                        fontSize: 9,
                        left: 40-4+textLeft,
                        top: 10-4-8+textTop,
                        angle: angleText
                        });
      if (this.f) {
        t1.left = 40-4+textLeft;
        t1.top = 10-4-8+textTop;
        t2.left = 0-4+textLeft;
        t2.top = 10-4-8+textTop;
      }
      var t3 = new fabric.Text("3 (B)", {
                        fontSize: 9,
                        left: 20-4+8+textLeft,
                        top: 30-4+textTop,
                        angle: angleText
                        });
      var source = new fabric.Group([lp1, tr1, tr2, tr3, l1, l2, l3, n1, n2, n3, t1, t2, t3, text], {
        left: this.left,
        top: this.top,
        scaleX: this.scale,
        scaleY: this.scale,
        subTargetCheck: true,
        angle: angle,
      });
      source.father = this;
      this.drawn = source;
    }
  }

  class Diode extends Element {
    constructor(name, left, top, r, scale = 2) {
      super(name, left, top, scale);
      this.r = r;
      this.param = {'Is': 3.7751345e-14, 'Vt': 25e-3};
      this.nodes = ['N1', 'N2'];
    }
    makeSVG() {
      var angle = (this.r%4)*90;
      var angleText = -(this.r%4)*90;
      var textTop = 0;
      var textLeft = 0;
      if (this.r % 4 == 1) textTop = 15;
      if (this.r % 4 == 2) textTop = -10;
      if (this.r % 4 == 3) textLeft = 10;
      var tr1 = new fabric.Triangle({
                        stroke: 'black',
                        fill: '',
                        top: 0,
                        left: 30,
                        width: 20,
                        height: 20,
                        angle: 90,
                        });
      var p1 = new fabric.Line([30, 0, 30, 20], {
                        stroke: 'black',
                        fill: ''
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
      var text = new fabric.Text(this.name, {
                        fontSize: 12,
                        left: 10+textLeft,
                        top: 20+textTop,
                        angle: angleText
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 0-4,
                        top: 10-4
                         });
      n1.name = this.name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 40-4,
                        top: 10-4
                        });
      n2.name = this.name+"#N2";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4+textLeft,
                        top: 10-4+8+textTop,
                        angle: angleText
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 40-4+textLeft,
                        top: 10-4+8+textTop,
                        angle: angleText
                        });
      var source = new fabric.Group([tr1, p1, l1, l2, n1, n2, t1, t2, text], {
        left: this.left,
        top: this.top,
        scaleX: this.scale,
        scaleY: this.scale,
        subTargetCheck: true,
        angle: angle
      });
      source.father = this;
      this.drawn = source;
    }
  }

  class DCV extends Element {
    constructor(name, left, top, r, scale = 2) {
      super(name, left, top, scale);
      this.r = r;
      this.param = {'type': 'DC', 'value_dc': 1.0, 'amplitude1_pulse': 0, 'amplitude2_pulse': 1, 'delay_pulse': 0, 'tRise_pulse': 0, 'tFall_pulse': 0, 'tOn_pulse': 0.5, 'period_pulse': 1, 'nCycles_pulse': 10, 'dc_sin': 0, 'amplitude_sin': 1, 'freq_sin': 10, 'delay_sin': 0, 'atenuation_sin': 0, 'angle_sin': 0, 'nCycles_sin': 10};
      this.nodes = ['N1', 'N2'];
    }
    makeSVG() {
      var angle = (this.r%4)*90;
      var angleText = -(this.r%4)*90;
      var textTop = 0;
      var textLeft = 0;
      if (this.r % 4 == 1) textTop = 15;
      if (this.r % 4 == 2) { textTop = 10; textLeft = 5; }
      if (this.r % 4 == 3) textLeft = 10;
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
                        top: 5,
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
      var text = new fabric.Text(this.name, {
                        fontSize: 12,
                        left: 10+textLeft,
                        top: 20+textTop,
                        angle: angleText
                        });
      var n1 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 0-4,
                        top: 10-4
                         });
      n1.name = this.name+"#N1";
      var n2 = new fabric.Circle({
                        radius: 4,
                        fill: '#000',
                        left: 40-4,
                        top: 10-4
                        });
      n2.name = this.name+"#N2";
      var t1 = new fabric.Text("1", {
                        fontSize: 9,
                        left: 0-4+textLeft,
                        top: 10-4+8+textTop,
                        angle: angleText
                        });
      var t2 = new fabric.Text("2", {
                        fontSize: 9,
                        left: 40-4+textLeft,
                        top: 10-4+8+textTop,
                        angle: angleText
                        });
      var source = new fabric.Group([c, tp, tm, l1, l2, n1, n2, t1, t2, text], {
        left: this.left,
        top: this.top,
        scaleX: this.scale,
        scaleY: this.scale,
        subTargetCheck: true,
        angle: angle
      });
      source.father = this;
      this.drawn = source;
    }
  }

  // End of class definitions
  // Utility functions

  function addNode(nodeName, x, y) {
    var n = new Node(nodeName, x, y, 2);
    n.draw();
    elementList.push(n);
    canvas.renderAll();
  }

  function addResistor() {
    window.Rcount += 1;
    var name = "R"+window.Rcount;
    var resistor = new Resistor(name, canvas.width/2, canvas.height/2, 1);
    resistor.draw();
    elementList.push(resistor);
  }

  function addDCVoltageSource() {
    window.Vcount += 1;
    var name = "V"+window.Vcount;
    var source = new DCV(name, canvas.width/2, canvas.height/2, 1);
    source.draw();
    elementList.push(source);
  }

  function addDiode() {
    window.Dcount += 1;
    var name = "D"+window.Dcount;
    var source = new Diode(name, canvas.width/2, canvas.height/2, 1);
    source.draw();
    elementList.push(source);
  }

  function addTransistor() {
    window.Qcount += 1;
    var name = "Q"+window.Qcount;
    var source = new Transistor(name, canvas.width/2, canvas.height/2, 1);
    source.f = true;
    source.draw();
    elementList.push(source);
  }

  function addCapacitor() {
    window.Ccount += 1;
    var name = "C"+window.Ccount;
    var source = new Capacitor(name, canvas.width/2, canvas.height/2, 1);
    source.draw();
    elementList.push(source);
  }

  function addInductor() {
    window.Lcount += 1;
    var name = "L"+window.Lcount;
    var source = new Inductor(name, canvas.width/2, canvas.height/2, 1);
    source.draw();
    elementList.push(source);
  }

  function addGnd() {
    window.GNDcount += 1;
    var name = "GND"+window.GNDcount;
    var source = new Ground(name, canvas.width/2, canvas.height/2, 1);
    source.draw();
    elementList.push(source);
  }

  // functions that handle SVG objects directly due to user interactions

  function rotateElement() {
    o = canvas.getActiveObject();
    if (o == null) return;
    father = o.father;
    father.rotate();
    for (var k in connectionList) {
      connectionList[k].draw();
    }
    canvas.renderAll();
  }

  function flipElement() {
    o = canvas.getActiveObject();
    if (o == null) return;
    father = o.father;
    father.flip();
    for (var k in connectionList) {
      connectionList[k].draw();
    }
    canvas.renderAll();
  }

  // run simulation
  function run() {
    // make net list
    $('#results_content').html('');
    var loading = document.createElement("div");
    loading.setAttribute("class", "loading_element");
    $('#results_content')[0].appendChild(loading);

    var resObj = document.createElement("center");
    resObj.setAttribute("id", "content");

    var img_div = document.createElement("div");
    img_div.setAttribute("class", "row");
    var img_div1 = document.createElement("div");
    img_div1.setAttribute("class", "col-ms-12 col-md-12");
    img_div1.setAttribute("id", "result_img");
    img_div.appendChild(img_div1)
    resObj.appendChild(img_div);
    resObj.appendChild(document.createElement("br"));

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
    resObj.appendChild(text_div);

    // build JSON
    var mainJson = {'elements' : {}, 'connections': {}, 'simulation': {}};
    mainJson['connections'] = {};
    mainJson['elements'] = {};
    mainJson['simulation'] = simulation;
    for (var e in elementList) {
      mainJson['elements'][elementList[e].name] = {};
      for (var p in elementList[e].param) {
        mainJson['elements'][elementList[e].name][p] = elementList[e].param[p];
      }
      mainJson['elements'][elementList[e].name]['nodes'] = elementList[e].nodes;
    }
    for (var c in connectionList) {
      mainJson['connections'][connectionList[c].name] = {};
      from = findElement(connectionList[c].nodeList[0]);
      fromName = from[0].name;
      if (from[2]) {
        fromName = fromName + "#" + from[1];
      }
      to = findElement(connectionList[c].nodeList[connectionList[c].nodeList.length-1]);
      toName = to[0].name;
      if (to[2]) {
        toName = toName + "#" + to[1];
      }
      mainJson['connections'][connectionList[c].name]['from'] = fromName;
      mainJson['connections'][connectionList[c].name]['to'] = toName;
    }
    console.log(JSON.stringify(mainJson));

    // run! (AJAX)
    $.ajaxSetup({
      beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
      }
    });
    $(document).ajaxStart(function() { $('#results_content').addClass("loading"); } );
    $(document).ajaxStop(function() { $('#results_content').removeClass("loading"); } );
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: base_url+'run',
        data: { data: JSON.stringify(mainJson)},
        success: function (rawImageData) {
          $("#result_img").html(rawImageData.img);
          $("#text1").html(rawImageData.node_description);
          $("#text2")[0].appendChild(document.createTextNode(rawImageData.extra_text));
        },
        error: function(jqxhr, status, exception) {
             alert('Exception:', exception);
        }
      });
    // show results
    $('#results_content')[0].appendChild(resObj);
  }

  // edit object parameters
  function edit() {
    element_svg = canvas.getActiveObject();
    if (!element_svg || !("father" in element_svg)) {
      window.alert("Please select an element to edit.");
      return;
    }
    element = element_svg.father;
    if (element.name.includes("GND")) {
      window.alert("Nothing to edit in the ground element.");
      return;
    }
    if (element.name.includes("Conn")) return;
    e = element.param;

    var c = document.createElement("div");
    c.setAttribute("id", "content");
    $('#edit_content')[0].appendChild(c);
    if (element.name.includes("R")) {
      var toAdd = '<input type="hidden" name="objName" id="objName" value="'+element.name+'"><div class="form-group row"><label for="objName" class="col-2 col-form-label">Value (Ohms)</label><div class="col-10"><input class="form-control" type="number" value="'+e.value+'" id="value"></div></div>'
      $('#edit_content').html(toAdd);
    } else if (element.name.includes("V")) {
      var toAdd = '<input type="hidden" name="objName" id="objName" value="'+element.name+'">'
      toAdd += '<div class="form-group row"><label for="objName" class="col-2 col-form-label">Type</label><div class="col-2"><input class="form-control" type="radio" value="DC" id="type_dc" name="type">DC</div><div class="col-2"><input class="form-control" type="radio" value="PULSE" id="type_pulse" name="type">Pulse</div><div class="col-2"><input class="form-control" type="radio" value="SIN" id="type_sin" name="type">Sin</div></div>'
      toAdd += '<div class="form-group row v_opt_dc"><label for="objName" class="col-2 col-form-label">Value (V)</label><div class="col-10"><input class="form-control" type="number" value="'+e.value_dc+'" id="value_dc"></div></div>'
      toAdd += '<div class="form-group row v_opt_pulse"><label for="objName" class="col-2 col-form-label">Amplitude 1 (V)</label><div class="col-2"><input class="form-control" type="number" value="'+e.amplitude1_pulse+'" id="amplitude1_pulse"></div><label for="objName" class="col-2 col-form-label">Amplitude 2 (V)</label><div class="col-2"><input class="form-control" type="number" value="'+e.amplitude2_pulse+'" id="amplitude2_pulse"></div><label for="objName" class="col-2 col-form-label">Delay (s)</label><div class="col-2"><input class="form-control" type="number" value="'+e.delay_pulse+'" id="delay_pulse"></div></div>'
      toAdd += '<div class="form-group row v_opt_pulse"><label for="objName" class="col-2 col-form-label">Rise time (s)</label><div class="col-2"><input class="form-control" type="number" value="'+e.tRise_pulse+'" id="tRise_pulse"></div><label for="objName" class="col-2 col-form-label">Fall time (s)</label><div class="col-2"><input class="form-control" type="number" value="'+e.tFall_pulse+'" id="tFall_pulse"></div><label for="objName" class="col-2 col-form-label">Time on (s)</label><div class="col-2"><input class="form-control" type="number" value="'+e.tOn_pulse+'" id="tOn_pulse"></div></div>'
      toAdd += '<div class="form-group row v_opt_pulse"><label for="objName" class="col-2 col-form-label">Period (s)</label><div class="col-2"><input class="form-control" type="number" value="'+e.period_pulse+'" id="period_pulse"></div><label for="objName" class="col-2 col-form-label">Cycles</label><div class="col-2"><input class="form-control" type="number" value="'+e.nCycles_pulse+'" id="nCycles_pulse"></div></div>'
      toAdd += '<div class="form-group row v_opt_sin"><label for="objName" class="col-2 col-form-label">Amplitude (V)</label><div class="col-2"><input class="form-control" type="number" value="'+e.amplitude_sin+'" id="amplitude_sin"></div><label for="objName" class="col-2 col-form-label">DC (V)</label><div class="col-2"><input class="form-control" type="number" value="'+e.dc_sin+'" id="dc_sin"></div><label for="objName" class="col-2 col-form-label">Frequency (Hz)</label><div class="col-2"><input class="form-control" type="number" value="'+e.freq_sin+'" id="freq_sin"></div></div>'
      toAdd += '<div class="form-group row v_opt_sin"><label for="objName" class="col-2 col-form-label">Delay (s)</label><div class="col-2"><input class="form-control" type="number" value="'+e.delay_sin+'" id="delay_sin"></div><label for="objName" class="col-2 col-form-label">Atenuation</label><div class="col-2"><input class="form-control" type="number" value="'+e.atenuation_sin+'" id="atenuation_sin"></div><label for="objName" class="col-2 col-form-label">Angle</label><div class="col-2"><input class="form-control" type="number" value="'+e.angle_sin+'" id="angle_sin"></div></div>'
      toAdd += '<div class="form-group row v_opt_sin"><label for="objName" class="col-2 col-form-label">Cycles</label><div class="col-2"><input class="form-control" type="number" value="'+e.nCycles_sin+'" id="nCycles_sin"></div></div>'
      $('#edit_content').html(toAdd);
      $("#edit_content [name='type']").bootstrapSwitch();
      if (e.type == "DC") {
        $('#edit_content #type_dc').bootstrapSwitch('toggleState');
        $("#edit_content #type_dc").prop("checked", true);
        $("#edit_content #type_pulse").prop("checked", false);
        $("#edit_content #type_sin").prop("checked", false);
        $("#edit_content .v_opt_dc").show();
        $("#edit_content .v_opt_pulse").hide();
        $("#edit_content .v_opt_sin").hide();
      } else if (e.type == "SIN") {
        $('#edit_content #type_sin').bootstrapSwitch('toggleState');
        $("#edit_content #type_dc").prop("checked", false);
        $("#edit_content #type_pulse").prop("checked", false);
        $("#edit_content #type_sin").prop("checked", true);
        $("#edit_content .v_opt_dc").hide();
        $("#edit_content .v_opt_pulse").hide();
        $("#edit_content .v_opt_sin").show();
      } else if (e.type == "PULSE") {
        $('#edit_content #type_pulse').bootstrapSwitch('toggleState');
        $("#edit_content #type_dc").prop("checked", false);
        $("#edit_content #type_pulse").prop("checked", true);
        $("#edit_content #type_sin").prop("checked", false);
        $("#edit_content .v_opt_dc").hide();
        $("#edit_content .v_opt_pulse").show();
        $("#edit_content .v_opt_sin").hide();
      }
      $("#edit_content #type_dc").on('switchChange.bootstrapSwitch', function() {
        if ($(this).is(':checked')) {
          $("#edit_content .v_opt_dc").show();
          $("#edit_content .v_opt_pulse").hide();
          $("#edit_content .v_opt_sin").hide();
        }
      });
      $("#edit_content #type_pulse").on('switchChange.bootstrapSwitch', function() {
        if ($(this).is(':checked')) {
          $("#edit_content .v_opt_pulse").show();
          $("#edit_content .v_opt_dc").hide();
          $("#edit_content .v_opt_sin").hide();
        }
      });
      $("#edit_content #type_sin").on('switchChange.bootstrapSwitch', function() {
        if ($(this).is(':checked')) {
          $("#edit_content .v_opt_sin").show();
          $("#edit_content .v_opt_dc").hide();
          $("#edit_content .v_opt_pulse").hide();
        }
      });
    } else if (element.name.includes("C")) {
      var toAdd = '<input type="hidden" name="objName" id="objName" value="'+element.name+'"><div class="form-group row"><label for="objName" class="col-2 col-form-label">Value (F)</label><div class="col-10"><input class="form-control" type="number" value="'+e.value+'" id="value"></div></div>'
      $('#edit_content').html(toAdd);
    } else if (element.name.includes("L")) {
      var toAdd = '<input type="hidden" name="objName" id="objName" value="'+element.name+'"><div class="form-group row"><label for="objName" class="col-2 col-form-label">Value (H)</label><div class="col-10"><input class="form-control" type="number" value="'+e.value+'" id="value"></div></div>'
      $('#edit_content').html(toAdd);
    } else if (element.name.includes("D")) {
      var toAdd = '<input type="hidden" name="objName" id="objName" value="'+element.name+'"><div class="form-group row"><label for="objName" class="col-2 col-form-label">Is</label><div class="col-4"><input class="form-control" type="number" value="'+e.Is+'" id="Is"></div><label for="objName" class="col-2 col-form-label">Vt</label><div class="col-4"><input class="form-control" type="number" value="'+e.Vt+'" id="Vt"></div></div>'
      $('#edit_content').html(toAdd);
    } else if (element.name.includes("Q")) {
      var toAdd = '<input type="hidden" name="objName" id="objName" value="'+element.name+'">';
      var selNPN = "selected";
      var selPNP = "";
      if (e.type == "pnp") {
        selPNP = "selected";
        selNPN = "";
      }
      toAdd += '<div class="form-group row"><label for="objName" class="col-2 col-form-label">Type</label><div class="col-8"><select class="custom-select" id="type"><option value="npn" '+selNPN+'>NPN</option><option value="pnp" '+selPNP+'>PNP</option></select></div></div>'
      toAdd += '<div class="form-group row"><label for="objName" class="col-2 col-form-label">alpha</label><div class="col-4"><input class="form-control" type="number" value="'+e.alpha+'" id="alpha"></div><label for="objName" class="col-2 col-form-label">alpha reverse</label><div class="col-4"><input class="form-control" type="number" value="'+e.alphaRev+'" id="alphaRev"></div></div>'
      toAdd += '<div class="form-group row"><label for="objName" class="col-2 col-form-label">IsBE</label><div class="col-4"><input class="form-control" type="number" value="'+e.IsBE+'" id="IsBE"></div><label for="objName" class="col-2 col-form-label">VtBE</label><div class="col-4"><input class="form-control" type="number" value="'+e.VtBE+'" id="VtBE"></div></div>'
      toAdd += '<div class="form-group row"><label for="objName" class="col-2 col-form-label">IsBC</label><div class="col-4"><input class="form-control" type="number" value="'+e.IsBC+'" id="IsBC"></div><label for="objName" class="col-2 col-form-label">VtBC</label><div class="col-4"><input class="form-control" type="number" value="'+e.VtBC+'" id="VtBC"></div></div>'
      $('#edit_content').html(toAdd);
    }
    $('#edit_window').modal('show');
  }
  function endEdit() {
    var objName = $('#edit_content #objName')[0].value;
    for (var k in elementList) {
      if (elementList[k].name == objName) {
        element = elementList[k];
        break;
      }
    }
    if (objName.includes("V")) {
      var props = ['value_dc', 'amplitude1_pulse', 'amplitude2_pulse', 'delay_pulse', 'tRise_pulse', 'tFall_pulse', 'tOn_pulse', 'period_pulse', 'nCycles_pulse', 'dc_sin', 'amplitude_sin', 'freq_sin', 'delay_sin', 'atenuation_sin', 'angle_sin', 'nCycles_sin'];
      for (var i = 0; i < props.length; ++i) {
        var k = props[i];
        element.param[k] = $('#edit_content #'+k)[0].value;
      }
      element.param['type'] = 'DC';
      if ($('#edit_content #type_pulse').prop('checked')) element.param['type'] = 'PULSE';
      if ($('#edit_content #type_sin').prop('checked')) element.param['type'] = 'SIN';
    } else if (objName.includes("D")) {
      var props = ['Is', 'Vt'];
      for (var i = 0; i < props.length; ++i) {
        var k = props[i];
        element.param[k] = $('#edit_content #'+k)[0].value;
      }
    } else if (objName.includes("Q")) {
      var props = ['IsBE', 'VtBE', 'IsBC', 'VtBC'];
      for (var i = 0; i < props.length; ++i) {
        var k = props[i];
        element.param[k] = $('#edit_content #'+k)[0].value;
      }
    } else {
      element.param['value'] = $('#edit_content #'+'value')[0].value;
    }
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
    simulation['tFinal'] = tFinal;
    simulation['dt'] = dt;
    simulation['method'] = method;
    simulation['internalStep'] = internalStep;
    if (fft == "true")
      simulation['fft'] = true;
    else
      simulation['fft'] = false;
    simulation['nodes'] = $("#simulopt_content #nodes").val();
    $('#simulopt_window').modal('hide');
    run();
    $('#results_window').modal('show');
  }

  function addConnection(e, state) {
    if (state) {
      window.addConnectionMode = true;
      canvas.selection = false;
      for (var k in elementList) {
        elementList[k].lock = false;
      }
    } else {
      window.addConnectionMode = false;
      canvas.selection = true;
      for (var k in elementList) {
        elementList[k].lock = false;
      }
    }
  }

  function deleteObj() {
    if (canvas.getActiveObject() == null) return;
    element = canvas.getActiveObject().father;
    if (element.name.includes("Conn")) {
      deleteConnection(element);
    } else if (element.name.includes("R") || element.name.includes("V") || element.name.includes("C") || element.name.includes("E") || element.name.includes("D") || element.name.includes("Q") || element.name.includes("L")) {
      deleteElement(element);
    }
  }
  function deleteConnection(element) {
    element.remove();
    element = null;
  }

  function deleteElement(element) {
    var elementName = element.name;
    element.remove();
    element = null;
    for (var k in connectionList) {
      if ((connectionList[k].nodeList[0].includes(elementName+"#N")) || (connectionList[k].nodeList[1].includes(elementName+"#N"))) {
        c = connectionList[k];
        c.remove();
        c = null;
      }
    }
  }

  function prepareSimulOpt() {
    $("#simulopt_content #tFinal")[0].value = simulation.tFinal;
    $("#simulopt_content #dt")[0].value = simulation.dt;
    $("#simulopt_content #internalStep")[0].value = simulation.internalStep;
    $("#simulopt_content #method")[0].value = simulation.method;
    if (simulation.fft) {
      $("#simulopt_content #fft").val("true");
    } else {
      $("#simulopt_content #fft").val("false");
    }
    $("#simulopt_content #nodes").html("");
    for (var k in elementList) {
      if (elementList[k].name.includes("Conn")) continue;
      if (elementList[k].name.includes("E")) continue;
      if (elementList[k].name.includes("GND")) continue;
      var number_nodes = 2;
      if (elementList[k].name.includes("Q")) number_nodes = 3;
      for (var n = 1; n <= number_nodes; ++n) {
        var nname = elementList[k].name + "#N" + n;
        var sel = false;
        for (var j = 0; j < simulation.nodes.length; ++j) {
          if (simulation.nodes[j] == nname) {
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


  var canvasWrapper = $('#canvasWrapper');
  var canvas = this.__canvas = new fabric.Canvas('c');

  var DCVBtnCanvas = new fabric.Canvas("DCVBtnCanvas");
  var ResistorBtnCanvas = new fabric.Canvas("ResistorBtnCanvas");
  var CapacitorBtnCanvas = new fabric.Canvas("CapacitorBtnCanvas");
  var InductorBtnCanvas = new fabric.Canvas("InductorBtnCanvas");
  var GndBtnCanvas = new fabric.Canvas("GndBtnCanvas");
  var DiodeBtnCanvas = new fabric.Canvas("DiodeBtnCanvas");
  var TransistorBtnCanvas = new fabric.Canvas("TransistorBtnCanvas");

  var btnList = [];

  btnList.push(new DCV("V", 0, 5, 0, 1));
  btnList[0].makeSVG();
  var btn = btnList[0].drawn;
  btn.selectable = false;
  DCVBtnCanvas.add(btn);

  btnList.push(new Resistor("R", 0, 5, 0, 1));
  btnList[1].makeSVG();
  var btn = btnList[1].drawn;
  btn.selectable = false;
  ResistorBtnCanvas.add(btn);

  btnList.push(new Capacitor("C", 0, 5, 0, 1));
  btnList[2].makeSVG();
  var btn = btnList[2].drawn;
  btn.selectable = false;
  CapacitorBtnCanvas.add(btn);

  btnList.push(new Inductor("L", 0, 5, 0, 1));
  btnList[3].makeSVG();
  var btn = btnList[3].drawn;
  btn.selectable = false;
  InductorBtnCanvas.add(btn);

  btnList.push(new Ground("Gnd", 0, 5, 0, 1));
  btnList[4].makeSVG();
  var btn = btnList[4].drawn;
  btn.selectable = false;
  GndBtnCanvas.add(btn);

  btnList.push(new Diode("D", 0, 5, 0, 1));
  btnList[5].makeSVG();
  var btn = btnList[5].drawn;
  btn.selectable = false;
  DiodeBtnCanvas.add(btn);

  btnList.push(new Transistor("Q", 0, 5, 0, 1));
  btnList[6].makeSVG();
  var btn = btnList[6].drawn;
  btn.selectable = false;
  TransistorBtnCanvas.add(btn);

  fabric.Object.prototype.transparentCorners = false;
  $("#toggleTools")[0].onclick = function() {
    $('#toolbar').toggle();
  };
  function newCircuit() {
    clearAll();
  }
  $("#newCircuit")[0].onclick = newCircuit;
  $("#addDCVoltageSourceBtn")[0].onclick = addDCVoltageSource;
  $("#addDCVoltageSourceLink")[0].onclick = addDCVoltageSource;
  $("#addResistorBtn")[0].onclick = addResistor;
  $("#addResistorLink")[0].onclick = addResistor;
  $("#addCapacitorBtn")[0].onclick = addCapacitor;
  $("#addCapacitorLink")[0].onclick = addCapacitor;
  $("#addInductorBtn")[0].onclick = addInductor;
  $("#addInductorLink")[0].onclick = addInductor;
  $("#addGndBtn")[0].onclick = addGnd;
  $("#addGndLink")[0].onclick = addGnd;
  $("#addDiodeBtn")[0].onclick = addDiode;
  $("#addDiodeLink")[0].onclick = addDiode;
  $("#addTransistorBtn")[0].onclick = addTransistor;
  $("#addTransistorLink")[0].onclick = addTransistor;
  $("#addConnectionBtn").on('switchChange.bootstrapSwitch', addConnection);
  function addConnectionLink() {
    $('#addConnectionBtn').bootstrapSwitch('toggleState');
  }
  $("#addConnectionLink")[0].onclick = addConnectionLink;
  $("#deleteLink")[0].onclick = deleteObj;
  $("#rotateLink")[0].onclick = rotateElement;
  $("#flipLink")[0].onclick = flipElement;
  $("#editLink")[0].onclick = edit;
  $("#simulOptLink")[0].onclick = prepareSimulOpt;
  $("#example_rc")[0].onclick = loadExampleRC;
  $("#example_rc_pulse")[0].onclick = loadExampleRCPulse;
  $("#example_amp")[0].onclick = loadExampleAmp;
  $("#example_rectifier")[0].onclick = loadExampleRectifier;
  $("#example_bridge_rectifier")[0].onclick = loadExampleBridgeRectifier;

  $("#panUpLeft")[0].onclick = panUpLeft;
  $("#panUpRight")[0].onclick = panUpRight;
  $("#panDownLeft")[0].onclick = panDownLeft;
  $("#panDownRight")[0].onclick = panDownRight;
  $("#panUp")[0].onclick = panUp;
  $("#panDown")[0].onclick = panDown;
  $("#panLeft")[0].onclick = panLeft;
  $("#panRight")[0].onclick = panRight;
  $("#panReset")[0].onclick = panReset;

  $("#panUpLink")[0].onclick = panUp;
  $("#panDownLink")[0].onclick = panDown;
  $("#panLeftLink")[0].onclick = panLeft;
  $("#panRightLink")[0].onclick = panRight;
  $("#panResetLink")[0].onclick = panReset;
  
  function save() {
    saveItElement = {}
    saveItConnection = {}
    for (var k in elementList) {
      saveItElement[k] = elementList[k].drawn;
      elementList[k].drawn = null;
    }
    for (var k in connectionList) {
      saveItConnection[k] = connectionList[k].drawn;
      connectionList[k].drawn = null;
    }
    var str_json = JSON.stringify({'elementList': elementList, 'simulation' : simulation , 'connectionList': connectionList});
    for (var k in elementList) {
      elementList[k].drawn = saveItElement[k];
    }
    for (var k in connectionList) {
      connectionList[k].drawn = saveItConnection[k];
    }
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
      clearAll();
      elementList = [];
      connectionList = [];

      var result = JSON.parse(e.target.result);
      elementListF = result.elementList;
      connectionListF = result.connectionList;
      simulation = result.simulation;
      for (var k in elementListF) {
        var number = 1;
        if (elementListF[k].name.includes("GND")){
          var o = new Ground(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(3));
          if (number > window.GNDcount) {
            window.GNDcount = number + 1;
          }
        } else if (elementListF[k].name.includes("R")){
          var o = new Resistor(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Rcount) {
            window.Rcount = number + 1;
          }
        } else if (elementListF[k].name.includes("C")){
          var o = new Capacitor(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Ccount) {
            window.Ccount = number + 1;
          }
        } else if (elementListF[k].name.includes("L")){
          var o = new Inductor(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Lcount) {
            window.Lcount = number + 1;
          }
        } else if (elementListF[k].name.includes("Q")){
          var o = new Transistor(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Qcount) {
            window.Qcount = number + 1;
          }
        } else if (elementListF[k].name.includes("D")){
          var o = new Diode(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Dcount) {
            window.Dcount = number + 1;
          }
        } else if (elementListF[k].name.includes("V")){
          var o = new DCV(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Vcount) {
            window.Vcount = number + 1;
          }
        } else if (elementListF[k].name.includes("E")){
          var o = new Node(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.extraCount) {
            window.extraCount = number + 1;
          }
        }
        o.left = elementListF[k].left;
        o.top = elementListF[k].top;
        o.scale = elementListF[k].scale;
        o.r = elementListF[k].r;
        o.f = elementListF[k].f;
        o.scale = elementListF[k].scale;
        o.nodes = elementListF[k].nodes;
        o.param = elementListF[k].param;
        o.draw();
        elementList.push(o);
        elementList[elementList.length-1].draw();
      }
      for (var k in connectionListF) {
        var o = new Connection(connectionListF[k].name);
        o.nodeList = connectionListF[k].nodeList;
        o.draw();
        connectionList.push(o);
        connectionList[connectionList.length-1].draw();
        connectionList[k].draw();
        var number = Number(connectionListF[k].name.substr(4));
        if (number > window.connectionCount) {
          window.connectionCount = number + 1;
        }
      }
      prepareSimulOpt();
    }

    fr.readAsText(files.item(0));
  }
  $('#open_file_load')[0].onclick = openFile;

  function loadExample(fname) {
    $.getJSON(static_path+"/"+fname+".json", function( data ) {
      clearAll();
      elementList = [];
      connectionList = [];

      var result = data;
      elementListF = result.elementList;
      connectionListF = result.connectionList;
      simulation = result.simulation;
      for (var k in elementListF) {
        var number = 1;
        if (elementListF[k].name.includes("GND")){
          var o = new Ground(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(3));
          if (number > window.GNDcount) {
            window.GNDcount = number + 1;
          }
        } else if (elementListF[k].name.includes("R")){
          var o = new Resistor(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Rcount) {
            window.Rcount = number + 1;
          }
        } else if (elementListF[k].name.includes("C")){
          var o = new Capacitor(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Ccount) {
            window.Ccount = number + 1;
          }
        } else if (elementListF[k].name.includes("L")){
          var o = new Inductor(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Lcount) {
            window.Lcount = number + 1;
          }
        } else if (elementListF[k].name.includes("Q")){
          var o = new Transistor(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Qcount) {
            window.Qcount = number + 1;
          }
        } else if (elementListF[k].name.includes("D")){
          var o = new Diode(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Dcount) {
            window.Dcount = number + 1;
          }
        } else if (elementListF[k].name.includes("V")){
          var o = new DCV(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.Vcount) {
            window.Vcount = number + 1;
          }
        } else if (elementListF[k].name.includes("E")){
          var o = new Node(elementListF[k].name, 0, 0, 0);
          number = Number(elementListF[k].name.substr(1));
          if (number > window.extraCount) {
            window.extraCount = number + 1;
          }
        }
        o.left = elementListF[k].left;
        o.top = elementListF[k].top;
        o.scale = elementListF[k].scale;
        o.r = elementListF[k].r;
        o.f = elementListF[k].f;
        o.scale = elementListF[k].scale;
        o.nodes = elementListF[k].nodes;
        o.param = elementListF[k].param;
        o.draw();
        elementList.push(o);
        elementList[elementList.length-1].draw();
      }
      for (var k in connectionListF) {
        var o = new Connection(connectionListF[k].name);
        o.nodeList = connectionListF[k].nodeList;
        o.draw();
        connectionList.push(o);
        connectionList[connectionList.length-1].draw();
        connectionList[k].draw();
        var number = Number(connectionListF[k].name.substr(4));
        if (number > window.connectionCount) {
          window.connectionCount = number + 1;
        }
      }
      prepareSimulOpt();
    });
  }
  function loadExampleRC() {
    loadExample('rc');
  }
  function loadExampleRCPulse() {
    loadExample('rc_pulse');
  }
  function loadExampleAmp() {
    loadExample('amp');
  }
  function loadExampleRectifier() {
    loadExample('rectifier');
  }
  function loadExampleBridgeRectifier() {
    loadExample('bridge_rectifier');
  }

  $(document).keyup(function(e) {
    if (($("#edit_window").data('bs.modal') || {})._isShown) return;
    if (($("#simulopt_window").data('bs.modal') || {})._isShown) return;
    if (($("#results_window").data('bs.modal') || {})._isShown) return;
    if (($("#save_window").data('bs.modal') || {})._isShown) return;
    if (($("#open_window").data('bs.modal') || {})._isShown) return;
    if (e.keyCode == 27) { // escape key maps to keycode `27`
      if (window.addConnectionMode) {
        dropConnection();
        window.isDown = false;
      }
      window.addConnectionMode = false;
      canvas.forEachObject(function(o) {
        o.father.lock = false;
      });
      $('#addConnectionBtn').bootstrapSwitch('state', false, false);
    } else if (e.keyCode == 46) { // delete
      deleteObj();
    } else if (e.keyCode == 114 || e.keyCode == 82) { // r -> rotate
      rotateElement();
    } else if (e.keyCode == 102 || e.keyCode == 70) { // f -> flip
      flipElement();
    } else if (e.keyCode == 101 || e.keyCode == 69) { // e -> edit
      edit();
    }
  });

  canvas.on('object:moving', function(o) {
    o = o.target;
    o.father.left = o.left;
    o.father.top = o.top;
  });

  canvas.on('object:modified', function(o) {
    for (var node in o.target.father.nodes) {
      adjustNodesConnectedTo(o.target.father.name+"#"+o.target.father.nodes[node]);
    }
    canvas.renderAll();
  });

  function findLine(name) {
    for (var i = 0; i < canvas.getObjects().length; ++i) {
      var l = canvas.getObjects()[i];
      if (l.father.name == name) {
        return l.father;
      }
    }
    return false;
  }

  function cancelMenu() {
    $(window).off('contextmenu', cancelMenu);
    return false;
  }
  function panUpLeft() {
    canvas.relativePan({ x: -50, y: -50 });
  }
  function panUpRight() {
    canvas.relativePan({ x: 50, y: -50 });
  }
  function panDownLeft() {
    canvas.relativePan({ x: -50, y: 50 });
  }
  function panDownRight() {
    canvas.relativePan({ x: 50, y: 50 });
  }
  function panUp() {
    canvas.relativePan({ x: 0, y: -50 });
  }
  function panDown() {
    canvas.relativePan({ x: 0, y: 50 });
  }
  function panLeft() {
    canvas.relativePan({ x: -50, y: 0 });
  }
  function panRight() {
    canvas.relativePan({ x: 50, y: 0 });
  }
  function panReset() {
    canvas.absolutePan({ x: 0, y: 0 });
  }
  function startPan(e) {
    if (e.button == 2) { // if we are not in add wire mode
      if (window.addConnectionMode) { // if we are in add wire mode
        dropConnection();
        window.isDown = false;
        window.addConnectionMode = false;
        canvas.forEachObject(function(o) {
          o.father.lock = false;
        });
        $('#addConnectionBtn').bootstrapSwitch('state', false, false);
      }
      var x0 = e.screenX,
          y0 = e.screenY;
      function continuePan(event) {
        var x = event.screenX,
            y = event.screenY;
        canvas.relativePan({ x: x - x0, y: y - y0 });
        x0 = x;
        y0 = y;
      }
      function stopPan(event) {
        $(window).off('mousemove', continuePan);
        $(window).off('mouseup', stopPan);
      };
      $(window).mousemove(continuePan);
      $(window).mouseup(stopPan);
      $(window).contextmenu(cancelMenu);
    }
  }
  canvasWrapper.mousedown(startPan);

  canvas.on('mouse:down', function(o){
    if (window.addConnectionMode) { // if we are in add wire mode
      var pointer = canvas.getPointer(o.e); // mouse pointer
      if (!window.isDown) { // did not start drawing a wire yet
        // check if we clicked in an element
        if ("target" in o && o.target && "name" in o.target.father && o.target.father.name.includes("E")) {
          startConnectionInNode(o.target.father.name, o.target.left, o.target.top);
        } else if (o.subTargets && o.subTargets.length > 0 && "name" in o.subTargets[0] && o.subTargets[0].name.includes("#N")) {
          startConnectionInNode(o.subTargets[0].name, o.target.left, o.target.top);
        } else if ('target' in o && o.target && 'name' in o.target.father && o.target.father.name.includes("Conn")) {
          var pointer = canvas.getPointer(o.e);
          bifurcateAndStartConnection(o.target.father, pointer.x, pointer.y);
        } else { // nothing selected yet and we did not select an element
          // just stop
          $('#addConnectionBtn').bootstrapSwitch('state', false, false);
        }
        window.isDown = true;
      } else { // already selected first node
        // if it is a node, end selection
        if ('target' in o && o.target && 'name' in o.target.father && o.target.father.name.includes("E")) {
          endConnectionInNode(o.target.father.name+"#N1");
          window.isDown = false;
        } else if ("subTargets" in o && o.subTargets.length == 1 && "name" in o.subTargets[0] && o.subTargets[0].name.includes("#N")) {
          endConnectionInNode(o.subTargets[0].name);
          window.isDown = false;
        } else if ('target' in o && o.target && 'name' in o.target.father && o.target.father.name.includes("Conn")) {
          var pointer = canvas.getPointer(o.e);
          bifurcateAndEndConnection(o.target.father, pointer.x, pointer.y);
          window.isDown = false;
        } else if (!('target' in o && o.target && 'father' in o.target)) { // it is not a node, nor another line, so make a line and keep going
          var pointer = canvas.getPointer(o.e);
          makeStepInConnection(pointer.x, pointer.y);
          window.isDown = true;
        } else { // it is something else
          // just stop
          $('#addConnectionBtn').bootstrapSwitch('state', false, false);
          window.isDown = false;
        }
        for (var k in connectionList) {
          connectionList[k].draw();
        }
        canvas.renderAll();
      }
    }
  });
  canvas.on('mouse:move', function(o){
    if (window.addConnectionMode) {
      if (!window.isDown) return;
      if (window.currentConnection == false) {
        window.isDown = false;
        $('#addConnectionBtn').bootstrapSwitch('toggleState');
        return;
      }
      var pointer = canvas.getPointer(o.e);
      firstNode = findElement(window.currentConnection.nodeList[0]);
      var obj = firstNode[2];
      var matrix = obj.calcTransformMatrix();
      var lastX = matrix[4];
      var lastY = matrix[5];

      var dx = Math.abs(lastX - pointer.x);
      var dy = Math.abs(lastY - pointer.y);
      var ex = 0;
      var ey = 0;
      if (pointer.x > lastX) ex = -25;
      if (pointer.x <= lastX) ex =  25;
      if (pointer.y > lastY) ey = -25;
      if (pointer.y <= lastY) ey =  25;
      if (dx > dy) {
        var nx = pointer.x+ex;
        var ny = lastY-9;
      } else {
        var nx = lastX-9;
        var ny = pointer.y+ey;
      }

      moveNode("ETMP", nx, ny);
      window.currentConnection.draw();
      canvas.renderAll();
    }
  });

  window.addEventListener("resize", resizeCanvas, false);
 
  function resizeCanvas(e) {
    var myCanvas = document.getElementById("c");
    w = $("#canvasWrapper").innerWidth();
    h = $("#canvasWrapper").innerHeight();
    myCanvas.width = w;
    myCanvas.height = h;
    canvas.setWidth(w);
    canvas.setHeight(h);
    canvas.calcOffset();
  }
  resizeCanvas(null);


