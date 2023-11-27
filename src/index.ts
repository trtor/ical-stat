import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { sync } from "node-ical";
import type { RaiResultTable } from "./i131";
import { groupI131, initI131ReduceResult, reduceGroupI131 } from "./i131";
import { groupImagingReg, reduceImagingGroup } from "./text-hn";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

const icalPath = "src/ics/basic.ics";

function main(): void {
  const events = sync.parseFile(icalPath);

  /**
   * I-131
   */
  const i131inGroup = groupI131(events);
  const reduceResult = i131inGroup.reduce<RaiResultTable[]>(reduceGroupI131, initI131ReduceResult);
  // eslint-disable-next-line no-console
  console.table(reduceResult);

  /**
   * Imaging
   */
  const imagingInGroup = groupImagingReg(events).reduce(reduceImagingGroup, []);
  // eslint-disable-next-line no-console
  console.table(imagingInGroup);
}

main();
