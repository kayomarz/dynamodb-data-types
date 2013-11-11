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
  },

  obj3: "name, age, tel, history",
  
  obj3_: {
    "name": {
      "Action": "DELETE"
    },
    "age": {
      "Action": "DELETE"
    },
    "tel": {
      "Action": "DELETE"
    },
    "history": {
      "Action": "DELETE"
    }
  },

  obj4: {
    colors: ["red"], 
    numbers: [123]
  },

  obj4_: {
    "colors": {
      "Action": "DELETE",
      "Value": { "SS": ["red"] }
    },
    "numbers": {
      "Action": "DELETE",
      "Value": {"NS": ["123"] }
    }
  },

  obj5: undefined,

  obj5_: {
    "name": {
      "Action": "PUT",
      "Value": {"S": "some name"}
    },
    "age": {
      "Action": "ADD",
      "Value": {"N": "1"}
    },
    "weight": {
      "Action": "ADD",
      "Value": {"N": "-5"}
    },
    "credit": {
      "Action": "ADD",
      "Value": {"N": "100.5"}
    },
    "bill": {
      "Action": "ADD",
      "Value": {"N": "5"}
    },
    "hobbies": {
      "Action": "DELETE"
    },
    "profession": {
      "Action": "DELETE"
    },
    "languages": {
      "Action": "DELETE"
    },
    "work-experience": {
      "Action": "DELETE"
    },
    "salaray": {
      "Action": "DELETE"
    },
    "history": {
      "Action": "DELETE"
    }
  }

};
