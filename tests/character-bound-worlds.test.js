import { describe, test, expect } from '@jest/globals';
import { collectCharacterBoundWorldNames } from '../public/scripts/character-bound-worlds.js';

describe('collectCharacterBoundWorldNames', () => {
    test('returns empty list without a character', () => {
        expect(collectCharacterBoundWorldNames(null)).toEqual([]);
        expect(collectCharacterBoundWorldNames(undefined)).toEqual([]);
    });

    test('reads the primary card world', () => {
        const character = {
            avatar: 'Seraphina.png',
            data: { extensions: { world: 'Eldoria' } },
        };
        expect(collectCharacterBoundWorldNames(character)).toEqual(['Eldoria']);
    });

    test('adds auxiliary books from charLore and de-duplicates', () => {
        const character = {
            avatar: 'Seraphina.png',
            data: { extensions: { world: 'Eldoria' } },
        };
        const charLore = [
            { name: 'Seraphina', extraBooks: ['Eldoria', '旅途见闻', ''] },
            { name: 'Other', extraBooks: ['Ignored'] },
        ];
        expect(collectCharacterBoundWorldNames(character, charLore)).toEqual(['Eldoria', '旅途见闻']);
    });

    test('matches charLore by avatar filename without extension', () => {
        const character = { avatar: 'Alice_1.png', data: { extensions: { world: '' } } };
        const charLore = [{ name: 'Alice_1', extraBooks: ['Town'] }];
        expect(collectCharacterBoundWorldNames(character, charLore)).toEqual(['Town']);
    });
});
