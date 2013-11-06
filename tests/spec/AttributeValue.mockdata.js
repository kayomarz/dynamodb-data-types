module.exports = {

  obj1: {
    key1: 'str',
    key1a: ['str1', 'str2', 'str3'],

    key2: 1,
    key2a: [1.1, 1.2, 1.3],

    key3: new String('String'),
    key3a: [new String('String1'), 
            new String('String2'),
            new String('String3')],

    nothing1: null,
    nothing2: undefined
  },

  obj1_: { 
    key1: { S: 'str' },
    key1a: { SS: [ 'str1', 'str2', 'str3' ] },
    key2: { N: '1' },
    key2a: { NS: [ '1.1', '1.2', '1.3' ] },
    key3: { S: 'String' },
    key3a: { SS: [ 'String1', 'String2', 'String3' ] } 
  },

  obj2: { 
    key1: 'str',
    key1a: [ 'str1', 'str2', 'str3' ],

    key2: 1,
    key2a: [ 1.1, 1.2, 1.3 ]
  },

  obj2_: { 
    key1: { S: 'str' },
    key1a: { SS: [ 'str1', 'str2', 'str3' ] },

    key2: { N: '1' },
    key2a: { NS: [ '1.1', '1.2', '1.3' ] },

    nothing1: null,
    nothing2: undefined
  },

  objInvalid_: { 
    key1: { SSSS: 'str' }
  },

  singles: [
    1.4,
    "str single",
    [1, 2, 3.1],
    ["str1", "str2", "str3"]
  ],

  singles_: [
    { N: '1.4' },
    { S: 'str single' },
    { NS: [ '1', '2', '3.1' ] },
    { SS: [ 'str1', 'str2', 'str3' ] }
  ]

};

