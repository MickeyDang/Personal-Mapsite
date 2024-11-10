export enum Tag {
  Literature = "#EB5757",
  Nature = "#219653",
  Urbanism = "#9B51E0",
  Work = "#F2C94C",
  Hobbies = "#2F80ED",
  Travel = "#F2994A",
  None = "#BDBDBD",
}

export type EventModel = {
  title: string;
  longitude: number;
  latitude: number;
  tags: Tag[];
  time: Date;
  description: string;
  linkTitle: string;
  linkSrc?: string;
  photoPointerSrc: string;
};

export type CombinedMapModel = {
  longitude: number;
  latitude: number;
  events: EventModel[];
  numEvents: number;
};

export type CombinedTimelineModel = {
  time: Date;
  barTime: Date;
  events: EventModel[];
  numEvents: number;
};

export const mapStringToTag = (strings: string[]): Tag[] => {
  return strings.map((string) => {
    switch (string) {
      case "Literature":
        return Tag.Literature;
      case "Nature":
        return Tag.Nature;
      case "Urbanism":
        return Tag.Urbanism;
      case "Work":
        return Tag.Work;
      case "Hobbies":
        return Tag.Hobbies;
      case "Travel":
        return Tag.Travel;
      default:
        return Tag.None;
    }
  });
};

export const combineToMapFormat = (
  events: EventModel[],
): CombinedMapModel[] => {
  const combinedEventsMap = {};
  events.forEach((e) => {
    const mapKey = `${e.longitude},${e.latitude}`;
    if (combinedEventsMap[mapKey]) {
      combinedEventsMap[mapKey].events.push(e);
      combinedEventsMap[mapKey].numEvents++;
    } else {
      combinedEventsMap[mapKey] = {
        latitude: e.latitude,
        longitude: e.longitude,
        events: [e],
        numEvents: 1,
      };
    }
  });

  return Object.values<CombinedMapModel>(combinedEventsMap);
};

export const createBarTimeFromEvent = (e: EventModel) => new Date(e.time.getFullYear(), e.time.getMonth(), 1);

export const combineToTimelineFormat = (
  events: EventModel[],
): CombinedTimelineModel[] => {
  const combinedEventsMap = {};
  events.forEach((e) => {
    const key = `${e.time.getFullYear()},${e.time.getMonth()}`;

    if (combinedEventsMap[key]) {
      combinedEventsMap[key].events.push(e);
      combinedEventsMap[key].numEvents++;
    } else {
      combinedEventsMap[key] = {
        time: e.time,
        barTime: createBarTimeFromEvent(e),
        events: [e],
        numEvents: 1,
      };
    }
  });

  return Object.values<CombinedTimelineModel>(combinedEventsMap).sort(
    (a, b) => a.time.getTime() - b.time.getTime(),
  );
};
