/* eslint-env mocha */

const { Parser } = require('jison')
const fs = require('fs')
const assert = require('assert')

const grammar = fs.readFileSync('./hil.jison', 'utf8')

const parser = new Parser(grammar)

parser.yy = {
  foo: 'FOO',
  bar: 'BAR',
  two: 2
}

describe('HIL', () => {
  describe('Strings', () => {
    it('Pass strings through', () => {
      assert.equal(parser.parse('foo'), 'foo')
    })
    it('Evaluate string value in interpolation expression', () => {
      assert.equal(parser.parse('${"foo"}'), 'foo')
    })
    it('Allow escaped double-qoutes', () => {
      assert.equal(parser.parse('${"foo\\""}'), 'foo"')
    })
  })
  describe('Numerical expressions', () => {
    describe('General', () => {
      it('Evaluate numerical expressions', () => {
        assert.equal(parser.parse('${5 + 2 * 3}'), 11)
      })
      it('Evaluate numerical expressions with varibles', () => {
        assert.equal(parser.parse('${5 + two * 3}'), 11)
      })
    })
    describe('Operators', () => {
      it('Addition', () => {
        assert.equal(parser.parse('${5 + 2}'), 7)
      })
      it('Subtraction', () => {
        assert.equal(parser.parse('${5 - 2}'), 3)
      })
      it('multiplication', () => {
        assert.equal(parser.parse('${5 * 2}'), 10)
      })
      it('division', () => {
        assert.equal(parser.parse('${5 / 2}'), 2.5)
      })
      it('percentage', () => {
        assert.equal(parser.parse('${5 % 2}'), 0.1)
      })
    })
    it('expands scientific notation', () => {
      assert.equal(parser.parse('${5e6}'), 5000000)
    })
    it('unary - denotes negative numbers', () => {
      assert.equal(parser.parse('${-5}'), -5)
    })
  })
  describe('Numerical bases', () => {
    it('Evaluate deciaml numbers', () => {
      assert.equal(parser.parse('${10}'), 10)
    })
    it('Evaluate hexadeciaml numbers', () => {
      assert.equal(parser.parse('${0x10}'), 16)
    })
    it('Evaluate octal numbers', () => {
      assert.equal(parser.parse('${010}'), 8)
    })
  })
  describe('String / interpolation ordering', () => {
    it('Allow strings to preceede interpolations', () => {
      assert.equal(parser.parse('foo ${bar}'), 'foo BAR')
    })
    it('Allow interpolations to preceede strings', () => {
      assert.equal(parser.parse('${foo} bar'), 'FOO bar')
    })
    it('Allow interpolations to be nested in strings', () => {
      assert.equal(parser.parse('foo ${bar} baz'), 'foo BAR baz')
    })
  })
  it('Resolve varibles', () => {
    assert.equal(parser.parse('${foo}'), 'FOO')
  })
})
