/**
 * // YYYY-MM-DD HH:mm:ss
 * @param {Date} dateObj
 * @param {{
 *    language: 'en' | 'zh_cn',
 *    format: String
 *  }} options
 */
export function formatDate(dateObj, options = {}) {
  // 获取语言参数，默认为英文
  const { language = "en", format = "ddd" } = options;
  // 获取日期信息
  const dateInfo = getDateInfo(dateObj, language);
  // 获取日期信息中的全年、日期、时、分、秒
  const { fullYear, day } = dateInfo;
  // 获取日期信息中的星期名称
  const dayName = getDayName(day, language, format);
  // 获取日期信息中的全年、日期、时、分、秒、毫秒
  const [month, date, hours, minutes, seconds] = fillZero(dateInfo);
  // 返回日期信息
  return {
    ...dateInfo,
    dayName,
    YYYYMMDDHHmmss: `${fullYear}-${month}-${date} ${hours}:${minutes}:${seconds}`,
    YYYYMMDD: `${fullYear}-${month}-${date}`,
    MMDD: `${month}-${date}`,
    HHmmss: `${hours}:${minutes}:${seconds}`
  };
}

function getDateInfo(date) {
  // 将日期转换为Date对象
  date = new Date(date);
  // 返回日期信息
  return {
    date: date.getDate(),
    day: date.getDay(),
    fullYear: date.getFullYear(),
    hours: date.getHours(),
    milliseconds: date.getMilliseconds(),
    minutes: date.getMinutes(),
    month: date.getMonth() + 1,
    seconds: date.getSeconds(),
    time: date.getTime(),
    timezoneOffset: date.getTimezoneOffset(),
    UTCDate: date.getUTCDate(),
    UTCDay: date.getUTCDay(),
    UTCFullYear: date.getUTCFullYear(),
    UTCHours: date.getUTCHours(),
    UTCMilliseconds: date.getUTCMilliseconds(),
    UTCMinutese: date.getUTCMinutes(),
    UTCMonth: date.getUTCMonth(),
    UTCSecondse: date.getUTCSeconds(),
    year: date.getYear()
  };
}

function getDayName(day, language, format) {
  // 获取日期信息中的星期名称
  const dayName = {
    en: {
      full: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      d: ["S", "M", "T", "W", "T", "F", "S"],
      dd: ["Sa", "Mo", "Tu", "We", "Th", "Fr", "Su"],
      ddd: ["Sat", "Mon", "Tue", "Wed", "Thu", "Fri", "Sun"]
    },
    zh_cn: {
      d: ["一", "二", "三", "四", "五", "六", "日"],
      dd: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      ddd: [
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
        "星期日"
      ]
    }
  };
  return dayName[language][format][day];
}

function fillZero(dateInfo) {
  return ["month", "date", "hours", "minutes", "seconds"].map((key) => {
    const date = dateInfo[key];
    return date < 10 ? "0" + date : date;
  });
}
