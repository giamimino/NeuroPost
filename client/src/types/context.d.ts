export interface ToggleContextType {
  checked: boolean;
  toggle: () => void;
}

export interface CommentContextType {
  openReplies: boolean;
  setOpenReplies: (value: boolean) => void;
  setCloseReplies: () => void;
  setToggleReplies: () => void;
}

export interface ContentContextType {
  expanded: boolean,
  toggleExpanded: () => void;
  setExpanded: (value: boolean) => void
}
