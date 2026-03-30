import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
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

    beforeAll(() => {
      fs.rmSync(specRetryDir, { recursive: true, force: true })
    })

    let runIndex = 0
    function runSuite(tests: { test0: any; test1: any }) {
      const reporter = new GenerateCtrfReport({
        ...mockOptions,
        outputDir: specRetryDir,
      })
      reporter.onRunnerStart(getRunnerForSuite(suite))
      // Set a distinct start time so merge can order runs chronologically
      reporter.ctrfReport.results.summary.start = 1000 + runIndex++
      reporter.onSuiteStart(suite as any)
      reporter.onTestStart(tests.test0 as any)
      reporter.onTestEnd(tests.test0 as any)
      reporter.onTestStart(tests.test1 as any)
      reporter.onTestEnd(tests.test1 as any)
      reporter.onSuiteEnd(suite as any)
      reporter.onRunnerEnd(getRunnerForSuite(suite))
    }

    test('writes unique files per retry and merge computes retries/flaky', async () => {
      // Run 1: test1 fails
      runSuite({ test0, test1 })

      // Run 2: test1 fails again (spec retry)
      runSuite({ test0, test1 })

      // Run 3: test1 passes (spec retry)
      const test1Fixed = { ...test1, state: 'passed', error: undefined }
      runSuite({ test0, test1: test1Fixed })

      // Verify 3 separate files were written (not overwritten)
      const files = fs.readdirSync(specRetryDir).filter((f) => f.endsWith('.json'))
      expect(files.length).toBe(3)

      // Merge and verify retries/flaky computed correctly
      const merged = await mergeResults(specRetryDir)
      expect(merged).toBeDefined()

      // Should have 2 unique tests (test0 and test1), not 6
      expect(merged!.results.tests).toHaveLength(2)

      const mergedTest0 = merged!.results.tests.find(
        (t) => t.name === test0.title
      )
      const mergedTest1 = merged!.results.tests.find(
        (t) => t.name === test1.title
      )

      // test0 passed all 3 times - retries=2 (3 runs - 1), not flaky
      expect(mergedTest0).toMatchObject({
        name: test0.title,
        status: 'passed',
        retries: 2,
        flaky: false,
      })

      // test1 failed twice then passed - retries=2, flaky=true
      expect(mergedTest1).toMatchObject({
        name: test1.title,
        status: 'passed',
        retries: 2,
        flaky: true,
      })

      expect(merged!.results.summary).toMatchObject({
        tests: 2,
        passed: 2,
        failed: 0,
      })

      // Cleanup
      fs.rmSync(specRetryDir, { recursive: true, force: true })
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
