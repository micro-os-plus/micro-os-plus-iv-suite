#!/usr/bin/env node
// Update all git submodules to the latest commit of their `xpack` branch.
//
// Usage: node scripts/update-submodules.mjs [options] [path...]
//
//   -b, --branch <name>  default branch to follow (default: xpack); a
//                        `branch = ...` entry in .gitmodules overrides it
//   -j, --jobs <n>       number of submodules processed in parallel
//                        (default: 8)
//   -n, --dry-run        fetch and report, but do not change anything
//   -h, --help           show this help
//
// Paths, if given, restrict the update to the matching submodules
// (prefix match, e.g. `targets` or `core/startup-xpack`).
//
// Each submodule is initialised if needed, fetched, switched to the local
// branch (created to track origin/<branch> if missing) and fast-forwarded.
// Submodules with uncommitted changes, or with local commits not yet in
// origin, are reported and left untouched.
//
// The superproject is not committed; review with `git status` and commit
// the updated submodule pointers manually.

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { parseArgs } from 'node:util'
import path from 'node:path'

const execFileAsync = promisify(execFile)

// ----------------------------------------------------------------------------

const { values: opts, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    branch: { type: 'string', short: 'b', default: 'xpack' },
    jobs: { type: 'string', short: 'j', default: '8' },
    'dry-run': { type: 'boolean', short: 'n', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
})

if (opts.help) {
  console.log(
    'Usage: node scripts/update-submodules.mjs ' +
      '[-b branch] [-j jobs] [-n] [path...]'
  )
  process.exit(0)
}

const dryRun = opts['dry-run']
const jobs = Math.max(1, parseInt(opts.jobs, 10) || 1)

// ----------------------------------------------------------------------------

async function git(cwd, ...args) {
  const { stdout } = await execFileAsync('git', args, {
    cwd,
    maxBuffer: 16 * 1024 * 1024,
  })
  return stdout.trim()
}

async function gitOk(cwd, ...args) {
  try {
    await git(cwd, ...args)
    return true
  } catch {
    return false
  }
}

const short = (sha) => (sha ? sha.slice(0, 10) : '(none)')

// The `version` from package.json at the given revision, or '-'.
async function pkgVersion(dir, rev) {
  try {
    return JSON.parse(await git(dir, 'show', `${rev}:package.json`)).version || '-'
  } catch {
    return '-'
  }
}

async function revInfo(dir, rev) {
  const [sha, version] = await Promise.all([
    git(dir, 'rev-parse', rev),
    pkgVersion(dir, rev),
  ])
  return { sha, version }
}

// Run `fn` over `items`, at most `limit` at a time, preserving order.
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

// ----------------------------------------------------------------------------

async function listSubmodules(topDir) {
  let out
  try {
    out = await git(
      topDir,
      'config',
      '--file',
      '.gitmodules',
      '--get-regexp',
      '^submodule\\..*\\.(path|branch)$'
    )
  } catch {
    return [] // No .gitmodules, or no entries.
  }

  const byName = new Map()
  for (const line of out.split('\n')) {
    const m = line.match(/^submodule\.(.+)\.(path|branch) (.+)$/)
    if (!m) continue
    const [, name, key, value] = m
    if (!byName.has(name)) byName.set(name, { name })
    byName.get(name)[key] = value
  }

  return [...byName.values()]
    .filter((s) => s.path)
    .map((s) => ({
      ...s,
      // `branch = .` means "same name as the superproject branch".
      branch: s.branch && s.branch !== '.' ? s.branch : opts.branch,
    }))
}

async function updateOne(topDir, sub) {
  const dir = path.join(topDir, sub.path)
  const { branch } = sub
  const remoteRef = `origin/${branch}`

  // Initialise if not yet cloned.
  const toplevel = await git(dir, 'rev-parse', '--show-toplevel').catch(() => '')
  if (toplevel !== dir) {
    if (dryRun) return { status: 'skip', msg: 'not initialised' }
    await git(topDir, 'submodule', 'update', '--init', '--', sub.path)
  }

  const from = await revInfo(dir, 'HEAD')

  await git(dir, 'fetch', '--quiet', '--tags', 'origin')

  if (!(await gitOk(dir, 'rev-parse', '--verify', '--quiet', remoteRef))) {
    return { status: 'error', msg: `no ${remoteRef} branch` }
  }
  const to = await revInfo(dir, remoteRef)

  const dirty = await git(dir, 'status', '--porcelain', '--untracked-files=no')
  if (dirty) {
    return { status: 'skip', from, to, notes: ['uncommitted changes'] }
  }

  const hasLocal = await gitOk(
    dir,
    'rev-parse',
    '--verify',
    '--quiet',
    `refs/heads/${branch}`
  )

  if (hasLocal) {
    const [ahead] = (
      await git(dir, 'rev-list', '--left-right', '--count', `${branch}...${remoteRef}`)
    )
      .split(/\s+/)
      .map(Number)
    if (ahead > 0) {
      return {
        status: 'skip',
        from,
        to,
        notes: [`local ${branch} has ${ahead} commit(s) not in ${remoteRef}`],
      }
    }
  }

  const current = await git(dir, 'branch', '--show-current')
  const notes = []
  if (current !== branch) notes.push(`${dryRun ? 'will switch' : 'switched'} from ${current || 'detached HEAD'}`)

  if (dryRun) {
    return { status: from.sha === to.sha ? 'same' : 'would', from, to, notes }
  }

  if (hasLocal) {
    if (current !== branch) await git(dir, 'switch', '--quiet', branch)
    await git(dir, 'merge', '--quiet', '--ff-only', remoteRef)
  } else {
    await git(dir, 'switch', '--quiet', '--track', '-c', branch, remoteRef)
  }

  const after = await revInfo(dir, 'HEAD')
  return {
    status: after.sha === from.sha ? 'same' : 'updated',
    from,
    to: after,
    notes,
  }
}

// ----------------------------------------------------------------------------

async function main() {
  const topDir = await git(process.cwd(), 'rev-parse', '--show-toplevel')

  let subs = await listSubmodules(topDir)
  if (positionals.length) {
    const filters = positionals.map((p) =>
      path.relative(topDir, path.resolve(p)).replace(/\/+$/, '')
    )
    subs = subs.filter((s) =>
      filters.some((f) => f === '' || s.path === f || s.path.startsWith(f + '/'))
    )
  }

  if (!subs.length) {
    console.log('No submodules found.')
    return 0
  }

  console.log(
    `${dryRun ? 'Checking' : 'Updating'} ${subs.length} submodule(s) ` +
      `in ${topDir}...\n`
  )

  const width = Math.max(...subs.map((s) => s.path.length))
  const labels = {
    updated: 'updated ',
    would: 'outdated',
    same: 'current ',
    skip: 'SKIPPED ',
    error: 'ERROR   ',
  }

  const results = await mapLimit(subs, jobs, async (sub) => {
    let res
    try {
      res = await updateOne(topDir, sub)
    } catch (err) {
      const msg = (err.stderr || err.message || String(err)).trim().split('\n')[0]
      res = { status: 'error', msg }
    }
    return res
  })

  // Format `a -> b` columns, or just `a` when unchanged, aligned.
  const vw = Math.max(1, ...results.flatMap((r) =>
    r.from ? [r.from.version.length, r.to.version.length] : []))
  const change = (a, b, w) =>
    a === b ? a.padEnd(2 * w + 4) : `${a.padEnd(w)} -> ${b.padEnd(w)}`

  results.forEach((res, i) => {
    const sub = subs[i]
    const cols = res.from
      ? change(res.from.version, res.to.version, vw) + '  ' +
        change(short(res.from.sha), short(res.to.sha), 10)
      : res.msg
    const notes = [
      ...(sub.branch !== opts.branch ? [`branch ${sub.branch}`] : []),
      ...(res.notes ?? []),
    ]
    console.log(
      `  ${labels[res.status]}  ${sub.path.padEnd(width)}  ${cols}` +
        (notes.length ? `  (${notes.join(', ')})` : '')
    )
  })

  const count = (st) => results.filter((r) => r.status === st).length
  console.log(
    `\n${count(dryRun ? 'would' : 'updated')} ${dryRun ? 'outdated' : 'updated'}, ` +
      `${count('same')} current, ${count('skip')} skipped, ${count('error')} failed.`
  )

  if (!dryRun && count('updated')) {
    console.log(
      '\nReview with `git status` / `git diff --submodule`, then commit, e.g.:\n' +
        '  git add ' + subs.filter((_, i) => results[i].status === 'updated')
          .map((s) => s.path).join(' ') + '\n' +
        '  git commit -m "submodules: update to latest"'
    )
  }

  return count('error') ? 1 : 0
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err.stderr?.trim() || err.message || err)
    process.exit(2)
  }
)
