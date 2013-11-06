module.exports = {

  obj1: {
    age: 1,
    numbers: [0,1,2,3],
    nothing1: null,
    nothing2: undefined
  },

  obj1_: {
    age: {
      Action: "ADD",
      Value: {N: "1"}
    },
    numbers: {
      Action: "ADD",
      Value: {NS: ["0", "1", "2", "3"]}
    }
  },

  obj2: {
    name: "new name",
    nickNames: ["nick1", "nick2"],
    age: 20,
    numbers: [0, 2, 4, 6],
    nothing1: null,
    nothing2: undefined
  },

  obj2_: {
    name: {
      Action: "PUT",
      Value: {S: "new name"}
    },
    nickNames: {
      Action: "PUT",
      Value: {SS: ["nick1", "nick2"]}
    },
    age: {
      Action: "PUT",
      Value: {N: "20"}
    },
    numbers: {
      Action: "PUT",
      Value: {NS: ["0", "2", "4", "6"]}
    }
  }

};
