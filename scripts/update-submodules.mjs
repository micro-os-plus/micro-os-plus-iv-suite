#!/usr/bin/env node
// Update all git submodules to the latest commit of their `xpack` branch.
//
// Usage: node scripts/update-submodules.mjs [options] [path...]
//
//   -b, --branch <name>  default branch to follow (default: xpack); a
//                        `branch = ...` entry in .gitmodules overrides it
//   -j, --jobs <n>       number of parallel fetches (default: 8)
//   -n, --dry-run        fetch and report, but do not change anything
//   -h, --help           show this help
//
// Paths, if given, restrict the update to the matching submodules
// (prefix match, e.g. `targets` or `core/startup`).
//
// Uninitialised submodules are cloned, then all submodules are fetched in
// parallel by git. Each one is then switched to the local branch (created
// to track origin/<branch> if missing) and fast-forwarded. Submodules with
// uncommitted changes, or with local commits not yet in origin, are
// reported and left untouched.
//
// The superproject is not committed; review with `git status` and commit
// the updated submodule pointers manually.

import { execFileSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import path from 'node:path'

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

function git(cwd, ...args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 16 * 1024 * 1024,
  }).trim()
}

const short = (sha) => (sha ? sha.slice(0, 10) : '(none)')

// The `version` from package.json at the given revision, or '-'.
function pkgVersion(dir, rev) {
  try {
    return JSON.parse(git(dir, 'show', `${rev}:package.json`)).version || '-'
  } catch {
    return '-'
  }
}

// ----------------------------------------------------------------------------

function listSubmodules(topDir) {
  let out
  try {
    out = git(
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
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
}

function isInitialised(topDir, sub) {
  const dir = path.join(topDir, sub.path)
  try {
    return git(dir, 'rev-parse', '--show-toplevel') === dir
  } catch {
    return false
  }
}

// Called after fetching; brings one submodule to origin/<branch>.
// Each git call costs ~20 ms to spawn, so they are kept to a minimum.
function updateOne(topDir, sub) {
  const dir = path.join(topDir, sub.path)
  const { branch } = sub
  const remoteRef = `origin/${branch}`

  // Current commit, current branch and uncommitted changes, in one call.
  let headSha = ''
  let current = ''
  let dirty = false
  for (const line of git(
    dir,
    'status',
    '--porcelain=v2',
    '--branch',
    '--untracked-files=no'
  ).split('\n')) {
    if (line.startsWith('# branch.oid ')) headSha = line.slice(13)
    else if (line.startsWith('# branch.head ')) current = line.slice(14)
    else if (line && !line.startsWith('#')) dirty = true
  }
  if (current === '(detached)') current = ''

  // Local and remote branch commits, in one call.
  const refs = new Map(
    git(
      dir,
      'for-each-ref',
      '--format=%(refname) %(objectname)',
      `refs/heads/${branch}`,
      `refs/remotes/${remoteRef}`
    )
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split(' '))
  )
  const localSha = refs.get(`refs/heads/${branch}`)
  const remoteSha = refs.get(`refs/remotes/${remoteRef}`)

  if (!remoteSha) {
    return { status: 'error', msg: `no ${remoteRef} branch` }
  }

  const from = { sha: headSha, version: pkgVersion(dir, 'HEAD') }
  const to = {
    sha: remoteSha,
    version: remoteSha === headSha ? from.version : pkgVersion(dir, remoteRef),
  }

  if (dirty) {
    return { status: 'skip', from, to, notes: ['uncommitted changes'] }
  }

  if (localSha && localSha !== remoteSha) {
    const ahead = Number(
      git(dir, 'rev-list', '--count', `${remoteRef}..refs/heads/${branch}`)
    )
    if (ahead > 0) {
      return {
        status: 'skip',
        from,
        to,
        notes: [`local ${branch} has ${ahead} commit(s) not in ${remoteRef}`],
      }
    }
  }

  const notes = []
  if (current !== branch) {
    notes.push(
      `${dryRun ? 'will switch' : 'switched'} from ${current || 'detached HEAD'}`
    )
  }

  if (dryRun) {
    return { status: from.sha === to.sha ? 'same' : 'would', from, to, notes }
  }

  if (localSha) {
    if (current !== branch) git(dir, 'switch', '--quiet', branch)
    if (localSha !== remoteSha) {
      git(dir, 'merge', '--quiet', '--ff-only', remoteRef)
    }
  } else {
    git(dir, 'switch', '--quiet', '--track', '-c', branch, remoteRef)
  }

  // A successful fast-forward leaves HEAD at origin/<branch>.
  return { status: from.sha === to.sha ? 'same' : 'updated', from, to, notes }
}

// ----------------------------------------------------------------------------

function main() {
  const topDir = git(process.cwd(), 'rev-parse', '--show-toplevel')

  let subs = listSubmodules(topDir)
  if (positionals.length) {
    const filters = positionals.map((p) =>
      path.relative(topDir, path.resolve(p)).replace(/\/+$/, '')
    )
    subs = subs.filter((s) =>
      filters.some(
        (f) => f === '' || s.path === f || s.path.startsWith(f + '/')
      )
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

  // Clone missing submodules first, since only populated ones are fetched.
  const missing = subs.filter((s) => !isInitialised(topDir, s))
  if (missing.length && dryRun) {
    subs.forEach((s) => (s.missing = missing.includes(s)))
  } else if (missing.length) {
    git(
      topDir,
      'submodule',
      'update',
      '--init',
      `--jobs=${jobs}`,
      '--',
      ...missing.map((s) => s.path)
    )
  }

  // A single parallel fetch of all populated submodules (and the
  // superproject); everything after this is local.
  git(topDir, 'fetch', '--quiet', '--recurse-submodules=yes', `--jobs=${jobs}`)

  const labels = {
    updated: 'updated ',
    would: 'outdated',
    same: 'current ',
    skip: 'SKIPPED ',
    error: 'ERROR   ',
  }

  const results = subs.map((sub) => {
    if (sub.missing) return { status: 'skip', msg: 'not initialised' }
    try {
      return updateOne(topDir, sub)
    } catch (err) {
      const msg = (err.stderr || err.message || String(err))
        .trim()
        .split('\n')[0]
      return { status: 'error', msg }
    }
  })

  // Format `a -> b` columns, or just `a` when unchanged, aligned.
  const width = Math.max(...subs.map((s) => s.path.length))
  const vw = Math.max(
    1,
    ...results.flatMap((r) =>
      r.from ? [r.from.version.length, r.to.version.length] : []
    )
  )
  const change = (a, b, w) =>
    a === b ? a.padEnd(2 * w + 4) : `${a.padEnd(w)} -> ${b.padEnd(w)}`

  results.forEach((res, i) => {
    const sub = subs[i]
    const cols = res.from
      ? change(res.from.version, res.to.version, vw) +
        '  ' +
        change(short(res.from.sha), short(res.to.sha), 10)
      : res.msg
    const notes = [
      ...(sub.branch !== opts.branch ? [`branch ${sub.branch}`] : []),
      ...(res.notes ?? []),
    ]
    console.log(
      (
        `  ${labels[res.status]}  ${sub.path.padEnd(width)}  ${cols}` +
        (notes.length ? `  (${notes.join(', ')})` : '')
      ).trimEnd()
    )
  })

  const count = (st) => results.filter((r) => r.status === st).length
  console.log(
    `\n${count(dryRun ? 'would' : 'updated')} ${dryRun ? 'outdated' : 'updated'}, ` +
      `${count('same')} current, ${count('skip')} skipped, ${count('error')} failed.`
  )

  if (!dryRun && count('updated')) {
    const updated = subs.filter((_, i) => results[i].status === 'updated')
    console.log(
      '\nReview with `git status` / `git diff --submodule`, then commit, e.g.:\n' +
        `  git add ${updated.map((s) => s.path).join(' ')}\n` +
        '  git commit -m "submodules: update to latest"'
    )
  }

  return count('error') ? 1 : 0
}

try {
  process.exit(main())
} catch (err) {
  console.error(err.stderr?.trim() || err.message || err)
  process.exit(2)
}
