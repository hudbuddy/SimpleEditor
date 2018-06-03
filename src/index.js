import {periodic, scan, run, runEffects} from '@most/core'
import {newDefaultScheduler} from '@most/scheduler'
import {cycle} from '@cycle/most-run'
import fp from 'lodash/fp'
import Chart from 'chart.js'

const {each, toUpper, last, pipe, toPairs, add, after, ary, assign, assignAllWith, assignIn, assignInAllWith, at, before, bind, bindAll, bindKey, chunk, cloneDeepWith, cloneWith, concat, conformsTo, countBy, curryN, curryRightN, debounce, defaultTo, defaults, defaultsDeep, delay, difference, divide, drop, dropRight, dropRightWhile, dropWhile, endsWith, eq, every, filter, find, findIndex, findKey, findLast, findLastIndex, findLastKey, flatMap, flatMapDeep, flattenDepth, forEach, forEachRight, forIn, forInRight, forOwn, forOwnRight, get, groupBy, gt, gte, has, hasIn, includes, indexOf, intersection, invertBy, invoke, invokeMap, isEqual, isMatch, join, keyBy, lastIndexOf, lt, lte, map, mapKeys, mapValues, matchesProperty, maxBy, meanBy, merge, mergeAllWith, minBy, multiply, nth, omit, omitBy, overArgs, pad, padEnd, padStart, parseInt, partial, partialRight, partition, pick, pickBy, propertyOf, pull, pullAll, pullAt, random, range, rangeRight, reject, remove, repeat, restFrom, result, sampleSize, some, sortBy, sortedIndex, sortedIndexOf, sortedLastIndex, sortedLastIndexOf, sortedUniqBy, split, spreadFrom, startsWith, subtract, sumBy, take, takeRight, takeRightWhile, takeWhile, tap, throttle, thru, times, trimChars, trimCharsEnd, trimCharsStart, truncate, union, uniqBy, uniqWith, unset, unzipWith, without, wrap, xor, zip, zipObject, assignAll, assignInAll, attempt, ceil, create, curry, curryRight, defaultsAll, defaultsDeepAll, floor, fromPairs, invert, memoize, mergeAll, method, methodOf, nthArg, overEvery, overSome, rest, reverse, round, spread, template, trim, trimEnd, trimStart, uniqueId, words, assignInWith, assignWith, clamp, differenceBy, differenceWith, findFrom, findIndexFrom, findLastFrom, findLastIndexFrom, flatMapDepth, getOr, inRange, includesFrom, indexOfFrom, intersectionBy, intersectionWith, invokeArgs, invokeArgsMap, isEqualWith, isMatchWith, lastIndexOfFrom, mergeWith, orderBy, padChars, padCharsEnd, padCharsStart, pullAllBy, pullAllWith, rangeStep, rangeStepRight, reduce, reduceRight, replace, slice, sortedIndexBy, sortedLastIndexBy, transform, unionBy, unionWith, update, xorBy, xorWith} = fp
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
const appendTo = parent => el => parent.appendChild(el)
const addNodeTo = parent => pipe(
  createNode,
  wrapIn('div'),
  tap(appendTo(parent))
)

const log = (first, ...args) => {
  addNodeTo(els.console)(first)
  each(arg => {})(args)
  console.log(first, ...args)
}

const tapLog = (x) => {
  console.log(x)
  return x
}

// ======

const props = {
  width: 200,
  height: 200,
  left: 200,
  top: 200,
  rotate: 0,
}























