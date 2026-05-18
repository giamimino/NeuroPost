import { SearchIndexRefType } from "../../types/worker.js";

const SearchIndexEditCheckWord = (
  initialWord: SearchIndexRefType,
  secondaryWord: SearchIndexRefType,
): SearchIndexRefType => {
  if (
    initialWord.title !== secondaryWord.title ||
    initialWord.description !== secondaryWord.description
  )
    return initialWord;
  
  return secondaryWord
};

export default SearchIndexEditCheckWord;
