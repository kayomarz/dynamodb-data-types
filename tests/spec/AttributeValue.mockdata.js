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
    key4: new Number(4.2),
    key4a: [new Number(1), new Number(2.1), new Number(4.3)],
    nothing1: null,
    nothing2: undefined,
    deep: {
      val: 1.0,
      msg: 'This is level 1',
      nxt: {
        val: 2.0,
        msg: 'This is level 2',
        nxt: {
          val: 3,
          msg: 'This is level 3'
        }
      }
    }
  },

  obj1_: { 
    key1: { S: 'str' },
    key1a: { SS: [ 'str1', 'str2', 'str3' ] },
    key2: { N: '1' },
    key2a: { NS: [ '1.1', '1.2', '1.3' ] },
    key3: { S: 'String' },
    key3a: { SS: [ 'String1', 'String2', 'String3' ] },
    key4: { N: '4.2' },
    key4a: { NS: [ '1', '2.1', '4.3' ] },
    nothing1: { NULL: true },
    deep: {
      M: {
        val: { N: '1' },
        msg: { S: 'This is level 1' },
        nxt: {
          M: {
            val: { N: '2' },
            msg: { S: 'This is level 2' },
            nxt: {
              M: {
                val: { N: '3' },
                msg: { S: 'This is level 3' }
              }
            }
          }
        }
      }
    }
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
    key1: { ABCD: 'str' }
  },

  singles: [
    1.4,
    'str single',
    [1, 2, 3.1],
    ['str1', 'str2', 'str3']
  ],

  singles_: [
    { N: '1.4' },
    { S: 'str single' },
    { NS: [ '1', '2', '3.1' ] },
    { SS: [ 'str1', 'str2', 'str3' ] }
  ]

};

