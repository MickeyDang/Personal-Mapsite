export enum AssetType {
  None,
  Link,
  Photo,
}

export enum Tag {
  Content = "#EB5757",
  Project = "#BB6BD9",
  Nature = "#219653",
  Urbanism = "#6FCF97",
  Realization = "#F2C94C",
  Habit = "#2F80ED",
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
  assetSrc?: string;
  assetType: AssetType;
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
        barTime: new Date(e.time.getFullYear(), e.time.getMonth(), 1),
        events: [e],
        numEvents: 1,
      };
    }
  });

  return Object.values<CombinedTimelineModel>(combinedEventsMap).sort(
    (a, b) => a.time.getTime() - b.time.getTime(),
  );
};
