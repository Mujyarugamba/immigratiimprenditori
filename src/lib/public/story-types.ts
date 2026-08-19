export const STORY_CONTENT_TYPES = [
  "interview",
  "business_story",
  "testimony",
  "personal_story",
] as const;

export type StoryContentType = (typeof STORY_CONTENT_TYPES)[number];

export function isStoryContentType(typeCode: string): typeCode is StoryContentType {
  return STORY_CONTENT_TYPES.includes(typeCode as StoryContentType);
}
