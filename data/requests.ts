import { EventModel, Tag } from "./types";

export const fetchImageUrls = async (photoPointerSrc: String) => {
  try {
    const response = await fetch(`/api/image?key=${photoPointerSrc}`);
    if (response.status == 200) {
      const data = await response.json();
      if (data) {
        console.log(JSON.stringify(data));
        return data.imageUrls;
      } else {
        return [];
      }
    } else {
      const reason = await response.json();
      console.error(`${response.status}. Reason: ${JSON.stringify(reason)}`);
    }
  } catch (error) {
    console.error("Error fetching image:", error);
  }
};

export const getTags = (tags: String[]) => {
  return tags.map((tag) => {
    switch (tag) {
      case "Literature":
        return Tag.Literature;
      case "Project":
        return Tag.Project;
      case "Nature":
        return Tag.Nature;
      case "Urbanism":
        return Tag.Urbanism;
      case "Work":
        return Tag.Work;
      case "Hobby":
        return Tag.Hobby;
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

  return moments.sort((a, b) => a.time.getTime() - b.time.getTime());
};
