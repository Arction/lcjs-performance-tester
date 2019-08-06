import Item from '../src/Item'
import { OrderedMap } from 'immutable'

export const testItem1: Item = {
    markdown: '<div>Test item 1</div>',
    name: 'Test item 1',
    internalName: 'testItem1',
    externalLink: 'http://localhost/test_item_1',
    tags: ['release-1', 'release-2', 'cn-release-1'],
    tagName: 'release-2',
    topics: ['topic_1', 'chart'],
    code: 'console.log("testItem1")'
}
export const testItem2: Item = {
    markdown: '<div>Test item 2</div>',
    name: 'Test item 2',
    internalName: 'testItem2',
    externalLink: 'http://localhost/test_item_2',
    tags: ['release-1', 'release-2', 'cn-release-1'],
    tagName: 'release-2',
    topics: ['chart', 'topic_2'],
    code: 'console.log("testItem2")'
}

export const testIndex: Item = {
    markdown: '<div>Index</div>',
    name: 'index',
    internalName: 'index',
    externalLink: '',
    tagName: '',
    topics: []
}

export const getTestItemsMap = () => OrderedMap( { testItem1, testItem2, index: testIndex } )
export const getTestItemsMapNoIndex = () => OrderedMap( { testItem1, testItem2 } )
