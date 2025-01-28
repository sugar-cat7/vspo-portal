import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import timeZone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(customParseFormat)
dayjs.extend(timeZone)
dayjs.extend(utc)
dayjs.tz.setDefault('UTC')

const convertToUTC = (input: Date | string | number) => {
  return dayjs.tz(input).utc().format()
}

const getCurrentUTCDate = () => {
  return dayjs.tz().toDate()
}

const getCurrentUTCString = () => {
  return dayjs.tz().format()
}

const convertToUTCDate = (input: Date | string | number) => {
  return dayjs.tz(input).utc().toDate()
}

export { convertToUTC, convertToUTCDate, getCurrentUTCDate, getCurrentUTCString }

