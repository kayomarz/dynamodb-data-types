const { updateExpr } = require("./update-expression");

test("updateExpr add", () => {
  const props = updateExpr()
        .add({
          age: 1,
          numbers: [0, 1, 2, 3],
          nothing1: null,
          nothing2: undefined
        })
        .done();

  expect(props).toEqual({
    ExpressionAttributeValues: {
      ":a": { N: "1" },
      ":b": { NS: ["0", "1", "2", "3"] },
      ":c": { NULL: true },
    },
    UpdateExpression: "ADD age :a, numbers :b, nothing1 :c",
  });
});

test("updateExpr set", () => {
  const props = updateExpr()
        .set({
          name: "new name",
          nickNames: ["nick1", "nick2"],
          age: 20,
          numbers: [0, 2, 4, 6],
          nothing1: null,
          nothing2: undefined
        })
        .done();
  expect(props).toEqual({
    ExpressionAttributeValues: {
      ":a": { S: "new name" },
      ":b": { SS: ["nick1", "nick2"] },
      ":c": { N: "20" },
      ":d": { NS: ["0", "2", "4", "6"] },
      ":e": { NULL: true }
    },
    ExpressionAttributeNames: {
      "#A": "name"
    },
    UpdateExpression: "SET #A = :a, nickNames = :b, age = :c, numbers = :d, nothing1 = :e",
  });
});

test("updateExpr remove", () => {
  const props = updateExpr()
        .remove("name")
        .remove("age")
        .remove("tel")
        .remove("history")
        .done();
  expect(props).toEqual({
    UpdateExpression: "REMOVE name, age, tel, history",
  });
});

test("updateExpr delete", () => {
  const props = updateExpr()
        .delete({
          colors: ["red"],
          numbers: [123]
        })
        .delete({
          refs: [456]
        })
        .done();
  expect(props).toEqual({
    UpdateExpression: "DELETE colors :a, numbers :b, refs :c",
    ExpressionAttributeValues: {
      ":a": { SS: ["red"] },
      ":b": { NS: ["123"] },
      ":c": { NS: ["456"] }
    }
  });
});

test("updateExpr", () => {
  const props = updateExpr()
        .set({ name: "some name" })
        .add({ age: 1 })
        .add({ weight: -5 })
        .add({ credit: 100.5, bill: 5 })
        .delete({ roles: ["admin"], day: [3] })
        .remove("hobbies, profession")
        .remove("languages")
        .delete({ refs: [456] })
        .remove("work-experience")
        .done();

  expect(props).toEqual({
    UpdateExpression: "SET #A = :a REMOVE hobbies, profession, languages, work-experience ADD age :b, weight :c, credit :d, bill :e DELETE #B :f, #C :g, refs :h",
    ExpressionAttributeValues: {
      ":a": { S: "some name" },
      ":b": { N: "1" },
      ":c": { N: "-5" },
      ":d": { N: "100.5" },
      ":e": { N: "5" },
      ":f": { SS: ["admin"] },
      ":g": { NS: ["3"] },
      ":h": { NS: ["456"] },
    },
    ExpressionAttributeNames: {
      "#A": "name",
      "#B": "roles",
      "#C": "day",
    }
  });
});
