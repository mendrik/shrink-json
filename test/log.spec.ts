import { log } from '../src'
import data from './test.json'

describe('log', () => {
  it('works', () => {
    const jsonLog = log()
    console.log(jsonLog(data as any))
    expect(1 ).toEqual(1)
  })
})
