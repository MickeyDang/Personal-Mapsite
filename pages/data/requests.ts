import { AssetType, EventModel, Tag } from "./types";

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

export const getAssetTypeEnum = (value: String) => {
  switch (value) {
    case "Link":
      return AssetType.Link;
    case "Photo":
      return AssetType.Photo;
    default:
      return AssetType.None;
  }
};

export const getAssetSrc = (fields) => {
  if (getAssetTypeEnum(fields.AssetType) === AssetType.Link) {
    return fields.Link;
  } else {
    return fields.Title;
  }
};

export const convertResponseToEventModel = (data) => {
  const moments: EventModel[] = data.map((e) => {
    return {
      title: e.fields.Title,
      latitude: e.fields.Latitude.toFixed(8) as number,
      longitude: e.fields.Longitude.toFixed(8) as number,
      tags: getTags(e.fields.Tags),
      time: new Date(e.fields.Date),
      assetType: getAssetTypeEnum(e.fields.AssetType),
      assetSrc: getAssetSrc(e.fields),
      description: e.fields.Description,
    };
  });

  return moments.sort((a,b) => a.time.getTime() - b.time.getTime());
};