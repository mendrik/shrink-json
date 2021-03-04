import { blue, darkGray, green, lightGreen, lightMagenta, lightYellow, magenta, yellow } from 'ansicolor'
import { format } from 'date-fns'
import { head, join, map, pipe, toPairs } from 'ramda'

type JsonScalar = number | string | boolean | null
type JsonObject = { [key: string]: JsonScalar | JsonObject | JsonArray; }
type JsonArray = Array<Json>
type Json = JsonScalar | JsonObject | JsonArray

const isoDatePattern = new RegExp(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);

const isShortArray = (arr: JsonArray): boolean => JSON.stringify(arr).length < 80
const isShortObj = (obj: JsonObject): boolean => JSON.stringify(obj).length < 25
const isString = (str: JsonScalar): str is string => typeof str === 'string'
const isDate = (str: JsonScalar): str is string => typeof str === 'string' && (/(\d{2}|\d{4}).\d{2}.(\d{2}|\d{4})/.test(str) || isoDatePattern.test(str))
const isBool = (str: JsonScalar): str is boolean => typeof str === 'boolean'
const isNumber = (str: JsonScalar): str is number => typeof str === 'number'
const isArray = (obj: Json): obj is JsonArray => Array.isArray(obj)
const isObject = (obj: Json): obj is JsonObject => typeof obj === 'object'

const asArray = (depth: number, options: Options) => (arr: JsonArray): string =>
  `${yellow('[')}${
    isShortArray(arr)
      ? pipe(
      map(logJson(0, options)),
      join(darkGray(','))
      )(arr)
      : `${logJson(depth, options)(head(arr)!)}` + darkGray(`, ...${arr.length - 1} items`)
  }${yellow(']')}`


const serializeObj = (depth: number, options: Options, eol: string) => pipe(
  toPairs,
  map(([k, v]) => isObject(v as Json)
    ? `${lightMagenta(k)}: ${logJson(depth + 1, options)(v)}`
    : `${magenta(k)}: ${logJson(depth + 1, options)(v)}`) as any,
  map(x => eol === '' ? x : '\t' + x),
  join(`, ${eol}`)
)

const asObject =
  (depth: number, options: Options) =>
    (obj: JsonObject, eol = isShortObj(obj) ? '' : '\n' + '\t'.repeat(depth)): string => {
      return `{${eol}${serializeObj(depth, options, eol)(obj)}${eol}}`
    }

export const logJson = (depth: number = 0, options: Options) => (json: Json): string => {
  if (isArray(json)) {
    return asArray(depth, options)(json)
  } else if (isObject(json)) {
    return asObject(depth, options)(json)
  } else if (isDate(json)) {
    const str = /^\d{4}-\d{2}-\d{2}$/.test(json) ? json + 'T00:00:00' : json
    try {
      const date = new Date(str)
      return date.getMinutes() === 0 && date.getSeconds() === 0 && date.getHours() === 0
        ? lightGreen(format(date, options.dateFormat)) : lightGreen(format(date, options.datetimeFormat))
    } catch (e) {
      return lightGreen(json)
    }
  } else if (isString(json)) {
    return darkGray('"') + blue(json) + darkGray('"')
  } else if (isBool(json)) {
    return lightYellow(`${json}`)
  } else if (isNumber(json)) {
    return green(`${json}`)
  } else {
    return JSON.stringify(json)
  }
}

export interface Options {
  dateFormat: string
  datetimeFormat: string
}

export const log = (options: Options = {
  datetimeFormat: 'dd.MM.yy HH:mm',
  dateFormat: 'dd.MM.yy'
}) => (json: Json): string => logJson(0, options)(json)
