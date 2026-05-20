import { SearchIndexRefType } from "../../types/worker.js";

const SearchIndexEditCheckWord = (
  newWord: SearchIndexRefType,
  oldWord: SearchIndexRefType,
): { isChanged: boolean; word: SearchIndexRefType } => {
  if (
    newWord.title !== oldWord.title ||
    newWord.description !== oldWord.description
  )
    return { isChanged: true, word: newWord };

  return { isChanged: false, word: oldWord };
};

export default SearchIndexEditCheckWord;
