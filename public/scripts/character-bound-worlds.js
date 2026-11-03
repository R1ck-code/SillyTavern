/**
 * Collect unique world book names bound to a character.
 * Primary book lives on the card (`data.extensions.world`);
 * auxiliary books live in settings `world_info.charLore`.
 *
 * @param {{ avatar?: string, data?: { extensions?: { world?: string } } } | null | undefined} character
 * @param {{ name?: string, extraBooks?: string[] }[] | null | undefined} charLoreList
 * @returns {string[]}
 */
export function collectCharacterBoundWorldNames(character, charLoreList = []) {
    if (!character) {
        return [];
    }

    const books = [];
    const primary = character.data?.extensions?.world;
    if (primary) {
        books.push(primary);
    }

    const fileName = String(character.avatar || '').replace(/\.[^/.]+$/, '');
    const extra = Array.isArray(charLoreList)
        ? charLoreList.find((entry) => entry?.name === fileName)
        : null;
    if (extra && Array.isArray(extra.extraBooks)) {
        books.push(...extra.extraBooks);
    }

    return [...new Set(books.filter(Boolean))];
}
