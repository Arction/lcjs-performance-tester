const { describe, it, beforeEach, afterEach } = require('mocha')
const expect = require('chai').expect
const generator = require('../../scripts/generator')
const GitFacade = require('../../scripts/git')
const fs = require('fs')
const path = require('path')
const sinon = require('sinon')
const gulpGit = require('gulp-git')
const { returnsNullWithNonStringInput, returnsNullWithNullOrUndefined } = require('../jstools')

describe('makeStringSafe', () => {
    it('should remove \\r', () => {
        const input = '\r'
        const expectedOutput = ''
        expect(generator.makeStringSafe(input)).to.equal(expectedOutput)
    })

    it('should escape \\n', () => {
        const input = '\n'
        const expectedOutput = '\\n'
        expect(generator.makeStringSafe(input)).to.equal(expectedOutput)
    })

    it('should escape "', () => {
        const input = '"'
        const expectedOutput = '\\"'
        expect(generator.makeStringSafe(input)).to.equal(expectedOutput)
    })

    it('should escape " \\n and remove \\r all at same time', () => {
        const input = '"test"\n\r"test"'
        const expectedOutput = '\\"test\\"\\n\\"test\\"'
        expect(generator.makeStringSafe(input)).to.equal(expectedOutput)
    })

    it('should return null with undefined, null or non string input', () => {
        returnsNullWithNullOrUndefined(generator.makeStringSafe)
        returnsNullWithNonStringInput(generator.makeStringSafe)
    })
})

describe('convertMarkdown', () => {
    it('should convert valid markdown string to string safe html', () => {
        const input = '# H1\n## H2'
        const expectedOutput = '<h1 id=\\"h1\\">H1</h1>\\n<h2 id=\\"h2\\">H2</h2>'
        expect(generator.convertMarkdown(input)).to.equal(expectedOutput)
    })

    it('should return null with undefined, null or non string input', () => {
        returnsNullWithNullOrUndefined(generator.convertMarkdown)
        returnsNullWithNonStringInput(generator.convertMarkdown)
    })

    it('should do code syntax higlighting on inline code', () => {
        const input = '`const x = "Arction"`'
        const expectedOutput = '<p><code class=\\"language-bash\\">const x <span class=\\"token operator\\">=</span> <span class=\\"token string\\">\\"Arction\\"</span></code></p>'
        expect(generator.convertMarkdown(input)).to.equal(expectedOutput)
        expect(generator.convertMarkdown(input)).to.contain('<p>')
        expect(generator.convertMarkdown(input)).to.contain('language-bash')
    })

    it('should do code syntax higlighting on code blocks', () => {
        const input = '```\nconst x = "Arction"\n```'
        const expectedOutput = '<pre class=\\"language-bash\\"><code class=\\"language-bash\\">const x <span class=\\"token operator\\">=</span> <span class=\\"token string\\">\\"Arction\\"</span></code></pre>'
        expect(generator.convertMarkdown(input)).to.equal(expectedOutput)
        expect(generator.convertMarkdown(input)).to.contain('<pre')
        expect(generator.convertMarkdown(input)).to.contain('language-bash')
    })

    it('should do code syntax higlighting on code blocks with specified language', () => {
        const input = '```js\n const x = "Arction"\n```'
        const expectedOutput = '<pre class=\\"language-js\\"><code class=\\"js language-js\\"> <span class=\\"token keyword\\">const</span> x <span class=\\"token operator\\">=</span> <span class=\\"token string\\">\\"Arction\\"</span></code></pre>'
        expect(generator.convertMarkdown(input)).to.equal(expectedOutput)
        expect(generator.convertMarkdown(input)).to.contain('<pre')
        expect(generator.convertMarkdown(input)).to.contain('language-js')
    })
})

describe('findFile', () => {
    let fsReadDirSyncStub
    let fsLstatSyncStub
    const testDir = 'temp'

    beforeEach(() => {
        fsReadDirSyncStub = sinon.stub(fs, 'readdirSync')
        fsLstatSyncStub = sinon.stub(fs, 'lstatSync')
    })

    afterEach(() => {
        fsReadDirSyncStub.restore()
        fsLstatSyncStub.restore()
    })

    it('should find the file from the folder', () => {
        const findFile = 'testFile.file'
        const basePath = path.resolve(testDir)
        fsReadDirSyncStub.returns(['readme.md', 'index.js', 'testFile.file'])
        fsLstatSyncStub.returns({ isDirectory: () => false })
        const result = generator.findFile(basePath, findFile)
        expect(result).to.equal(path.resolve(basePath, findFile))
    })

    it('should be case insensitive', () => {
        const actualFile = 'testFile.file'
        const findFile = 'TESTFILE.file'
        const basePath = path.resolve(testDir)
        fsReadDirSyncStub.returns(['readme.md', 'index.js', 'testFile.file'])
        fsLstatSyncStub.returns({ isDirectory: () => false })
        const result = generator.findFile(basePath, findFile)
        expect(result).to.equal(path.resolve(basePath, actualFile))
    })

    it('should return null with null or undefined basePath', () => {
        const findFile = 'testFile.file'
        const basePath = null
        const result = generator.findFile(basePath, findFile)
        expect(result).to.be.null
    })

    it('should return null with null or undefined fileName', () => {
        const findFile = null
        const basePath = path.resolve(testDir)
        fsReadDirSyncStub.returns(['readme.md', 'index.js', 'testFile.file'])
        fsLstatSyncStub.returns({ isDirectory: () => false })
        const result = generator.findFile(basePath, findFile)
        expect(result).to.be.null
    })

    it('should return null with non string basePath or fileName', () => {
        fsReadDirSyncStub.returns(['readme.md', 'index.js', 'testFile.file'])
        fsLstatSyncStub.returns({ isDirectory: () => false })
        const findFile = { arction: true }
        const basePath = path.resolve(testDir)
        const result = generator.findFile(basePath, findFile)
        expect(result).to.be.null
        const findFile2 = 'testFile.file'
        const basePath2 = 1
        const result2 = generator.findFile(basePath2, findFile2)
        expect(result2).to.be.null
    })
})

describe('findReadme', () => {
    let findFileStub
    const testDir = 'temp'

    beforeEach(() => {
        findFileStub = sinon.stub(generator, 'findFile')
    })

    afterEach(() => {
        findFileStub.restore()
    })

    it('should call "findFile" with directory and "readme.md" and return the value from the "findFile" function', () => {
        findFileStub.returns('yes')
        const dir = path.resolve(testDir)
        const result = generator.findReadme(dir)
        expect(findFileStub.calledWith(dir, 'readme.md')).to.be.true
        expect(result).to.equal('yes')
    })
})

describe('resolveName', () => {
    it('should return the string after "# " on the first line', () => {
        const expectedOutput = 'test'
        const input = '# test \n # test 2'
        expect(generator.resolveName(input)).to.equal(expectedOutput)
    })

    it('should return null if first line doesn\'t contain "# "', () => {
        const expectedOutput = null
        const input = 'test \n # test 2'
        expect(generator.resolveName(input)).to.equal(expectedOutput)
    })

    it('should return null if there is nothing after "# "', () => {
        const expectedOutput = null
        const input = '# '
        expect(generator.resolveName(input)).to.equal(expectedOutput)
    })

    it('should return null with null or undefined input', () => {
        returnsNullWithNullOrUndefined(generator.resolveName)
    })

    it('should return null with non string input', () => {
        returnsNullWithNonStringInput(generator.resolveName)
    })

    it('should return starting from the first "# " even if there is multiple matches on the first line', () => {
        const input = '# test # test 2'
        const expectedOutput = 'test # test 2'
        expect(generator.resolveName(input)).to.equal(expectedOutput)
    })
})

describe('resolveInternalName', () => {
    it('should return the internal name of the project with "-" replaced with "_"', () => {
        const expectedOutput = 'test_example_01'
        const input = 'test-example-01'
        expect(generator.resolveInternalName(input)).to.equal(expectedOutput)
    })

    it('should return the internal name of the project from path with "-" replaced with "_"', () => {
        const expectedOutput = 'test_example_01'
        const input = path.resolve('.', 'test_example_01')
        expect(generator.resolveInternalName(input)).to.equal(expectedOutput)
    })

    it('should return null with null or undefined input', () => {
        returnsNullWithNullOrUndefined(generator.resolveInternalName)
    })

    it('should return null with non string input', () => {
        returnsNullWithNonStringInput(generator.resolveInternalName)
    })
})

describe('resolveIndex', () => {
    it('should return 9999 with null or undefined or non string input', () => {
        returnsNullWithNonStringInput(generator.resolveIndex)
        returnsNullWithNullOrUndefined(generator.resolveIndex)
    })

    it('should return 0 with test_0000_item', () => {
        const expectedOutput = 0
        const input = 'test_0000_item'
        expect(generator.resolveIndex(input)).to.equal(expectedOutput)
    })

    it('should return 1 with test_0000_item', () => {
        const expectedOutput = 1
        const input = 'test_0001_item'
        expect(generator.resolveIndex(input)).to.equal(expectedOutput)
    })

    it('should return null with test_item', () => {
        const expectedOutput = null
        const input = 'test_item'
        expect(generator.resolveIndex(input)).to.equal(expectedOutput)
    })
})

describe('readTagName', () => {
    let fsReadFileSyncStub
    let consoleStub

    beforeEach(() => {
        fsReadFileSyncStub = sinon.stub(fs, 'readFileSync')
    })

    afterEach(() => {
        fsReadFileSyncStub.restore()
        if (consoleStub)
            consoleStub.restore()
    })

    it('should return the tag name inside of the generator-git-tag file', () => {
        fsReadFileSyncStub.returns('test-tag')
        const testProjectPath = 'test-project'
        const result = generator.readTagName(testProjectPath)
        expect(fsReadFileSyncStub.calledWith(`${testProjectPath}/generator-git-tag`)).to.be.true
        expect(result).to.equal('test-tag')
    })

    it('should return null if file read fails', () => {
        fsReadFileSyncStub.throws()
        consoleStub = sinon.stub(console, 'error')
        const testProjectPath = 'test-project'
        const result = generator.readTagName(testProjectPath)
        expect(fsReadFileSyncStub.calledWith(`${testProjectPath}/generator-git-tag`)).to.be.true
        expect(result).to.be.null
        expect(consoleStub.called).to.be.true
    })

    it('should return null with undefined, null or non string input', () => {
        returnsNullWithNullOrUndefined(generator.readTagName)
        returnsNullWithNonStringInput(generator.readTagName)
    })
})

describe('getCode', () => {
    let findFileStub
    let consoleStub
    let fsReadFileSyncStub

    beforeEach(() => {
        findFileStub = sinon.stub(generator, 'findFile')
        fsReadFileSyncStub = sinon.stub(fs, 'readFileSync')
    })

    afterEach(() => {
        findFileStub.restore()
        fsReadFileSyncStub.restore()
        if (consoleStub)
            consoleStub.restore()
    })

    it('should return null with undefined, null or non string input', () => {
        findFileStub.restore()
        returnsNullWithNullOrUndefined(generator.readTagName)
        returnsNullWithNonStringInput(generator.readTagName)
    })

    it('should return the contents of "index.js" file as string safe string', () => {
        const testCode = 'console.log("test")'
        fsReadFileSyncStub.returns(Buffer.from(testCode))
        findFileStub.returns('index.js')
        const result = generator.getCode('test-project')
        expect(fsReadFileSyncStub.calledOnce).to.be.true
        expect(findFileStub.calledOnce).to.be.true
        expect(findFileStub.calledWith('test-project')).to.be.true
        expect(result).to.equal(testCode.replace(/"/g, '\\"'))
    })

    it('should return null if file read fails', () => {
        fsReadFileSyncStub.throws()
        consoleStub = sinon.stub(console, 'error')
        findFileStub.returns('index.js')
        const result = generator.getCode('test-project')
        expect(fsReadFileSyncStub.threw()).to.be.true
        expect(findFileStub.calledOnce).to.be.true
        expect(findFileStub.calledWith('test-project')).to.be.true
        expect(result).to.be.null
        expect(consoleStub.called).to.be.true
        fsReadFileSyncStub.restore()
    })

    it('should return null if file is not found', () => {
        findFileStub.returns(null)
        const result = generator.getCode('test-project')
        expect(findFileStub.calledOnce).to.be.true
        expect(findFileStub.calledWith('test-project')).to.be.true
        expect(result).to.be.null
    })
})

describe('processProject', () => {
    let fsReadFileStub
    let findReadmeStub
    let processAssetsStub
    let readTagNameStub
    let getCodeStub

    beforeEach(() => {
        fsReadFileStub = sinon.stub(fs, 'readFile')
        findReadmeStub = sinon.stub(generator, 'findReadme')
        processAssetsStub = sinon.stub(generator, 'processAssets')
        readTagNameStub = sinon.stub(generator, 'readTagName')
        getCodeStub = sinon.stub(generator, 'getCode')
    })

    afterEach(() => {
        fsReadFileStub.restore()
        findReadmeStub.restore()
        processAssetsStub.restore()
        readTagNameStub.restore()
        getCodeStub.restore()
    })

    it('should resolve with project object', () => {
        const expectedOutput = {
            name: 'test_0000_project',
            prettyName: 'test readme',
            markdown: '<h1 id=\\"test-readme\\">test readme</h1>',
            index: 0,
            projectPath: 'test-0000-project',
            tagName: 'test-tag',
            code: 'console.log("test")'
        }
        fsReadFileStub.yields(null, Buffer.from('# test readme'))
        findReadmeStub.returns('test-project/readme.md')
        processAssetsStub.returns('# test readme')
        readTagNameStub.returns('test-tag')
        getCodeStub.returns('console.log("test")')

        return generator.processProject('test-0000-project', true)
            .then(result => {
                expect(fsReadFileStub.calledOnce).to.be.true
                expect(findReadmeStub.calledOnce).to.be.true
                expect(processAssetsStub.calledOnce).to.be.true
                expect(readTagNameStub.calledOnce).to.be.true
                expect(getCodeStub.calledOnce).to.be.true
                expect(result).to.deep.equal(expectedOutput)
            })
    })

    it('should reject with error', () => {
        const expectedOutput = 'error'
        fsReadFileStub.yields('error')
        findReadmeStub.returns('test-project/readme.md')
        processAssetsStub.returns('# test readme')
        readTagNameStub.returns('test-tag')
        getCodeStub.returns('console.log("test")')

        generator.processProject('test-project-00', true)
            .then(result => {
                throw 'Should not have succeeded: ' + result
            }, err => {
                expect(err).to.deep.equal(expectedOutput)
            })
    })

    it('should reject with error that Readme was not found', () => {
        const expectedOutput = 'Readme not found: test-project-00'
        fsReadFileStub.yields('error')
        findReadmeStub.returns(null)
        processAssetsStub.returns('# test readme')
        readTagNameStub.returns('test-tag')
        getCodeStub.returns('console.log("test")')

        return generator.processProject('test-project-00', true)
            .then(result => {
                throw 'Should not have succeeded: ' + result
            }, err => {
                expect(err).to.deep.equal(expectedOutput)
            })
    })
})

describe('processAssets', () => {
    let fsExistStub
    let fsReaddirStub
    let fsLstatStub
    let fsCopyFileStub

    beforeEach(() => {
        fsExistStub = sinon.stub(fs, 'existsSync')
        fsReaddirStub = sinon.stub(fs, 'readdirSync')
        fsLstatStub = sinon.stub(fs, 'lstatSync')
        fsCopyFileStub = sinon.stub(fs, 'copyFileSync')
    })

    afterEach(() => {
        fsExistStub.restore()
        fsReaddirStub.restore()
        fsLstatStub.restore()
        fsCopyFileStub.restore()
    })

    it('should replace "./assets/<asset name>" with siteImgFolder in the readme and call copyFileSync to copy the files', () => {
        const expectedOutput = '# Test project\n\n![Test image](/dev/master/assets/test_project-testImage.png)\n\n![Nice chart](/dev/master/assets/test_project-nice_chart.jpg)'
        const input = '# Test project\n\n![Test image](./assets/testImage.png)\n\n![Nice chart](./assets/nice_chart.jpg)'
        fsExistStub.returns(true)
        fsReaddirStub.returns(['testImage.png', 'nice_chart.jpg'])
        fsLstatStub.returns({ isFile: () => true })

        const result = generator.processAssets(input, 'test-project')

        expect(result).to.equal(expectedOutput)
        expect(fsCopyFileStub.calledTwice).to.be.true
        expect(fsCopyFileStub.calledWith(
            path.resolve('test-project', 'assets', 'testImage.png'),
            path.resolve('examples', 'assets', 'test_project-testImage.png'))
        ).to.be.true
        expect(fsCopyFileStub.calledWith(
            path.resolve('test-project', 'assets', 'nice_chart.jpg'),
            path.resolve('examples', 'assets', 'test_project-nice_chart.jpg'))
        ).to.be.true
    })

    it('should return same readme if project asset dir doesn\'t exist', () => {
        const expectedOutput = '# Test project\n\n'
        const input = '# Test project\n\n'
        fsExistStub.returns(false)

        const result = generator.processAssets(input, 'test-project')

        expect(result).to.equal(expectedOutput)
    })

    it('should return same readme if project has no assets', () => {
        const expectedOutput = '# Test project\n\n'
        const input = '# Test project\n\n'
        fsExistStub.returns(true)
        fsReaddirStub.returns()
        fsLstatStub.returns({ isFile: () => true })

        const result = generator.processAssets(input, 'test-project')

        expect(result).to.equal(expectedOutput)
        expect(fsCopyFileStub.called).to.not.be.true
    })
})

describe('generateDataJs', () => {
    it('should return string with all projects in variables and export getData function, sorted by index', () => {
        const expectedOutput = 'const Test_name_1 = {\n            name: "Test_name_1",\n            markdown: "<div>Yep</div>",\n            code:"console.log("hi")",\n            internalName: "Test_name_1",\n            externalLink: "http://localhost",\n            tags:[\'1\',\'2\'],\n            tagName:"1",\n            topics:[\'ex\',\'eg\']\n        }; \nconst Test_name_2 = {\n            name: "Test_name_2",\n            markdown: "<div>Yep 2</div>",\n            code:"console.log("hi 2")",\n            internalName: "Test_name_2",\n            externalLink: "http://localhost/2",\n            tags:[\'1\',\'2\'],\n            tagName:"2",\n            topics:[\'ex\',\'eg\']\n        }; \nmodule.exports = { getData: () => ({ Test_name_1,Test_name_2 }) }'
        const input = [
            {
                name: 'Test_name_1',
                markdown: '<div>Yep</div>',
                code: 'console.log("hi")',
                externalLink: 'http://localhost',
                tags: ['1', '2'],
                tagName: '1',
                topics: ['ex', 'eg'],
                index: 0
            },
            {
                name: 'Test_name_2',
                markdown: '<div>Yep 2</div>',
                code: 'console.log("hi 2")',
                externalLink: 'http://localhost/2',
                tags: ['1', '2'],
                tagName: '2',
                topics: ['ex', 'eg'],
                index: 1
            }
        ]

        const result = generator.generateDataJs(input)
        expect(result).to.equal(expectedOutput)
    })

    it('should return string with all projects with minimal data in input', () => {
        const expectedOutput = 'const Test_name_1 = {\n            name: "Test_name_1",\n            markdown: "<div>Yep</div>",\n            \n            internalName: "Test_name_1",\n            externalLink: "",\n            tags:[],\n            tagName:"",\n            topics:[]\n        }; \nconst Test_name_2 = {\n            name: "Test_name_2",\n            markdown: "<div>Yep 2</div>",\n            \n            internalName: "Test_name_2",\n            externalLink: "",\n            tags:[],\n            tagName:"",\n            topics:[]\n        }; \nmodule.exports = { getData: () => ({ Test_name_1,Test_name_2 }) }'
        const input = [
            {
                name: 'Test_name_1',
                markdown: '<div>Yep</div>'
            },
            {
                name: 'Test_name_2',
                markdown: '<div>Yep 2</div>'
            }
        ]

        const result = generator.generateDataJs(input)
        expect(result).to.equal(expectedOutput)
    })
})

describe('getExampleProjectDirs', () => {
    let fsReadDirStub
    let fsLstatSyncStub

    beforeEach(() => {
        fsReadDirStub = sinon.stub(fs, 'readdir')
        fsLstatSyncStub = sinon.stub(fs, 'lstatSync')
    })

    afterEach(() => {
        fsReadDirStub.restore()
        fsLstatSyncStub.restore()
    })

    it('should resolve directories inside of the "examples" directory', () => {
        fsReadDirStub.yields(null, ['test-example-1', 'test-example-2', 'test'])
        fsLstatSyncStub.returns({ isDirectory: () => true })
        fsLstatSyncStub.withArgs(path.resolve('examples', 'projects', 'test')).returns({ isDirectory: () => false })

        generator.getExampleProjectDirs()
            .then((result) => {
                expect(result).to.deep.equal([path.resolve('examples', 'projects', 'test-example-1'), path.resolve('examples', 'projects', 'test-example-2')])
            })
    })

    it('should reject with error if readdir fails', () => {
        fsReadDirStub.yields('error')
        fsLstatSyncStub.restore()

        return generator.getExampleProjectDirs()
            .then(result => {
                throw 'Should not have succeeded: ' + result
            }, err => {
                expect(err).to.equal('error')
            })
    })

    it('should resolve to empty array if the directory is empty or only has files', () => {
        fsReadDirStub.yields(null, [])
        fsLstatSyncStub.returns({ isDirectory: () => false })
        generator.getExampleProjectDirs()
            .then((result) => {
                expect(result).to.deep.equal([])
            })
    })
})

describe('writeDataJs', () => {
    let fsExistsSyncStub
    let fsMkdirSyncStub
    let fsWriteFileStub

    beforeEach(() => {
        fsExistsSyncStub = sinon.stub(fs, 'existsSync')
        fsWriteFileStub = sinon.stub(fs, 'writeFile')
    })

    afterEach(() => {
        fsExistsSyncStub.restore()
        fsWriteFileStub.restore()
        if (fsMkdirSyncStub)
            fsMkdirSyncStub.restore()
    })

    it('should resolve with nothing if it is successfull and write the contents to file', () => {
        fsExistsSyncStub.returns(true)
        fsWriteFileStub.yields()

        return generator.writeDataJs('test data js')
            .then((result) => {
                expect(result).to.be.undefined
                expect(fsWriteFileStub.calledOnce).to.be.true
                expect(fsWriteFileStub.args[0].includes('test data js')).to.be.true
            })
    })

    it('should reject with error if writeFile fails', () => {
        fsExistsSyncStub.returns(true)
        fsWriteFileStub.yields('error')

        return generator.writeDataJs('test data js')
            .then(result => {
                throw 'Should not have succeeded: ' + result
            }, err => {
                expect(err).to.equal('error')
                expect(fsWriteFileStub.calledOnce).to.be.true
            })
    })

    it('should create the directory if it doesn\'t exist', () => {
        fsExistsSyncStub.returns(false)
        fsMkdirSyncStub = sinon.stub(fs, 'mkdirSync')
        fsWriteFileStub.yields()

        return generator.writeDataJs('test data js')
            .then((result) => {
                expect(result).to.be.undefined
                expect(fsMkdirSyncStub.calledOnce).to.be.true
                expect(fsWriteFileStub.calledOnce).to.be.true
            })
    })
})

describe('augmentProjects', () => {
    it('should add repository data to the projects array', () => {
        const expectedOutput = [{
            name: 'test_project_1',
            externalLink: 'http://localhost/test-project-1',
            owner: 'Arction',
            repositoryName: 'test-project-1'
        }, {
            name: 'test_project_2',
            externalLink: 'http://localhost/test-project-2',
            owner: 'Arction',
            repositoryName: 'test-project-2'
        }]
        const inputGitProjects = [{
            repoUrl: 'http://localhost/test-project-1.git',
            htmlUrl: 'http://localhost/test-project-1',
            owner: 'Arction'
        }, {
            repoUrl: 'http://localhost/test-project-2.git',
            htmlUrl: 'http://localhost/test-project-2',
            owner: 'Arction'
        }]
        const inputProjects = [{
            name: 'test_project_1'
        }, {
            name: 'test_project_2'
        }]

        const gitFacade = new GitFacade.GitMock()

        const result = generator.augmentProjects(gitFacade, inputGitProjects, inputProjects)

        expect(result).to.deep.equal(expectedOutput)
    })

    it('should skip projects where no repository is found', () => {
        const expectedOutput = [{
            name: 'test_project_1',
            externalLink: 'http://localhost/test-project-1',
            owner: 'Arction',
            repositoryName: 'test-project-1'
        }, {
            name: 'test_project_2'
        }]
        const inputGitProjects = [{
            repoUrl: 'http://localhost/test-project-1.git',
            htmlUrl: 'http://localhost/test-project-1',
            owner: 'Arction'
        }]
        const inputProjects = [{
            name: 'test_project_1'
        }, {
            name: 'test_project_2'
        }]

        const gitFacade = new GitFacade.GitMock()

        const result = generator.augmentProjects(gitFacade, inputGitProjects, inputProjects)

        expect(result).to.deep.equal(expectedOutput)
    })

    it('project externalLink should link to tag if project has tagName property', () => {
        const expectedOutput = [{
            name: 'test_project_1',
            externalLink: 'http://localhost/test-project-1/tree/test',
            owner: 'Arction',
            repositoryName: 'test-project-1',
            tagName: 'test'
        }]
        const inputGitProjects = [{
            repoUrl: 'http://localhost/test-project-1.git',
            htmlUrl: 'http://localhost/test-project-1',
            owner: 'Arction'
        }]
        const inputProjects = [{
            name: 'test_project_1',
            tagName: 'test'
        }]

        const gitFacade = new GitFacade.GitMock()

        const result = generator.augmentProjects(gitFacade, inputGitProjects, inputProjects)

        expect(result).to.deep.equal(expectedOutput)
    })
})

describe('addTags', () => {
    let gulpGitExecStub
    beforeEach(() => {
        gulpGitExecStub = sinon.stub(gulpGit, 'exec')
    })

    afterEach(() => {
        gulpGitExecStub.restore()
    })

    it('should add tags from git repository to project objects', () => {
        gulpGitExecStub.yields(null, 'tag1\ntag2\n')
        gulpGitExecStub.onSecondCall().yields(null, 'tag3\ntag4\n')
        const expectedOutput = [{
            projectPath: 'test-project-1',
            tags: ['tag1', 'tag2']
        }, {
            projectPath: 'test-project-2',
            tags: ['tag3', 'tag4']
        }]
        const input = [{
            projectPath: 'test-project-1'
        }, {
            projectPath: 'test-project-2'
        }]

        return generator.addTags(input)
            .then(result => {
                expect(result).to.deep.equal(expectedOutput)
            })
    })

    it('should reject with error if gulpGit exec fails on any of the projects', () => {
        gulpGitExecStub.onFirstCall().yields(null, 'success')
        gulpGitExecStub.onSecondCall().yields('error')
        const input = [{
            projectPath: 'test-project-1'
        }, {
            projectPath: 'test-project-2'
        }]

        return generator.addTags(input)
            .then(result => {
                throw 'Should not have succeeded: ' + result
            }, err => {
                expect(err).to.equal('error')
            })
    })

    it('should skip project if no project path defined', () => {
        gulpGitExecStub.yields(null, 'tag1\ntag2\n')
        gulpGitExecStub.onSecondCall().yields(null, 'tag3\ntag4\n')
        const expectedOutput = [{
            name: 'test-project-1',
            tags: []
        }, {
            projectPath: 'test-project-2',
            tags: ['tag1', 'tag2']
        }]
        const input = [{
            name: 'test-project-1'
        }, {
            projectPath: 'test-project-2'
        }]

        return generator.addTags(input)
            .then(result => {
                expect(result).to.deep.equal(expectedOutput)
            })
    })
})

describe('addTopics', () => {
    let getTopicsStub

    beforeEach(() => {
        getTopicsStub = sinon.stub(GitFacade.GitMock.prototype, 'getTopics')
    })
    afterEach(() => {
        getTopicsStub.restore()
    })

    it('should add topics to project objects', () => {
        const gitFacade = new GitFacade.GitMock()
        getTopicsStub.restore()
        const input = [{
            owner: 'Arction',
            repositoryName: 'test-project-1'
        }, {
            owner: 'Arction',
            repositoryName: 'test-project-2'
        }]

        const addTopics = generator.addTopics(gitFacade)
        return addTopics(input)
            .then(result => {
                expect(result.length).to.equal(2)
                expect(result[0].topics.length).to.be.greaterThan(0)
                expect(typeof result[0].topics[0]).to.equal('string')
                expect(result[1].topics.length).to.be.greaterThan(0)
            })
    })

    it('should reject with error if getTopics fails', () => {
        const gitFacade = new GitFacade.GitMock()
        getTopicsStub.rejects('error')
        const input = [{
            owner: 'Arction',
            repositoryName: 'test-project-1'
        }, {
            owner: 'Arction',
            repositoryName: 'test-project-2'
        }]

        const addTopics = generator.addTopics(gitFacade)
        return addTopics(input)
            .then((result) => {
                throw 'Should not have succeeeded: ' + result
            })
            .catch(err => {
                expect(err).to.exist
            })
    })
})

describe('addDefaultPage', () => {
    let fsExistsSyncStub
    let fsReadFileStub

    beforeEach(() => {
        fsExistsSyncStub = sinon.stub(fs, 'existsSync')
        fsReadFileStub = sinon.stub(fs, 'readFile')
    })

    afterEach(() => {
        fsExistsSyncStub.restore()
        fsReadFileStub.restore()
    })

    it('should add index page to the projects array', () => {
        fsExistsSyncStub.returns(true)
        fsReadFileStub.yields(null, new Buffer(''))

        const input = [{
            name: 'test_item_1'
        }, {
            name: 'test_item_2'
        }]

        const expectedOutput = [{
            name: 'test_item_1'
        }, {
            name: 'test_item_2'
        }, {
            name: 'index',
            index: 10000,
            internalName: 'index',
            externalLink: '',
            markdown: ''
        }]

        return generator.addDefaultPage(input)
            .then(result => {
                expect(result).to.deep.equal(expectedOutput)
            })
    })

    it('should skip adding index if the file is not found', () => {
        fsExistsSyncStub.returns(false)
        fsReadFileStub.yields(null, new Buffer(''))

        const input = [{
            name: 'test_item_1'
        }, {
            name: 'test_item_2'
        }]

        const expectedOutput = [{
            name: 'test_item_1'
        }, {
            name: 'test_item_2'
        }]

        return generator.addDefaultPage(input)
            .then(result => {
                expect(result).to.deep.equal(expectedOutput)
            })
    })

    it('should reject with error if readFile returns error', () => {
        fsExistsSyncStub.returns(true)
        fsReadFileStub.yields('error')

        const input = [{
            name: 'test_item_1'
        }, {
            name: 'test_item_2'
        }]

        return generator.addDefaultPage(input)
            .then(result => {
                throw 'Should not have succeeded: ' + result
            }, err => {
                expect(err).to.equal('error')
            })
    })
})
