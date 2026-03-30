import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { getRunnerForSuite, SUITES } from './testdata'
import GenerateCtrfReport, { mergeResults } from '../src'
import * as fs from 'fs'
import { type CtrfReporterConfigOptions } from '../src/reporter'

const mockOptions: CtrfReporterConfigOptions = {
  logFile: 'ctrf-report.log', // only used in vitest
}
let tmpReporter: GenerateCtrfReport

beforeAll(() => {
  fs.rmSync('ctrf', { recursive: true, force: true })
})

describe('Reporter output', () => {
  test('! Passed tests in suite', async () => {
    const suite = Object.values(SUITES)[0]
    tmpReporter = new GenerateCtrfReport(mockOptions)
    tmpReporter.onRunnerStart(getRunnerForSuite(suite))
    tmpReporter.onSuiteStart(suite as any)
    tmpReporter.onTestStart(suite.tests[0] as any)
    tmpReporter.onTestStart(suite.tests[1] as any)
    tmpReporter.onTestEnd(suite.tests[0] as any)
    tmpReporter.onTestEnd(suite.tests[1] as any)
    tmpReporter.onSuiteEnd(suite as any)
    tmpReporter.onRunnerEnd(getRunnerForSuite(suite))
    expect(tmpReporter.ctrfReport.results).toMatchObject({
      summary: {
        failed: 0,
        other: 0,
        passed: 2,
        pending: 0,
        skipped: 0,
        start: expect.any(Number),
        stop: expect.any(Number),
        tests: 2,
      },
      tests: [
        {
          browser: 'chrome',
          duration: undefined,
          filePath: suite.file,
          flaky: false,
          message: undefined,
          name: suite.tests[0].title,
          rawStatus: 'passed',
          retries: 0,
          start: expect.any(Number),
          status: 'passed',
          stop: 0,
          suite: suite.fullTitle,
          trace: undefined,
          type: 'e2e',
        },
        {
          browser: 'chrome',
          duration: undefined,
          filePath: suite.file,
          flaky: false,
          message: undefined,
          name: suite.tests[1].title,
          rawStatus: 'passed',
          retries: 0,
          start: expect.any(Number),
          status: 'passed',
          stop: 0,
          suite: suite.fullTitle,
          trace: undefined,
          type: 'e2e',
        },
      ],
      tool: {
        name: 'webdriverio',
      },
    })
  })

  test('! Skipped test in suite', () => {
    const suite = SUITES.suite_1passed_1skipped
    tmpReporter = new GenerateCtrfReport(mockOptions)
    tmpReporter.onTestStart(suite as any)
    tmpReporter.onRunnerStart(getRunnerForSuite(suite))
    tmpReporter.onSuiteStart(suite as any)
    tmpReporter.onTestStart(suite.tests[0] as any)
    tmpReporter.onTestStart(suite.tests[1] as any)
    tmpReporter.onTestEnd(suite.tests[0] as any)
    tmpReporter.onTestEnd(suite.tests[1] as any)
    tmpReporter.onSuiteEnd(suite as any)
    tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

    expect(tmpReporter.ctrfReport.results).toMatchObject({
      summary: {
        failed: 0,
        other: 0,
        passed: 1,
        pending: 0,
        skipped: 1,
        start: expect.any(Number),
        stop: expect.any(Number),
        tests: 2,
      },
      tests: [
        {
          browser: 'chrome',
          duration: undefined,
          filePath: suite.file,
          flaky: false,
          message: undefined,
          name: suite.tests[0].title,
          rawStatus: 'passed',
          retries: 0,
          start: 1753042662,
          status: 'passed',
          stop: 0,
          suite: suite.fullTitle,
          trace: undefined,
          type: 'e2e',
        },
        {
          browser: 'chrome',
          duration: undefined,
          filePath: suite.file,
          flaky: false,
          message: undefined,
          name: suite.tests[1].title,
          rawStatus: 'skipped',
          retries: 0,
          start: 1753042662,
          status: 'skipped',
          stop: 0,
          suite: suite.fullTitle,
          trace: undefined,
          type: 'e2e',
        },
      ],
      tool: {
        name: 'webdriverio',
      },
    })
  })

  test('! Failed test in suite', () => {
    const suite = SUITES.suite_1passed_1failed
    tmpReporter = new GenerateCtrfReport(mockOptions)
    tmpReporter.onTestStart(suite as any)
    tmpReporter.onRunnerStart(getRunnerForSuite(suite))
    tmpReporter.onSuiteStart(suite as any)
    tmpReporter.onTestStart(suite.tests[0] as any)
    tmpReporter.onTestStart(suite.tests[1] as any)
    tmpReporter.onTestEnd(suite.tests[0] as any)
    tmpReporter.onTestEnd(suite.tests[1] as any)
    tmpReporter.onSuiteEnd(suite as any)
    tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

    expect(tmpReporter.ctrfReport.results).toMatchObject({
      summary: {
        failed: 1,
        other: 0,
        passed: 1,
        pending: 0,
        skipped: 0,
        start: expect.any(Number),
        stop: expect.any(Number),
        tests: 2,
      },
      tests: [
        {
          browser: 'chrome',
          duration: undefined,
          filePath: suite.file,
          flaky: false,
          message: undefined,
          name: suite.tests[0].title,
          rawStatus: 'passed',
          retries: 0,
          start: 1753042662,
          status: 'passed',
          stop: 0,
          suite: suite.fullTitle,
          trace: undefined,
          type: 'e2e',
        },
        {
          browser: 'chrome',
          duration: undefined,
          filePath: suite.file,
          flaky: false,
          message: suite.tests[1].error?.message,
          name: suite.tests[1].title,
          rawStatus: 'failed',
          retries: 0,
          start: 1753042662,
          status: 'failed',
          stop: 0,
          suite: suite.fullTitle,
          trace: suite.tests[1].error?.stack,
          type: 'e2e',
        },
      ],
      tool: {
        name: 'webdriverio',
      },
    })
  })

  test('! Failed test with retries in suite', () => {
    const suite = SUITES.suite_1failed_withRetries
    tmpReporter = new GenerateCtrfReport(mockOptions)
    tmpReporter.onTestStart(suite as any)
    tmpReporter.onRunnerStart(getRunnerForSuite(suite))
    tmpReporter.onSuiteStart(suite as any)
    tmpReporter.onTestStart(suite.tests[0] as any)
    tmpReporter.onTestEnd(suite.tests[0] as any)
    tmpReporter.onSuiteEnd(suite as any)
    tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

    expect(tmpReporter.ctrfReport.results).toMatchObject({
      summary: {
        failed: 1,
        other: 0,
        passed: 0,
        pending: 0,
        skipped: 0,
        start: expect.any(Number),
        stop: expect.any(Number),
        tests: 1,
      },
      tests: [
        {
          browser: 'chrome',
          duration: undefined,
          filePath: suite.file,
          flaky: false,
          message: suite.tests[0].error?.message,
          name: suite.tests[0].title,
          rawStatus: 'failed',
          retries: suite.tests[0].retries,
          start: 1753042662,
          status: 'failed',
          stop: 0,
          suite: suite.fullTitle,
          trace: suite.tests[0].error?.stack,
          type: 'e2e',
        },
      ],
      tool: {
        name: 'webdriverio',
      },
    })
  })

  test('! Passed test with retries in suite', () => {
    const suite = SUITES.suite_1passed_withRetries
    tmpReporter = new GenerateCtrfReport(mockOptions)
    tmpReporter.onTestStart(suite as any)
    tmpReporter.onRunnerStart(getRunnerForSuite(suite))
    tmpReporter.onSuiteStart(suite as any)
    tmpReporter.onTestStart(suite.tests[0] as any)
    tmpReporter.onTestEnd(suite.tests[0] as any)
    tmpReporter.onSuiteEnd(suite as any)
    tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

    expect(tmpReporter.ctrfReport.results).toMatchObject({
      summary: {
        failed: 0,
        other: 0,
        passed: 1,
        pending: 0,
        skipped: 0,
        start: expect.any(Number),
        stop: expect.any(Number),
        tests: 1,
      },
      tests: [
        {
          browser: 'chrome',
          duration: undefined,
          filePath: suite.file,
          flaky: true,
          message: undefined,
          name: suite.tests[0].title,
          rawStatus: 'passed',
          retries: suite.tests[0].retries,
          start: 1753042662,
          status: 'passed',
          stop: 0,
          suite: suite.fullTitle,
          trace: undefined,
          type: 'e2e',
        },
      ],
      tool: {
        name: 'webdriverio',
      },
    })
  })

  describe('! Test-level retries (WDIO native)', () => {
    const testRetryDir = 'ctrf-test-level-retry'
    const suite = { ...SUITES.suite_1passed_1failed }
    suite.file = 'test-level-retries.e2e.js'
    const test0 = suite.tests[0]
    const test1 = suite.tests[1]

    beforeEach(() => {
      fs.rmSync(testRetryDir, { recursive: true, force: true })
      tmpReporter = new GenerateCtrfReport({
        ...mockOptions,
        outputDir: testRetryDir,
      })
    })

    afterAll(() => {
      fs.rmSync(testRetryDir, { recursive: true, force: true })
    })

    test('failed test with no retries', () => {
      tmpReporter.onRunnerStart(getRunnerForSuite(suite))
      tmpReporter.onSuiteStart(suite as any)
      tmpReporter.onTestStart(test0 as any)
      tmpReporter.onTestEnd(test0 as any)
      tmpReporter.onTestStart(test1 as any)
      tmpReporter.onTestEnd(test1 as any)
      tmpReporter.onSuiteEnd(suite as any)
      tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

      expect(tmpReporter.ctrfReport.results.summary).toMatchObject({
        failed: 1,
        passed: 1,
        tests: 2,
      })

      expect(tmpReporter.ctrfReport.results.tests[1]).toMatchObject({
        name: test1.title,
        status: 'failed',
        retries: 0,
        flaky: false,
      })
    })

    test('failed test after retries - retries from WDIO stats', () => {
      const test1WithRetries = { ...test1, retries: 2 }

      tmpReporter.onRunnerStart(getRunnerForSuite(suite))
      tmpReporter.onSuiteStart(suite as any)
      tmpReporter.onTestStart(test0 as any)
      tmpReporter.onTestEnd(test0 as any)
      tmpReporter.onTestStart(test1WithRetries as any)
      tmpReporter.onTestEnd(test1WithRetries as any)
      tmpReporter.onSuiteEnd(suite as any)
      tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

      expect(tmpReporter.ctrfReport.results.summary).toMatchObject({
        failed: 1,
        passed: 1,
        tests: 2,
      })

      expect(tmpReporter.ctrfReport.results.tests[1]).toMatchObject({
        name: test1.title,
        status: 'failed',
        retries: 2,
        flaky: false,
      })
    })

    test('passed test after retries - marked as flaky', () => {
      const test1Passed = {
        ...test1,
        state: 'passed',
        error: undefined,
        retries: 1,
      }

      tmpReporter.onRunnerStart(getRunnerForSuite(suite))
      tmpReporter.onSuiteStart(suite as any)
      tmpReporter.onTestStart(test0 as any)
      tmpReporter.onTestEnd(test0 as any)
      tmpReporter.onTestStart(test1Passed as any)
      tmpReporter.onTestEnd(test1Passed as any)
      tmpReporter.onSuiteEnd(suite as any)
      tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

      expect(tmpReporter.ctrfReport.results.summary).toMatchObject({
        failed: 0,
        passed: 2,
        tests: 2,
      })

      expect(tmpReporter.ctrfReport.results.tests[1]).toMatchObject({
        name: test1.title,
        status: 'passed',
        retries: 1,
        flaky: true,
      })
    })
  })

  describe('! Spec file retries (specFileRetries) via merge', () => {
    const specRetryDir = 'ctrf-spec-retry-test'
    const suite = { ...SUITES.suite_1passed_1failed }
    suite.file = 'spec-retry.e2e.js'
    const test0 = suite.tests[0]
    const test1 = suite.tests[1]

    let runIndex = 0
    function runSpec(
      dir: string,
      specSuite: typeof suite,
      tests: any[]
    ) {
      const reporter = new GenerateCtrfReport({
        ...mockOptions,
        outputDir: dir,
      })
      reporter.onRunnerStart(getRunnerForSuite(specSuite))
      reporter.ctrfReport.results.summary.start = 1000 + runIndex++
      reporter.onSuiteStart(specSuite as any)
      for (const t of tests) {
        reporter.onTestStart(t as any)
        reporter.onTestEnd(t as any)
      }
      reporter.onSuiteEnd(specSuite as any)
      reporter.onRunnerEnd(getRunnerForSuite(specSuite))
    }

    beforeEach(() => {
      fs.rmSync(specRetryDir, { recursive: true, force: true })
    })

    afterAll(() => {
      fs.rmSync(specRetryDir, { recursive: true, force: true })
    })

    test('fail → fail → pass: flaky detected with retries=2', async () => {
      const test1Fixed = { ...test1, state: 'passed', error: undefined }

      runSpec(specRetryDir, suite, [test0, test1])
      runSpec(specRetryDir, suite, [test0, test1])
      runSpec(specRetryDir, suite, [test0, test1Fixed])

      const merged = await mergeResults(specRetryDir)
      expect(merged).toBeDefined()
      expect(merged!.results.tests).toHaveLength(2)

      const mergedTest1 = merged!.results.tests.find(
        (t) => t.name === test1.title
      )
      expect(mergedTest1).toMatchObject({
        status: 'passed',
        retries: 2,
        flaky: true,
      })

      expect(merged!.results.summary).toMatchObject({
        tests: 2,
        passed: 2,
        failed: 0,
      })
    })

    test('fail → pass: single retry, flaky detected', async () => {
      const test1Fixed = { ...test1, state: 'passed', error: undefined }

      runSpec(specRetryDir, suite, [test0, test1])
      runSpec(specRetryDir, suite, [test0, test1Fixed])

      const merged = await mergeResults(specRetryDir)
      expect(merged!.results.tests).toHaveLength(2)

      const mergedTest1 = merged!.results.tests.find(
        (t) => t.name === test1.title
      )
      expect(mergedTest1).toMatchObject({
        status: 'passed',
        retries: 1,
        flaky: true,
      })
    })

    test('fail → fail → fail: all retries exhausted, not flaky', async () => {
      runSpec(specRetryDir, suite, [test0, test1])
      runSpec(specRetryDir, suite, [test0, test1])
      runSpec(specRetryDir, suite, [test0, test1])

      const merged = await mergeResults(specRetryDir)
      expect(merged!.results.tests).toHaveLength(2)

      const mergedTest1 = merged!.results.tests.find(
        (t) => t.name === test1.title
      )
      expect(mergedTest1).toMatchObject({
        status: 'failed',
        retries: 2,
        flaky: false,
      })

      expect(merged!.results.summary).toMatchObject({
        tests: 2,
        passed: 1,
        failed: 1,
      })
    })

    test('single run, no retries: tests unchanged', async () => {
      runSpec(specRetryDir, suite, [test0, test1])

      const merged = await mergeResults(specRetryDir)
      expect(merged!.results.tests).toHaveLength(2)

      const mergedTest0 = merged!.results.tests.find(
        (t) => t.name === test0.title
      )
      const mergedTest1 = merged!.results.tests.find(
        (t) => t.name === test1.title
      )
      expect(mergedTest0).toMatchObject({
        status: 'passed',
        retries: 0,
        flaky: false,
      })
      expect(mergedTest1).toMatchObject({
        status: 'failed',
        retries: 0,
        flaky: false,
      })
    })

    test('multiple different specs merged together', async () => {
      const suite2 = { ...SUITES.suite_2passed }
      suite2.file = 'spec-retry-other.e2e.js'
      const s2test0 = suite2.tests[0]
      const s2test1 = suite2.tests[1]

      // Spec 1: fails then passes (retried)
      const test1Fixed = { ...test1, state: 'passed', error: undefined }
      runSpec(specRetryDir, suite, [test0, test1])
      runSpec(specRetryDir, suite, [test0, test1Fixed])

      // Spec 2: passes first time (no retry)
      runSpec(specRetryDir, suite2, [s2test0, s2test1])

      const merged = await mergeResults(specRetryDir)

      // 2 tests from spec1 + 2 from spec2 = 4 unique tests
      expect(merged!.results.tests).toHaveLength(4)

      // Spec 1 tests have retries
      const mergedTest1 = merged!.results.tests.find(
        (t) => t.name === test1.title
      )
      expect(mergedTest1).toMatchObject({
        status: 'passed',
        retries: 1,
        flaky: true,
      })

      // Spec 2 tests have no retries
      const mergedS2Test0 = merged!.results.tests.find(
        (t) => t.name === s2test0.title
      )
      expect(mergedS2Test0).toMatchObject({
        status: 'passed',
        retries: 0,
        flaky: false,
      })

      expect(merged!.results.summary).toMatchObject({
        tests: 4,
        passed: 4,
        failed: 0,
      })
    })

    test('pass → fail: test regresses on retry, not flaky', async () => {
      // Run 1: both tests pass
      const test1Passing = { ...test1, state: 'passed', error: undefined }
      runSpec(specRetryDir, suite, [test0, test1Passing])

      // Run 2: test1 now fails (regression during retry caused by another test)
      runSpec(specRetryDir, suite, [test0, test1])

      const merged = await mergeResults(specRetryDir)
      expect(merged!.results.tests).toHaveLength(2)

      const mergedTest1 = merged!.results.tests.find(
        (t) => t.name === test1.title
      )
      expect(mergedTest1).toMatchObject({
        status: 'failed',
        retries: 1,
        flaky: false,
      })
    })

    test('test-level retries combined with spec file retries', async () => {
      // Run 1: test1 fails after 2 test-level retries
      const test1WithRetries = { ...test1, retries: 2 }
      runSpec(specRetryDir, suite, [test0, test1WithRetries])

      // Run 2 (spec retry): test1 passes after 1 test-level retry
      const test1PassedWithRetry = {
        ...test1,
        state: 'passed',
        error: undefined,
        retries: 1,
      }
      runSpec(specRetryDir, suite, [test0, test1PassedWithRetry])

      const merged = await mergeResults(specRetryDir)
      expect(merged!.results.tests).toHaveLength(2)

      const mergedTest1 = merged!.results.tests.find(
        (t) => t.name === test1.title
      )
      // 1 spec retry + 1 test-level retry from final run = 2
      expect(mergedTest1).toMatchObject({
        status: 'passed',
        retries: 2,
        flaky: true,
      })
    })

    test('same test name in different spec files stays separate', async () => {
      // Two specs with a test named identically but different filePaths
      const suiteA = { ...suite }
      suiteA.file = 'spec-a.e2e.js'
      const suiteB = {
        ...SUITES.suite_2passed,
        file: 'spec-b.e2e.js',
        tests: [
          { ...test0 },
          { ...test1, state: 'passed', error: undefined },
        ],
      }

      // Spec A: test1 fails
      runSpec(specRetryDir, suiteA, [test0, test1])

      // Spec B: same test name passes
      runSpec(specRetryDir, suiteB as any, [
        suiteB.tests[0],
        suiteB.tests[1],
      ])

      const merged = await mergeResults(specRetryDir)

      // 4 tests: 2 from spec-a + 2 from spec-b (not merged together)
      expect(merged!.results.tests).toHaveLength(4)

      // test1 from spec-a is failed
      const test1A = merged!.results.tests.find(
        (t) => t.name === test1.title && t.filePath === 'spec-a.e2e.js'
      )
      expect(test1A).toMatchObject({
        status: 'failed',
        retries: 0,
      })

      // test1 from spec-b is passed (same name, different file)
      const test1B = merged!.results.tests.find(
        (t) => t.name === test1.title && t.filePath === 'spec-b.e2e.js'
      )
      expect(test1B).toMatchObject({
        status: 'passed',
        retries: 0,
      })
    })

    test('writes unique files per retry (not overwritten)', async () => {
      runSpec(specRetryDir, suite, [test0, test1])
      runSpec(specRetryDir, suite, [test0, test1])
      runSpec(specRetryDir, suite, [test0, test1])

      const files = fs
        .readdirSync(specRetryDir)
        .filter((f) => f.endsWith('.json'))
      expect(files.length).toBe(3)
    })
  })
})

describe('Hook error handling', () => {
  test('failed hook is reported as a failed test', () => {
    const suite = SUITES.suite_with_failed_hook
    tmpReporter = new GenerateCtrfReport(mockOptions)
    tmpReporter.onRunnerStart(getRunnerForSuite(suite))
    tmpReporter.onSuiteStart(suite as any)
    tmpReporter.onHookEnd(suite.hooks[0] as any)
    tmpReporter.onTestStart(suite.tests[0] as any)
    tmpReporter.onTestEnd(suite.tests[0] as any)
    tmpReporter.onSuiteEnd(suite as any)
    tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

    expect(tmpReporter.ctrfReport.results.summary).toMatchObject({
      tests: 2,
      failed: 1,
      passed: 1,
    })

    expect(tmpReporter.ctrfReport.results.tests[0]).toMatchObject({
      name: suite.hooks[0].title,
      status: 'failed',
      duration: 12,
      message: 'Hook setup failed',
      trace: 'Error: Hook setup failed\n    at Context.<anonymous>',
      rawStatus: 'failed',
      suite: suite.fullTitle,
      filePath: suite.file,
      browser: 'chrome',
    })
  })

  test('passing hook is not reported', () => {
    const suite = SUITES.suite_with_passing_hook
    tmpReporter = new GenerateCtrfReport(mockOptions)
    tmpReporter.onRunnerStart(getRunnerForSuite(suite))
    tmpReporter.onSuiteStart(suite as any)
    tmpReporter.onHookEnd(suite.hooks[0] as any)
    tmpReporter.onTestStart(suite.tests[0] as any)
    tmpReporter.onTestEnd(suite.tests[0] as any)
    tmpReporter.onSuiteEnd(suite as any)
    tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

    expect(tmpReporter.ctrfReport.results.summary).toMatchObject({
      tests: 1,
      passed: 1,
      failed: 0,
    })

    expect(tmpReporter.ctrfReport.results.tests).toHaveLength(1)
    expect(tmpReporter.ctrfReport.results.tests[0]).toMatchObject({
      name: suite.tests[0].title,
      status: 'passed',
    })
  })
})

describe('mergeResults edge cases', () => {
  test('returns undefined for non-existent directory', async () => {
    const result = await mergeResults('non-existent-dir-12345')
    expect(result).toBeUndefined()
  })

  test('returns undefined for empty directory', async () => {
    const emptyDir = 'ctrf-empty-test'
    fs.mkdirSync(emptyDir, { recursive: true })

    const result = await mergeResults(emptyDir)
    expect(result).toBeUndefined()

    fs.rmSync(emptyDir, { recursive: true, force: true })
  })

  test('excludes merged output file from re-read', async () => {
    const dir = 'ctrf-exclude-test'
    fs.rmSync(dir, { recursive: true, force: true })

    // Write a single report file
    const suite = SUITES.suite_2passed
    suite.file = 'exclude-test.e2e.js'
    const reporter = new GenerateCtrfReport({
      ...mockOptions,
      outputDir: dir,
    })
    reporter.onRunnerStart(getRunnerForSuite(suite))
    reporter.onSuiteStart(suite as any)
    reporter.onTestStart(suite.tests[0] as any)
    reporter.onTestEnd(suite.tests[0] as any)
    reporter.onTestStart(suite.tests[1] as any)
    reporter.onTestEnd(suite.tests[1] as any)
    reporter.onSuiteEnd(suite as any)
    reporter.onRunnerEnd(getRunnerForSuite(suite))

    // First merge - creates ctrf-report.json
    const first = await mergeResults(dir)
    expect(first).toBeDefined()
    expect(first!.results.tests).toHaveLength(2)

    // Second merge - should NOT include ctrf-report.json as input
    const second = await mergeResults(dir)
    expect(second).toBeDefined()
    expect(second!.results.tests).toHaveLength(2)

    fs.rmSync(dir, { recursive: true, force: true })
  })
})

describe('Reporter params', () => {
  test('all params + capabilities', () => {
    const suite = SUITES.suite_2passed
    suite.file = 'fullParams.test.ts'
    const input = {
      appName: 'testApp',
      appVersion: '1.0.0',
      buildUrl: 'http://example.com',
      buildNumber: '100',
      buildName: 'test build',
      osPlatform: 'darwin',
      osVersion: '10.15.7',
      osRelease: 'latest',
    }
    const runner = getRunnerForSuite(suite)
    const outputDir = 'ctrfCustom'
    const tmpReporter = new GenerateCtrfReport({
      ...input,
      ...mockOptions,
      outputDir,
    })
    tmpReporter.onRunnerStart(runner)
    tmpReporter.onSuiteStart(suite as any)
    tmpReporter.onTestEnd(suite.tests[0] as any)
    tmpReporter.onTestEnd(suite.tests[1] as any)
    tmpReporter.onRunnerEnd(runner)

    expect(tmpReporter.ctrfReport.results.environment).toMatchObject({
      ...input,
      extra: { browserName: runner.capabilities.browserName },
    })
    expect(fs.existsSync(outputDir)).toBe(true)
    fs.rmSync(outputDir, { recursive: true, force: true })
  })

  test('minimal', () => {
    const suite = SUITES.suite_2passed
    suite.file = 'minParams.test.ts'

    tmpReporter = new GenerateCtrfReport({ ...mockOptions, minimal: true })
    tmpReporter.onRunnerStart(getRunnerForSuite(suite))
    tmpReporter.onSuiteStart(suite as any)
    tmpReporter.onTestStart(suite.tests[0] as any)
    tmpReporter.onTestEnd(suite.tests[0] as any)
    tmpReporter.onTestStart(suite.tests[1] as any)
    tmpReporter.onTestEnd(suite.tests[1] as any)
    tmpReporter.onSuiteEnd(suite as any)
    tmpReporter.onRunnerEnd(getRunnerForSuite(suite))

    expect(tmpReporter.ctrfReport.results.tests).toMatchObject([
      {
        duration: undefined,
        name: 's1t1 - passed',
        status: 'passed',
      },
      {
        duration: undefined,
        name: 's2t2 - passed',
        status: 'passed',
      },
    ])
  })
})
