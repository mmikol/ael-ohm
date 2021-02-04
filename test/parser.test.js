import assert from "assert"
import util from "util"
import parse from "../src/parser.js"

const source1 = `let two = 2 - 0
  print(1 * two)   // TADA 🥑 
  two = sqrt 101.3 //`

const expectedAst1 = `   1 | program: Program
   2 |   statements[0]: Declaration name='two'
   3 |     initializer: BinaryExpression op='-'
   4 |       left: LiteralExpression value=2
   5 |       right: LiteralExpression value=0
   6 |   statements[1]: PrintStatement
   7 |     expression: BinaryExpression op='*'
   8 |       left: LiteralExpression value=1
   9 |       right: IdentifierExpression name='two'
  10 |   statements[2]: Assignment
  11 |     target: IdentifierExpression name='two'
  12 |     source: UnaryExpression op='sqrt'
  13 |       operand: LiteralExpression value=101.3`

const errorFixture1 = [
  ["a missing right operand", "print 5 -", /Line 1, col 10:/],
  ["a non-operator", "print 7 * ((2 _ 3)", /Line 1, col 15:/],
  ["an expression starting with a )", "print )", /Line 1, col 7:/],
  ["a statement starting with expression", "x * 5", /Line 1, col 3:/],
  ["an illegal statement on line 2", "print 5\nx * 5", /Line 2, col 3:/],
  ["a statement starting with a )", "print 5\n) * 5", /Line 2, col 1:/],
  ["an expression starting with a *", "let x = * 71", /Line 1, col 9:/],
]

const source2 = `let one = 5 % 4 
  print(-3 ** 5 % 2 == one) // testing precedence not accuracy lol
  print(5 * 4 / 3 % 2 * 1)
  print(5 % 4 % 3 % 2 % 1)
  print(-5 ** (-4 ** 3 ** 2 ** 1))`

const expectedAst2 = `   1 | program: Program
   2 |   statements[0]: Declaration name='one'
   3 |     initializer: BinaryExpression op='%'
   4 |       left: LiteralExpression value=5
   5 |       right: LiteralExpression value=4
   6 |   statements[1]: PrintStatement
   7 |     expression: BinaryExpression op='=='
   8 |       left: UnaryExpression op='-'
   9 |         operand: BinaryExpression op='%'
  10 |           left: BinaryExpression op='**'
  11 |             left: LiteralExpression value=3
  12 |             right: LiteralExpression value=5
  13 |           right: LiteralExpression value=2
  14 |       right: IdentifierExpression name='one'
  15 |   statements[2]: PrintStatement
  16 |     expression: BinaryExpression op='*'
  17 |       left: BinaryExpression op='%'
  18 |         left: BinaryExpression op='/'
  19 |           left: BinaryExpression op='*'
  20 |             left: LiteralExpression value=5
  21 |             right: LiteralExpression value=4
  22 |           right: LiteralExpression value=3
  23 |         right: LiteralExpression value=2
  24 |       right: LiteralExpression value=1
  25 |   statements[3]: PrintStatement
  26 |     expression: BinaryExpression op='%'
  27 |       left: BinaryExpression op='%'
  28 |         left: BinaryExpression op='%'
  29 |           left: BinaryExpression op='%'
  30 |             left: LiteralExpression value=5
  31 |             right: LiteralExpression value=4
  32 |           right: LiteralExpression value=3
  33 |         right: LiteralExpression value=2
  34 |       right: LiteralExpression value=1
  35 |   statements[4]: PrintStatement
  36 |     expression: UnaryExpression op='-'
  37 |       operand: BinaryExpression op='**'
  38 |         left: LiteralExpression value=5
  39 |         right: UnaryExpression op='-'
  40 |           operand: BinaryExpression op='**'
  41 |             left: LiteralExpression value=4
  42 |             right: BinaryExpression op='**'
  43 |               left: LiteralExpression value=3
  44 |               right: BinaryExpression op='**'
  45 |                 left: LiteralExpression value=2
  46 |                 right: LiteralExpression value=1`
   
describe("The parser", () => {
  it("can parse all the nodes excluding ==, **, and % operators", done => {
    assert.deepStrictEqual(util.format(parse(source1)), expectedAst1)
    done()
  })
  for (const [scenario, source, errorMessagePattern] of errorFixture1) {
    it(`throws on ${scenario}`, done => {
      assert.throws(() => parse(source), errorMessagePattern)
      done()
    })
  }
  it("can parse all the nodes with expected precedence and associativity", done => {
    assert.deepStrictEqual(util.format(parse(source2)), expectedAst2)
    done()
  })
})
