import { expect, test } from 'bun:test'
import { convertToUTC, convertToUTCDate, getCurrentUTCDate } from '@/pkg'

const testCases = [
  {
    name: 'date object with timezone - JST to UTC',
    input: new Date('2023-12-15T09:00:00+0900'),
    expected: '2023-12-15T00:00:00Z',
  },
  {
    name: 'date object with timezone - EST to UTC',
    input: new Date('2023-12-14T19:00:00-0500'),
    expected: '2023-12-15T00:00:00Z',
  },
  {
    name: 'date object without timezone (includes time)',
    input: new Date('2023-12-15 00:00:00'),
    expected: '2023-12-15T00:00:00Z',
  },
  {
    name: 'date object without timezone (date only)',
    input: new Date('2023-12-15'),
    expected: '2023-12-15T00:00:00Z',
  },
  {
    name: 'string with timezone - JST to UTC',
    input: '2023-12-15T09:00:00+0900', // JST
    expected: '2023-12-15T00:00:00Z', // UTC
  },
  {
    name: 'string with timezone - EST to UTC',
    input: '2023-12-14T19:00:00-0500', // EST
    expected: '2023-12-15T00:00:00Z', // UTC
  },
  {
    name: 'string with timezone - BST to UTC',
    input: '2023-12-15T01:00:00+0100', //BST
    expected: '2023-12-15T00:00:00Z', // UTC
  },
  {
    name: 'string with timezone - UTC to UTC',
    input: '2023-12-15T00:00:00Z', // UTC
    expected: '2023-12-15T00:00:00Z', // UTC
  },
  {
    name: 'string without timezone (includes time)',
    input: '2023-12-15 00:00:00',
    expected: '2023-12-15T00:00:00Z',
  },
  {
    name: 'string without timezone (date only)',
    input: '2023-12-15',
    expected: '2023-12-15T00:00:00Z',
  },
  {
    name: 'number',
    input: 1702598400000, // 2023-12-15T00:00:00Z
    expected: '2023-12-15T00:00:00Z',
  },
]

for (const { name, input, expected } of testCases) {
  test(name, () => {
    const result = convertToUTC(input)
    expect(result).toBe(expected)
  })
}

const testCases2 = [
  {
    name: 'UTC',
    location: 'UTC',
  },
  {
    name: 'Asia/Tokyo',
    location: 'Asia/Tokyo',
  },
  {
    name: 'America/New_York',
    location: 'America/New_York',
  },
  {
    name: 'Europe/London',
    location: 'Europe/London',
  },
]

for (const { name, location } of testCases2) {
  test(name, () => {
    process.env.TZ = location
    const result = getCurrentUTCDate()
    expect(result.toISOString()).toMatch(/T.*Z/)
  })
}

const testCases3 = [
  {
    input: '2023-12-14T15:00:00Z',
    expected: '2023-12-14T15:00:00.000Z',
  },
  {
    input: '2023-12-14T15:00:00+09:00', // JST
    expected: '2023-12-14T06:00:00.000Z',
  },
  {
    input: '2023-12-14T15:00:00-05:00', // EST
    expected: '2023-12-14T20:00:00.000Z',
  },
  {
    input: '2023-12-14T15:00:00+01:00', // BST
    expected: '2023-12-14T14:00:00.000Z',
  },
]

for (const { input, expected } of testCases3) {
  test('convertToUTCDate', () => {
    const result = convertToUTCDate(input)
    // Confirm UTC
    expect(result.toISOString()).toEqual(expected)
  })
}
