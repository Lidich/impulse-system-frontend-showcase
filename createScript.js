var data = {}

await fetch('./data1.json')
  .then((response) => response.json())
  .then((json) => data = json);

//console.log(data)

//
var statusFlagConstants = {
  idle: 0,
  addNodeStart: 1,
  addLinkStart: 2,
  addLinkFirstSelected: 21,
  editNodeStarted: 3
}

var statusText = document.getElementById("status")

var statusFlag = statusFlagConstants.idle;

var firstNodeForLink = {}
var secondNodeForLink = {}

var tempNodeForEdit = {}

function setStatusText() {
  if (statusFlag == statusFlagConstants.idle) statusText.innerHTML = "idle";
  if (statusFlag == statusFlagConstants.addNodeStart) statusText.innerHTML = "Добавление новой вершины. Нажмите на место, куда вы хотите добавить вершину";
  if (statusFlag == statusFlagConstants.addLinkStart) statusText.innerHTML = "Добавление нового ребра. Выберите любую из вершин для присоединения начала ребра";
  if (statusFlag == statusFlagConstants.addLinkFirstSelected) statusText.innerHTML = "Добавление нового ребра. Выберите любую из вершин для присоединения конца ребра";
  if (statusFlag == statusFlagConstants.editNodeStarted) statusText.innerHTML = "Изменение вершины. Выберите вершину, которую хотите отредактировать";
}

setStatusText()

// Specify the dimensions of the chart.
const width = 1920;
const height = 1080;

let mouse = null;

// Specify the color scale.
const color = d3.scaleOrdinal(d3.schemeCategory10);

// The force simulation mutates links and nodes, so create a copy
// so that re-evaluating this cell produces the same result.
var links = data.links.map(d => ({ ...d }));
var nodes = data.nodes.map(d => ({ ...d }));


// Create a simulation with several forces.
var simulation = d3.forceSimulation(nodes)
.force("link", d3.forceLink(links).id(d => d.id).distance(200))
.force("charge", d3.forceManyBody().strength(-1))
.force("center", d3.forceCenter(width / 2, height / 2))
.on("tick", ticked);

// Create the SVG container.
var svg = d3.create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto;")
  // .on("click", clicked)
  .on("click", svgClicked)

// Add a line for each link, and a circle for each node.
var link = svg.append("g")
  .attr("stroke", "#999")
  .attr("stroke-opacity", 0.6)
  .selectAll()
  .data(links)
  .join("line")
  .attr("stroke-width", d => 10*Math.sqrt(d.value));

  function updateLineView(){
    link = link
    .data(links)
    .join("line").attr("stroke-width", d => 10*Math.sqrt(d.value));
  }

var node = svg.append("g")
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5)
  .selectAll()
  .data(nodes)
  .join("circle")
  .attr("r", 50)
  .attr("fill", d => color(d.group)).on("click", nodeClicked);

  function updateNodeView(){
    node = node
    .data(nodes)
    .join(
      enter => enter.append("circle").attr("r", 0).attr("fill", d => color(d.group)).on("click", nodeClicked)
        .call(enter => enter.transition().attr("r", 50)),
      update => update,
      exit => exit.remove()
    );
  }

// Добавляем группу для текста
var linkText = svg.append("g")
  .selectAll("text")
  .data(links)
  .join("text")
  .attr("class", "link-text")
  .text(d => d.label);

  function updateLinkTextView(){
    linkText = linkText
    .data(links)
    .join("text")
    .attr("class", "link-text")
    .text(d => d.label);
  }

// Добавляем группу для текста
var circlesText = svg.append("g")
  .selectAll("text")
  .data(nodes)
  .join("text")
  .attr("class", "circle-text")
  .text(d => d.text);

function updateCirclesTextView() {
  circlesText = circlesText
  .data(nodes)
  .join("text")
  .attr("class", "circle-text")
  .text(d => d.text);
}

// Добавляем группу для текста
var circlesValueText = svg.append("g")
  .selectAll("text")
  .data(nodes)
  .join("text")
  .attr("class", "circle-text")
  .text(d => "value: "+d.value);

function updateCirclesValueTextView() {
  circlesValueText = circlesValueText
  .data(nodes)
  .join("text")
  .attr("class", "circle-text")
  .text(d => "value: "+d.value);
}

// Позиционируем текст посередине каждого ребра
linkText.attr("x", d => (d.source.x + d.target.x) / 2)
  .attr("y", d => (d.source.y + d.target.y) / 2);

/*
node.append("title")
  .text(d => d.id);*/

// Add a drag behavior.
node.call(d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended))

// Set the position attributes of links and nodes each time the simulation ticks.
function ticked() {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  linkText.attr("x", d => (d.source.x + d.target.x) / 2)
    .attr("y", d => (d.source.y + d.target.y) / 2);

  circlesText.attr("x", d => d.x - 25)
    .attr("y", d => d.y);

    circlesValueText.attr("x", d => d.x - 25)
    .attr("y", d => d.y+15);
}

// Reheat the simulation when drag starts, and fix the subject position.
function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

// When this cell is re-run, stop the previous simulation. (This doesn’t
// really matter since the target alpha is zero and the simulation will
// stop naturally, but it’s a good practice.)
//invalidation.then(() => simulation.stop());

/*
function renderGraph() {
  svg.selectAll("*").remove();

  links = data.links.map(d => ({ ...d }));
  nodes = data.nodes.map(d => ({ ...d }));

  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(200))
    .force("charge", d3.forceManyBody().strength(-1))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

  // Add a line for each link, and a circle for each node.
  link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll()
    .data(links)
    .join("line")
    .attr("stroke-width", d => Math.sqrt(d.value));

  node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(nodes)
    .join("circle")
    .attr("r", 50)
    .attr("fill", d => color(d.group)).on("click", nodeClicked);

  // Добавляем группу для текста
  linkText = svg.append("g")
    .selectAll("text")
    .data(links)
    .join("text")
    .attr("class", "link-text")
    .text(d => d.text);

  circlesText = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("class", "circle-text")
    .text(d => d.text);

  ticked()


  node.append("title")
    .text(d => d.id);

  //node.append("text").text(d => d.id);

  // Add a drag behavior.
  node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended))
}*/

/*
function clicked(event) {
  console.log("sdadasdad")
  mousemoved.call(this, event);
  console.log("sdadasdad")
  spawn({id: uuidv4(), group: 1, x: mouse.x, y: mouse.y});
}
*/

function svgClicked(event) {
  if (statusFlag == statusFlagConstants.addNodeStart) {
    mousemoved.call(this, event);
    spawn({ id: uuidv4(), group: 1, text:"New Edge",  x: mouse.x, y: mouse.y , value: 1});
    statusFlag = statusFlagConstants.idle
    setStatusText()
  }
}

function addNewLink() {
  var newLink = {
    source: firstNodeForLink.id,
    target: secondNodeForLink.id,
    value: 1,
    label: "1"
  }
  links.push(newLink);

  reRender()
}

function nodeClicked(event) {
  console.log(event.srcElement.__data__)
  if (statusFlag == statusFlagConstants.addLinkStart) {
    firstNodeForLink = event.srcElement.__data__
    statusFlag = statusFlagConstants.addLinkFirstSelected
    setStatusText()
    console.log(event.srcElement.__data__)
    return
  }
  if (statusFlag == statusFlagConstants.addLinkFirstSelected) {
    secondNodeForLink = event.srcElement.__data__
    addNewLink()
    statusFlag = statusFlagConstants.idle
    setStatusText()
    return
  }
  if (statusFlag == statusFlagConstants.editNodeStarted) {
    var tempNode = event.srcElement.__data__
    tempNodeForEdit = tempNode
    document.getElementById("editNodeNameInput").value = tempNode.text
    document.getElementById("editNodeValueInput").value = tempNode.group
    openForm()
    statusFlag = statusFlagConstants.idle
    setStatusText()
    return
  }

}

function mousemoved(event) {
  const [x, y] = d3.pointer(event);
  mouse = { x, y };
  simulation.alpha(0.3).restart();
}

function spawn(source) {
  nodes.push(source);

  reRender()
}

function reRender() {
  updateLineView()

  updateNodeView()

  updateCirclesTextView()

  updateCirclesValueTextView()

  updateLinkTextView()

  // Add a drag behavior.
  node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended))

  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(1).restart();

  svg.property("value", {
    nodes: nodes.map(d => ({ id: d.index })),
    links: links.map(d => ({ source: d.source.index, target: d.target.index }))
  });

  svg.dispatch("input");
}

/*
addNodeButton.addEventListener('click', () => {
  data.nodes.push(newEdge)
  //console.log(data)
  container.innerHTML = "fdsazfsafd"
  container.append(svg.node())
  console.log(node)
  renderGraph()
});*/

container.append(svg.node())
//renderGraph()

//ADD NEW NODE BUTTON LEGACY
addNewNodeButton.addEventListener('click', () => {
  statusFlag = statusFlagConstants.addNodeStart
  setStatusText()
});

//ADD NEW LINK BUTTON
addNewLinkButton.addEventListener('click', () => {
  statusFlag = statusFlagConstants.addLinkStart
  setStatusText()
});

//EDIT NODE BUTTON
editNodeButton.addEventListener('click', () => {
  statusFlag = statusFlagConstants.editNodeStarted
  setStatusText()
});

//EDIT NODE CLOSE BUTTON
editNodeCloseButton.addEventListener('click', () => {
  document.getElementById("myForm").style.display = "none";
});

//SUBMIT EDIT NOTE BUTTON
submitEditNodeButton.addEventListener('click', () => {
  statusFlag = statusFlagConstants.editNodeStarted
  console.log(nodes)
  nodes.forEach(element => {
    if (element.id == tempNodeForEdit.id) {
      element.text = document.getElementById("editNodeNameInput").value
      element.value = document.getElementById("editNodeValueInput").value
    }
  });
  reRender()
  setStatusText()
});

//TEST BUTTON
testButton.addEventListener('click', () => {
  //reRender()
  //console.log(uuidv4())
  reRender()
});

function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}
