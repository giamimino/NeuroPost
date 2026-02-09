const tags = [
  { id: 0, tag: "CI" },
  { id: 1, tag: "Nexus" },
  { id: undefined, tag: "NPC" },
];

const existTags = tags.filter(tag => typeof tag.id !== "undefined")
console.log(existTags);
