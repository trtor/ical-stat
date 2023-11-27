import dayjs from "dayjs";
import type { CalendarResponse } from "node-ical";
import { yearList } from "./config";

// eslint-disable-next-line @typescript-eslint/sort-type-constituents
type ImagingRegName = "bone*s" | "mibi*stress" | "parathy" | "lympho" | "lympha";

const imagingRegPattern: {
  pattern: RegExp;
  name: ImagingRegName;
}[] = [
  { pattern: /bone\s*s/i, name: "bone*s" },
  { pattern: /mibi.*stress/i, name: "mibi*stress" },
  { pattern: /parathy/i, name: "parathy" },
  { pattern: /lympho/i, name: "lympho" },
  { pattern: /lympha/i, name: "lympha" },
];

const hnPattern = /\d{7}/;

export function groupImagingReg(events: CalendarResponse): CumulativeImagingRegCount[] {
  return Object.values(events).reduce<CumulativeImagingRegCount[]>((acc, event) => {
    if (event.type === "VEVENT") {
      if (event.datetype === "date-time") {
        for (const regName of imagingRegPattern) {
          if (regName.pattern.test(event.summary) && hnPattern.test(event.description ?? "")) {
            return [...acc, { date: dayjs(event.start).toDate(), type: regName.name }];
          }
        }
      }
    }
    return acc;
  }, []);
}

export function reduceImagingGroup(
  acc: ImagingRegResultTable[],
  cur: CumulativeImagingRegCount,
): ImagingRegResultTable[] {
  for (const year of yearList) {
    if (dayjs(cur.date).year() === Number(year)) {
      const typeIdx = acc.findIndex((acc) => acc.type === cur.type);
      if (typeIdx === -1) {
        const content: ImagingRegResultTable = {
          type: cur.type,
          "2019": 0,
          "2020": 0,
          "2021": 0,
          "2022": 0,
          "2023": 0,
        };
        content[year]++;
        acc.push(content);
      } else {
        acc[typeIdx][year]++;
      }
    }
  }
  return acc;
}

export type CumulativeImagingRegCount = { date: Date; type: ImagingRegName };

export type ImagingRegResultTable = Record<(typeof yearList)[number], number> & { type: ImagingRegName };
