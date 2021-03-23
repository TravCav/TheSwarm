class neuron {
  constructor(connectionCount) {
    // one for the bias and one for cycling back in.
    connectionCount += 1;

    this.value = 0;
    this.connections = [];
    for (let index = 0; index < connectionCount; index++) {
      this.connections.push({
        weight: 0 // No brains
        //// weight: (Math.random() * 2 - 1) * 0.001 // little bit of brains
        //// weight: (Math.random() * 2 - 1) // lots of brains
      });
    }
  }
}
