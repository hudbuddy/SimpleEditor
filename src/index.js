import {periodic, scan, run, runEffects} from '@most/core'
import {newDefaultScheduler} from '@most/scheduler'
import {cycle} from '@cycle/most-run'
import fp from 'lodash/fp'
import Hammer from 'hammerjs'

const {each, toUpper, keys, isObject, last, pipe, toPairs, add, after, ary, assign, assignAllWith, assignIn, assignInAllWith, at, before, bind, bindAll, bindKey, chunk, cloneDeepWith, cloneWith, concat, conformsTo, countBy, curryN, curryRightN, debounce, defaultTo, defaults, defaultsDeep, delay, difference, divide, drop, dropRight, dropRightWhile, dropWhile, endsWith, eq, every, filter, find, findIndex, findKey, findLast, findLastIndex, findLastKey, flatMap, flatMapDeep, flattenDepth, forEach, forEachRight, forIn, forInRight, forOwn, forOwnRight, get, groupBy, gt, gte, has, hasIn, includes, indexOf, intersection, invertBy, invoke, invokeMap, isEqual, isMatch, join, keyBy, lastIndexOf, lt, lte, map, mapKeys, mapValues, matchesProperty, maxBy, meanBy, merge, mergeAllWith, minBy, multiply, nth, omit, omitBy, overArgs, pad, padEnd, padStart, parseInt, partial, partialRight, partition, pick, pickBy, propertyOf, pull, pullAll, pullAt, random, range, rangeRight, reject, remove, repeat, restFrom, result, sampleSize, some, sortBy, sortedIndex, sortedIndexOf, sortedLastIndex, sortedLastIndexOf, sortedUniqBy, split, spreadFrom, startsWith, subtract, sumBy, take, takeRight, takeRightWhile, takeWhile, tap, throttle, thru, times, trimChars, trimCharsEnd, trimCharsStart, truncate, union, uniqBy, uniqWith, unset, unzipWith, without, wrap, xor, zip, zipObject, assignAll, assignInAll, attempt, ceil, create, curry, curryRight, defaultsAll, defaultsDeepAll, floor, fromPairs, invert, memoize, mergeAll, method, methodOf, nthArg, overEvery, overSome, rest, reverse, round, spread, template, trim, trimEnd, trimStart, uniqueId, words, assignInWith, assignWith, clamp, differenceBy, differenceWith, findFrom, findIndexFrom, findLastFrom, findLastIndexFrom, flatMapDepth, getOr, inRange, includesFrom, indexOfFrom, intersectionBy, intersectionWith, invokeArgs, invokeArgsMap, isEqualWith, isMatchWith, lastIndexOfFrom, mergeWith, orderBy, padChars, padCharsEnd, padCharsStart, pullAllBy, pullAllWith, rangeStep, rangeStepRight, reduce, reduceRight, replace, slice, sortedIndexBy, sortedLastIndexBy, transform, unionBy, unionWith, update, xorBy, xorWith} = fp
const {
  lens,
  lensIndex,
  lensPath,
  lensProp,
  over,
  identity,
  set,
  view,
  modulo,
  negate,
  assoc,
  allPass,
  and,
  anyPass,
  both,
  compose,
  complement,
  cond,
  either,
  ifElse,
  not,
  or,
  propEq,
  unless,
  until,
  pipeK,
  when
} = require('ramda')
const pipe$ = (...list) => acc => list.reduce((acc, fn) => acc.then(fn), Promise.resolve(acc))

const els = {
  app: document.querySelector('#app'),
  console: document.querySelector('#console')
}

// ======

const setProp = prop => val => obj => {
  obj[prop] = val
  return obj
}

const dom = el => fn => (...args) => el[fn](...args)
const createNode = text => document.createTextNode(text)
const createElement = tagName => document.createElement(tagName)
const wrapIn = tagName => appendTo(createElement(tagName))
const appendTo = parent => el => parent.appendChild(el) && parent
const addNodeTo = parent => pipe(
  createNode,
  wrapIn('div'),
  tap(appendTo(parent))
)

const log = (first, ...args) => {
  addNodeTo(els.console)(isObject ? JSON.stringify(first) : first)
  each(arg => {})(args)
  console.log(first, ...args)
}

const tapLog = (x) => {
  console.log(x)
  return x
}

// ======

const editor = document.querySelector('#editor')

const suffix = {
  top: 'px',
  left: 'px',
  rotate: 'deg',
  width: 'px',
  height: 'px',
  cropTop: 'px',
  cropRight: 'px',
  cropBottom: 'px',
  cropLeft: 'px'
}

const css = prop => val => `${val}${suffix[prop]}`
const style = item => (val, prop) => {
  item.style[prop] = css(prop)(val)
}
// const move = direction => initial =>

const createItem = () => {
  let _reference
  const model = {
    top: 100,
    left: 100,
    rotate: 10,
    width: 200,
    height: 150,
    cropTop: 0,
    cropRight: 0,
    cropBottom: 0,
    cropLeft: 0,
    content: 'red',
    scale: 1,
    _isTopResizing: false, // Change top based on deltaY
    _isBottomResizing: false, // Change height based on deltaY
    _isLeftResizing: false, // Change right based on deltaX
    _isRightResizing: false, // Change width based on deltaX
    _isTopCropping: false, // Change top based on deltaY
    _isBottomCropping: false, // Change height based on deltaY
    _isLeftCropping: false, // Change right based on deltaX
    _isRightCropping: false, // Change width based on deltaX
  }

  const itemEl = document.createElement('div')
  itemEl.className = 'item'
  const rotateEl = document.createElement('div')
  rotateEl.setAttribute('data-transform', 'rotate')
  const cropEl = document.createElement('div')
  cropEl.setAttribute('data-transform', 'crop')
  const resizeEl = document.createElement('div')
  resizeEl.setAttribute('data-transform', 'resize')
  const contentEl = document.createElement('div')
  contentEl.setAttribute('data-content', '')

  cropEl.appendChild(contentEl)
  resizeEl.appendChild(cropEl)
  rotateEl.appendChild(resizeEl)
  itemEl.appendChild(rotateEl)
  editor.appendChild(itemEl)

  const mc = new Hammer.Manager(itemEl)
  mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }))
  mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(mc.get('pan'))
  mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')])

  const setContent = val => {
    contentEl.style.background = val
  }
  const rotate = val => {
    model.rotate = val || model.rotate
    rotateEl.style.transform = `rotate(${val}deg)`
  }
  const scale = val => {
    model.scale = val
    itemEl.style.transform = `scale(${val})`
  }
  // TODO: Call this on mouseup with getBoundingClientRect()
  const position = ({ width, height, left, top }) => {
    model.width = width || model.width
    model.height = height || model.height
    model.left = left || model.left
    model.top = top || model.top
    itemEl.style.top = `${model.top}px`
    itemEl.style.left = `${model.left}px`
    itemEl.style.width = `${model.width - model.cropLeft - model.cropRight}px`
    itemEl.style.height = `${model.height - model.cropTop - model.cropBottom}px`
    itemEl.style.transform = `scale(1)`
    // TODO: Set scale to 1
  }

  mc.on('panstart rotatestart pinchstart', (event) => {
    _reference = assign({}, model)
  })
  mc.on('pinchend', event => {
    const {width, height, scale} = model
    model.width *= scale
    model.height *= scale
    const widthDiff = model.width - width
    const heightDiff = model.height - height
    model.scale = 1
    model.left -= widthDiff / 2
    model.top -= heightDiff / 2
    log('OK')
    position(model)
  })
  mc.on('pinch', (event) => {
    scale(event.scale || 1)
  })
  mc.on('rotatestart rotatemove', (event) => {
    rotate(_reference.rotation + event.rotation)
  })

  mc.on('panstart panmove', (event) => {
    const { isFirst, direction, deltaX, deltaY } = event
    position({
      left: _reference.left + deltaX,
      top: _reference.top + deltaY
    })
  })

  // each((prop) => s(defaults[prop], prop))(keys(defaults))
  position(model)
  setContent(model.content)
}

const setPosition = () => {

}

createItem()























