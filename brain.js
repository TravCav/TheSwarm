class Brain {
  constructor() {
    this.layers = [];
    this.layers.push(new Array(21));
    //this.layers.push(new Array(18));
    //this.layers.push(new Array(17));
    //this.layers.push(new Array(16));
    //this.layers.push(new Array(15));
    //this.layers.push(new Array(14));
    //this.layers.push(new Array(13));
    //this.layers.push(new Array(12));
    //this.layers.push(new Array(11));
    //this.layers.push(new Array(10));
    //this.layers.push(new Array(9));
    //this.layers.push(new Array(40));
    //this.layers.push(new Array(40));
    this.layers.push(new Array(13));
    this.layers.push(new Array(13));
    this.layers.push(new Array(8));

    // fill layers
    for (let layerIndex = 1; layerIndex < this.layers.length; layerIndex++) {
      for (let ni = 0; ni < this.layers[layerIndex].length; ni++) {
        this.layers[layerIndex][ni] = new neuron(this.layers[layerIndex - 1].length);
      }
    }
  }

  Copy(otherBrain) {
    // loop through layers
    for (let layerIndex = 1; layerIndex < this.layers.length; layerIndex++) {
      // loop though neurons
      for (let ni = 0; ni < this.layers[layerIndex].length; ni++) {
        // loop though connections
        for (let nc = 0; nc < this.layers[layerIndex][ni].connections.length; nc++) {
          // copy that floppy
          this.layers[layerIndex][ni].connections[nc].weight = otherBrain.layers[layerIndex][ni].connections[nc].weight;
        }
      }
    }
  }

  Mutate() {
    // pick a random layer
    const layer = 1 + Math.floor(Math.random() * (this.layers.length - 1));

    // pick a random neuron
    let neuronIndex = Math.floor(Math.random() * this.layers[layer].length);

    // pick a random connection
    let connectionIndex = Math.floor(Math.random() * this.layers[layer][neuronIndex].connections.length);

    // TODO: all the neurons have references to the same connection.
    // randomly adjust it.
    this.layers[layer][neuronIndex].connections[connectionIndex].weight += Math.random() * 2 - 1;
  }

  ProcessLayers() {
    //this.GetInputs();
    for (let layerIndex = 1; layerIndex < this.layers.length; layerIndex++) {
      for (let ni = 0; ni < this.layers[layerIndex].length; ni++) {

        let inputValues = 0;
        let connectionCount = this.layers[layerIndex][ni].connections.length;
        for (let ci = 0; ci < connectionCount - 1; ci++) {
          // input times a weight
          inputValues += this.layers[layerIndex - 1][ci].value * this.layers[layerIndex][ni].connections[ci].weight;
        }

        // memory?
        //inputValues += Math.tanh((this.layers[layerIndex][ni].value * this.layers[layerIndex][ni].connections[connectionCount - 2].weight) + this.layers[layerIndex][ni].connections[connectionCount - 3].weight);

        // add a bias
        inputValues += this.layers[layerIndex][ni].connections[connectionCount - 1].weight;

        // activate
        //// this.layers[layerIndex][ni].value = 1 / (1 + Math.exp(-inputValues));  // sigmoid
        this.layers[layerIndex][ni].value = Math.tanh(inputValues);
        // this.layers[layerIndex][ni].value = Math.max(0,inputValues); // ReLU
      }
    }
  }

  Restore() {
    var oldBrain = JSON.parse(localStorage.getItem("BrainSave"));
    if (oldBrain != null) {
      // does the net have the same amount of layers?
      if (this.layers.length === oldBrain.length) {
        for (let li = 1; li < this.layers.length; li++) {

          // does the layer have the same amount of neurons?
          if (this.layers[li].length === oldBrain[li].length) {
            for (let ni = 0; ni < this.layers[li].length; ni++) {

              // does the neuron have the same amount of connections?
              if (this.layers[li][ni].connections.length === oldBrain[li][ni].connections.length) {
                // copy that floppy.
                this.layers[li][ni].connections = oldBrain[li][ni].connections;
              }
            }
          }
        }
      }
    }
  }
  Save() {
    var dotString = JSON.stringify(this.layers);
    localStorage.setItem("BrainSave", dotString);
  }
}