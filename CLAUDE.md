# CLAUDE.md — knowledgebase vault

This is an **Obsidian vault**, not a code repository — a personal and business knowledge base of plain Markdown notes, git-backed via the `obsidian-git` plugin. Optimize for durable, human-readable notes over clever automation. Read this file before making changes.

- **Vault root** = the current working directory. Use **relative paths** for all vault files (`notes/idea.md`), never a leading `/` or an absolute path.
- Content is plain-text **Markdown** (`.md`). Folders provide the primary home; `[[wikilinks]]` provide connection.

## Hard rules

1. **Never move or rename a note with `mv` or `git mv`.** A filesystem-level move silently breaks every inbound `[[wikilink]]`. Obsidian only rewrites links when *Obsidian* performs the move. To rename/move, use the **Obsidian CLI** (see below) so the operation goes through Obsidian's API. If the CLI is unavailable, tell the user and let them do it in the UI — do not fall back to `mv`.
2. **Never touch `.obsidian/`.** That is app config, plugin state, and per-device workspace. Also leave `.trash/`, `.claudian/`, and `.git/` alone.
3. **Do not bulk-restructure without asking.** Retagging, reorganizing, or splitting notes across many files needs approval first. Propose the plan, wait, then execute.
4. **Do not create index or MOC (Map of Content) notes unprompted.** They go stale and pollute the graph.
5. **Preserve frontmatter.** When editing a note, do not drop, reorder, or reformat existing frontmatter keys.
6. **Small diffs.** Edit the paragraph, not the whole note. Rewrites destroy the record of what the author actually thought.

## Obsidian Markdown format

Obsidian is standard Markdown plus extensions. Use these idioms:

### Frontmatter (YAML properties)
Metadata sits at the very top of a note, fenced by `---`. Every non-daily note gets at minimum:
```yaml
---
title:
created: YYYY-MM-DD
tags: []
status: seed | growing | stable
---
```
Add `project:`, `source:`, or `url:` when relevant. Keys must be lowercase. Do not invent new keys without asking. Tags here are written **without** the `#`.

### Links
- Internal: `[[Note Name]]`, `[[Note Name|display text]]`, heading `[[Note#Heading]]`, block `[[Note#^blockid]]`. Prefer these over `[markdown](links.md)`.
- Embed/transclude: `![[Note]]`, `![[Note#Heading]]`.
- Link liberally — a note with no inbound links is invisible. When synthesizing across notes, link the sources; a claim without a `[[link]]` back to its origin is unverifiable later.
- This vault has `alwaysUpdateLinks: true`, so Obsidian auto-updates links on renames it performs — which is exactly why renames must go through Obsidian, not the filesystem.

### Tags
Nested, lowercase, hyphenated: `#topic/sub-topic`. Tags are cross-cutting facets; folders are the primary home. If a tag would apply to fewer than three notes, don't create it.

### Attachments & media
Everything binary goes in `attachments/`, embedded with `![[file.png]]` / `![[file.pdf]]`. Page-specific references: `![[file.pdf#page=7]]`. Never inline binaries elsewhere.

### Other syntax
- Headings start at `##` — the H1 is the filename.
- Callouts: `> [!note]`, `> [!warning]`, `> [!tip]` (add `-`/`+` for collapsible).
- Task lists: `- [ ]` / `- [x]`.
- Math (LaTeX): inline `$x^2$`, block `$$...$$`.
- Diagrams: ```mermaid``` fenced blocks, rendered natively. Prefer mermaid over prose for a flow, schema, or sequence. Don't add diagram plugins.
- Hidden comments: `%% not shown in preview %%`.

## Obsidian CLI

The Obsidian desktop app ships a CLI (`obsidian ...`, v1.12.7+) that runs operations **through Obsidian's API** — so moves and renames preserve `[[wikilinks]]`. This is the **only safe way** for you to move/rename notes.

**Availability:** it must be enabled (Settings → General → Command line interface) and the app must be running. First check that it works — e.g. `obsidian --help` or a harmless `obsidian search query="test" limit=1`. If it errors with "Command line interface is not enabled" or isn't on PATH, do **not** use `mv`/`git mv`; ask the user to enable it or perform the move in the UI.

**Parameter format:** `parameter=value` (quote values with spaces: `name="My Note"`). Flags like `open`, `overwrite`, `permanent` are bare switches. Target files with `file=<name>` (wikilink resolution) or `path="exact/path.md"`.

Common tasks:
```shell
# Move / rename (LINK-PRESERVING — use these instead of mv/git mv)
obsidian move file="Recipe" to="30-resources/"      # move a note, updating links
obsidian rename file="Recipe" name="Sourdough"      # rename, updating links

# Create notes
obsidian create name="Meeting notes" content="..."  # new note with content
obsidian create name="Trip" template="Travel" open  # from a template, then open

# Read / open
obsidian read file="Recipe"                          # print a note's content
obsidian open path="10-projects/Launch.md"           # open in the app

# Search (vault-aware)
obsidian search query="bottleneck" limit=10          # search notes
obsidian search:context query="TODO"                 # grep-style contextual output

# Templates
obsidian templates                                   # list available templates
obsidian template:read name="Meeting"                # print a template

# Delete
obsidian delete file="Scratch"                       # move to trash (recoverable)
obsidian delete file="Scratch" permanent             # delete permanently
```
There are 100+ subcommands; run `obsidian --help` (or `obsidian <group> --help`) to discover more.

## Enabled plugins

- **Core:** Canvas (`.canvas` JSON — preserve node `id`s/coords exactly), Daily Notes, Templates, **Bases** (`.base` DB views — don't break `base` query blocks), Properties, Graph/Backlinks/Outgoing links/Tag pane/Outline/Bookmarks, Global search, Quick switcher, Sync, File recovery.
- **Community:** `obsidian-git` (auto-commits & syncs — prefer incremental, commit-worthy changes), `terminal` (in-app shell), `realclaudian` (this assistant).
- If ```dataview``` or ```base``` query blocks appear in a note, don't break them unless asked to change the query.

## How to work here

- **Preserve the author's voice.** These are personal notes — don't smooth them into corporate prose or add throat-clearing intros/conclusions.
- **No filler.** Skip "In this note we will explore." State the thing.
- **Uncertainty stays visible.** If a note records an open question, leave it open. Don't resolve it with a guess.
- **Filenames:** sentence case, spaces allowed, no dates in the title unless it's a daily/meeting note. The title is the link target — it should read naturally inside a sentence.
- **Broken links:** flag them rather than silently creating stub notes.
- **Before destructive actions** (delete, mass rename, overwrite): explain the impact and confirm.

## Current state (as of 2026-07-15)

Newly initialized vault; existing files are placeholder/scaffolding (`Welcome.md`, `README.md` stub, `test_folder/`, empty `Canvas Folder/`). Safe to clean up or repurpose as the vault grows. No folder taxonomy is settled yet — propose one before imposing structure.

## Maintaining this file

Keep it reasonably tight; it loads every session. If a rule hasn't been needed in a month, delete it. If the user corrects the same mistake twice, add it here.
