import { EventModel, Tag } from "./types";

export const getTags = (tags: String[]) => {
  return tags.map(tag => {
    switch (tag) {
      case "Content":
        return Tag.Content;
      case "Project":
        return Tag.Project;
      case "Realization":
        return Tag.Realization;
      case "Nature":
        return Tag.Nature;
      case "Urbanism":
        return Tag.Urbanism;
      case "Habit":
        return Tag.Habit;
      case "Travel":
        return Tag.Travel;
      default:
        return Tag.None;
    }
  });
};

export const convertResponseToEventModel = (data) => {
  const moments: EventModel[] = data.map((e) => {
    return {
      title: e.fields.Title,
      latitude: e.fields.Latitude.toFixed(8) as number,
      longitude: e.fields.Longitude.toFixed(8) as number,
      tags: getTags(e.fields.Tags),
      time: new Date(e.fields.Date),
      linkTitle: e.fields.LinkTitle,
      linkSrc: e.fields.Link,
      photoPointerSrc: e.fields.Title,
      description: e.fields.Description,
    };
  });

  return moments.sort((a,b) => a.time.getTime() - b.time.getTime());
};