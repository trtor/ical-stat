import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { CalendarResponse } from "node-ical";
import { sync } from "node-ical";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

const yearList = ["2019", "2020", "2021", "2022", "2023"] as const;

const icalPath = "src/ics/basic.ics";

function main(): void {
  const events = sync.parseFile(icalPath);

  const i131inGroup = reduceI131InGroup(events);

  const reduceResult = i131inGroup.reduce<RaiResultTable[]>(
    (acc, cur) => {
      for (const year of yearList) {
        if (dayjs(cur.date).year() === Number(year)) {
          const lowIdx = acc.findIndex((acc) => acc.type === "I-131 6-29 mCi");
          const highIdx = acc.findIndex((acc) => acc.type === "I-131 30 mCi");
          if (cur.i131Dose === 30) {
            acc[highIdx][year]++;
          } else if (cur.i131Dose > 5 && cur.i131Dose < 30) {
            acc[lowIdx][year]++;
          }
        }
      }
      return acc;
    },
    [
      {
        type: "I-131 6-29 mCi",
        "2019": 0,
        "2020": 0,
        "2021": 0,
        "2022": 0,
        "2023": 0,
      },
      {
        type: "I-131 30 mCi",
        "2019": 0,
        "2020": 0,
        "2021": 0,
        "2022": 0,
        "2023": 0,
      },
    ],
  );

  // eslint-disable-next-line no-console
  console.table(reduceResult);
}

type RaiResultTable = Record<(typeof yearList)[number], number> & {
  type: "I-131 6-29 mCi" | "I-131 30 mCi";
};

function reduceI131InGroup(events: CalendarResponse): CumulativeI131GroupCount[] {
  return Object.values(events).reduce<CumulativeI131GroupCount[]>((acc, event) => {
    if (event.type === "VEVENT") {
      if (event.datetype === "date-time") {
        const isI131 = /I-131/i.test(event.summary);
        const doseNumber = parseMilliCuriNumber(event.summary);
        if (isI131 && doseNumber) return [...acc, { date: dayjs(event.start).toDate(), i131Dose: doseNumber }];
      }
    }
    return acc;
  }, []);
}

function parseMilliCuriNumber(text: string): number | null {
  const regDose = /(\d+)\s+mCi/gi;
  const m = regDose.exec(text);
  if (m && m?.at(1)) {
    if (!isNaN(Number(m.at(1)))) {
      return Number(m.at(1));
    }
  }
  return null;
}

type CumulativeI131GroupCount = { date: Date; i131Dose: number };

main();
