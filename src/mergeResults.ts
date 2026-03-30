import { readdir, writeFile, readFile } from 'node:fs/promises'
import { join, resolve } from 'path'
import { existsSync } from 'fs'
import {
  type CTRFReport,
  type Test,
  type Summary,
  generateReportId,
  parse,
} from 'ctrf'

const DEFAULT_MERGED_FILENAME = 'ctrf-report.json'
const DEFAULT_FILE_PATTERN = /^ctrf-.*\.json$/

/**
 * Merges all CTRF report files in a directory, computing retries and flaky
 * status from duplicate test entries across spec file retries.
 *
 * When WDIO uses specFileRetries, each retry produces a separate report file.
 * This function groups tests by name + filePath, keeps the final run's result,
 * and computes retries/flaky from the run history.
 *
 * @param dir - Directory containing CTRF report files.
 * @param filePattern - Regex pattern to match report files.
 * @param outputFileName - Name for the merged output file.
 * @returns The merged CTRF report object, or undefined if no reports found.
 */
export async function mergeResults(
  dir: string,
  filePattern: RegExp = DEFAULT_FILE_PATTERN,
  outputFileName: string = DEFAULT_MERGED_FILENAME
): Promise<CTRFReport | undefined> {
  const reports = await readReports(dir, filePattern, outputFileName)
  if (reports.length === 0) {
    return undefined
  }

  const merged = mergeReportsWithRetries(reports)

  const filePath = join(dir, outputFileName)
  await writeFile(filePath, JSON.stringify(merged, null, 2), 'utf8')

  return merged
}

/**
 * Reads all CTRF report files in a directory matching a pattern.
 */
async function readReports(
  dir: string,
  filePattern: RegExp,
  outputFileName: string
): Promise<CTRFReport[]> {
  const directoryPath = resolve(dir)
  if (!existsSync(directoryPath)) {
    console.log(`CTRF: Directory '${directoryPath}' does not exist.`)
    return []
  }

  const fileNames = (await readdir(dir))
    .filter((file) => filePattern.test(file) && file !== outputFileName)
    .sort()

  const reports: CTRFReport[] = []
  for (const file of fileNames) {
    try {
      const content = await readFile(join(dir, file), 'utf8')
      reports.push(parse(content))
    } catch (error) {
      console.warn(`CTRF: Failed to read or parse file '${file}':`, error)
    }
  }

  if (reports.length === 0) {
    console.log(
      `CTRF: No valid reports found in '${dir}' matching pattern.`
    )
  }
  return reports
}

/**
 * Merges multiple CTRF reports, computing retries and flaky from duplicate
 * test entries that result from spec file retries.
 *
 * Tests are grouped by (name + filePath). For each group:
 * - The last run's result is used as the final entry
 * - retries = number of runs - 1
 * - flaky = true if any run failed AND the final run passed
 */
function mergeReportsWithRetries(reports: CTRFReport[]): CTRFReport {
  // Sort reports by start time so spec retries are in chronological order
  const sorted = [...reports].sort(
    (a, b) => a.results.summary.start - b.results.summary.start
  )

  // Collect all tests in order across all reports
  const allTests: Test[] = []
  for (const report of sorted) {
    allTests.push(...report.results.tests)
  }

  // Group tests by (name + filePath) to detect spec file retries
  const groups = new Map<string, Test[]>()
  for (const test of allTests) {
    const key = `${test.name}::${test.filePath ?? ''}`
    const group = groups.get(key)
    if (group) {
      group.push(test)
    } else {
      groups.set(key, [test])
    }
  }

  // Resolve each group to a single test entry
  const mergedTests: Test[] = []
  for (const runs of groups.values()) {
    if (runs.length === 1) {
      mergedTests.push(runs[0])
      continue
    }

    // Multiple runs = spec file retries
    const finalRun = { ...runs[runs.length - 1] }
    const anyFailed = runs.some((r) => r.status === 'failed')
    const specRetries = runs.length - 1

    // Accumulate retries: spec-level retries + any test-level retries from final run
    finalRun.retries = specRetries + (finalRun.retries ?? 0)
    finalRun.flaky = anyFailed && finalRun.status === 'passed'

    mergedTests.push(finalRun)
  }

  // Use ctrf's calculateSummary for the merged tests
  const base = reports[0]
  let minStart = Number.MAX_SAFE_INTEGER
  let maxStop = 0
  for (const report of reports) {
    minStart = Math.min(minStart, report.results.summary.start)
    maxStop = Math.max(maxStop, report.results.summary.stop)
  }

  const summary = buildSummary(mergedTests)
  summary.start = minStart === Number.MAX_SAFE_INTEGER ? 0 : minStart
  summary.stop = maxStop

  return {
    reportFormat: 'CTRF',
    specVersion: base.specVersion ?? '0.0.0',
    reportId: generateReportId(),
    timestamp: new Date().toISOString(),
    generatedBy: base.generatedBy,
    results: {
      tool: base.results.tool,
      summary,
      tests: mergedTests,
      environment: base.results.environment,
    },
  }
}

function buildSummary(tests: Test[]): Summary {
  const summary: Summary = {
    tests: tests.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    pending: 0,
    other: 0,
    start: 0,
    stop: 0,
  }

  for (const test of tests) {
    switch (test.status) {
      case 'passed':
        summary.passed++
        break
      case 'failed':
        summary.failed++
        break
      case 'skipped':
        summary.skipped++
        break
      case 'pending':
        summary.pending++
        break
      default:
        summary.other++
        break
    }
  }

  return summary
}
