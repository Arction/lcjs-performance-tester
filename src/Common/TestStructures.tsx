/**
 * Datastructure defines a list that contains tests.
 */
export type TestList = Array<TestItem>
/**
 * Datastructure defines a test-item. This can either be a runnable test, or a group which contains tests.
 */
export type TestItem = TestGroup | Test
/**
 * Interface for common data between groups and tests.
 */
interface CommonTestData {
    /**
     * TODO: Comments
     */
    label: string
    /**
     * TODO: Comments
     */
    key: string
    /**
     * Flag that tells custom default state for selection.
     */
    defaultSelected?: boolean
}
/**
 * Datastructure defines a group of tests.
 */
export interface TestGroup extends CommonTestData {
    /**
     * TestItems of group.
     */
    members: Array<TestItem>
    /**
     * Flag that tells custom default state for collapsion.
     */
    defaultCollapsed?: boolean
}
/**
 * Datastructure defines a test, which can be run in iframe.
 */
export interface Test extends CommonTestData {
    /**
     * Test code.
     */
    code: string
}
/**
 * Check if TestItem is TestGroup or Test.
 */
export const isGroup = ( testItem: TestItem ): testItem is TestGroup => 'members' in testItem
