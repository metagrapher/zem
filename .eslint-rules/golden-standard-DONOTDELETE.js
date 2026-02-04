function verificationTest(
    foo
  , baz
  , nested =
    { a: 1
    , b: 2
    , c: 3
    }
) {
  const thing =
  { 'some prop' : 1
  , 'another' : true
  , 'object_array' : [ 
    { "indentation" : 2
      , "commas" : "at start"
      , "closing_brace" : "new line"
    }
  ]
  , 'object_array_2' :
    [ { "indentation" : 2
      , "commas" : "at start"
      , "closing_brace" : "new line"
      }
    , { "indentation" : 2
      , "commas" : "at start"
      , "closing_brace" : "new line"
      }
    ]
  , 'yetmore' : false
  }
  if (true) {
    const data =
    { foo: 'bar'
    , baz: 'qux'
    , nested:
      { a: 1
      , b: 2
      , c: 3
      }
    }
    console.log(data)
  }
}

function reverify( text, depth ) {
    let obj =
    { a: 2
    , b: 4
    , c: 8
    }
    return verificationTest(false, true, { a: 1, b: 2, c: 3 })
}
