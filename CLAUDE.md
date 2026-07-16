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

## Skills index (`.claude/skills/`)

Project skills live in `.claude/skills/` — each is a folder with a `SKILL.md` (the instructions) plus optional `references/` files (deep detail). **Consult the skill before writing the relevant syntax; don't work from memory.** Invoke via the Skill tool to load `SKILL.md`; only Read a `references/` file when `SKILL.md` points to it for the detail you need — they're large and rarely all relevant.

| Skill | Load it when… | Deep references |
|---|---|---|
| `obsidian-markdown` | Creating or editing any `.md` note — wikilinks, embeds, callouts, frontmatter/properties, comments | `references/PROPERTIES.md` (property types), `EMBEDS.md` (embed syntax), `CALLOUTS.md` (callout types) |
| `obsidian-cli` | Any vault operation via the `obsidian` CLI — move/rename (hard rule #1), search, create, tasks, properties; also plugin/theme debugging | — (`obsidian help` is the live command list) |
| `obsidian-bases` | Touching a `.base` file — table/cards/list/map views, filters, formulas, summaries | `references/FUNCTIONS_REFERENCE.md` (formula functions) |
| `json-canvas` | Touching a `.canvas` file — nodes, edges, groups, connections | `references/EXAMPLES.md` (complete canvas examples) |
| `defuddle` | User gives a URL to read/analyze — cleaner and cheaper than WebFetch. Skip for URLs ending in `.md` | — |

Routing:
- Editing note *syntax* → `obsidian-markdown` first.
- Moving, renaming, or searching *files* → `obsidian-cli` (never `mv`, per hard rule #1).
- `.base` or `.canvas` file → the matching skill **before** opening the file; both formats break silently on invalid structure.
- Fetching a web page → `defuddle` before reaching for WebFetch.

Skill instructions cover generic Obsidian; **this file's conventions (frontmatter schema, naming, tags) are vault policy and win on conflict.**

## Obsidian Markdown format

Obsidian is standard Markdown plus extensions — full syntax lives in the `obsidian-markdown` skill. What follows is **this vault's policy**:

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

## Naming conventions

The author has specific preferences here — follow them for every new file and folder, and match them when renaming (via the Obsidian CLI, per hard rule #1).

- **Folders: `snake_case`.** Lowercase words joined by underscores, e.g. `my_folder_name`, `daily_notes`, `project_archive`. No spaces, no capitals, no hyphens in folder names.
- **Filenames: no spaces.** Either of these two styles is acceptable, pick whichever reads best for the note:
  - `PascalCase` — e.g. `BlahFileName.md`, `SourdoughRecipe.md`
  - `kebab-case` — e.g. `blah-file-name.md`, `sourdough-recipe.md`
- Don't mix separators inside a single filename (avoid `Blah_file-name.md`).
- No dates in the title unless the note is a daily or meeting note.
- The filename is the `[[wikilink]]` target and the H1, so keep it descriptive and readable.

### Other syntax
- Headings start at `##` — the H1 is the filename.
- Diagrams: ```mermaid``` fenced blocks, rendered natively. Prefer mermaid over prose for a flow, schema, or sequence. Don't add diagram plugins.
- Callouts, embeds, math, comments, task lists: see the `obsidian-markdown` skill.

## Obsidian CLI

The Obsidian desktop app ships a CLI (`obsidian ...`, v1.12.7+) that runs operations **through Obsidian's API** — so moves and renames preserve `[[wikilinks]]`. This is the **only safe way** for you to move/rename notes.

**Availability:** it must be enabled (Settings → General → Command line interface) and the app must be running. First check that it works — e.g. `obsidian --help` or a harmless `obsidian search query="test" limit=1`. If it errors with "Command line interface is not enabled" or isn't on PATH, do **not** use `mv`/`git mv`; ask the user to enable it or perform the move in the UI.

The safety-critical commands:
```shell
# Move / rename (LINK-PRESERVING — use these instead of mv/git mv)
obsidian move file="Recipe" to="30-resources/"      # move a note, updating links
obsidian rename file="Recipe" name="Sourdough"      # rename, updating links
```
For everything else (create, read, search, templates, delete, tasks, properties — 100+ subcommands), load the `obsidian-cli` skill; it covers parameter syntax and the full command surface. `obsidian help` is always current.

## Enabled plugins

- **Core:** Canvas (`.canvas` JSON — preserve node `id`s/coords exactly; `json-canvas` skill), Daily Notes, Templates, **Bases** (`.base` DB views — don't break `base` query blocks; `obsidian-bases` skill), Properties, Graph/Backlinks/Outgoing links/Tag pane/Outline/Bookmarks, Global search, Quick switcher, Sync, File recovery.
- **Community:** `obsidian-git` (auto-commits & syncs — prefer incremental, commit-worthy changes), `terminal` (in-app shell), `realclaudian` (this assistant).
- If ```dataview``` or ```base``` query blocks appear in a note, don't break them unless asked to change the query.

## How to work here

- **Preserve the author's voice.** These are personal notes — don't smooth them into corporate prose or add throat-clearing intros/conclusions.
- **No filler.** Skip "In this note we will explore." State the thing.
- **Uncertainty stays visible.** If a note records an open question, leave it open. Don't resolve it with a guess.
- **Filenames & folders:** follow the [Naming conventions](#naming-conventions) above — `snake_case` folders, no-spaces filenames (`PascalCase` or `kebab-case`).
- **Broken links:** flag them rather than silently creating stub notes.
- **Before destructive actions** (delete, mass rename, overwrite): explain the impact and confirm.

## Current state (as of 2026-07-15)

Newly initialized vault; existing files are placeholder/scaffolding (`Welcome.md`, `README.md` stub, `test_folder/`, empty `Canvas Folder/`). Safe to clean up or repurpose as the vault grows. No folder taxonomy is settled yet — propose one before imposing structure.

## Maintaining this file

Keep it reasonably tight; it loads every session. If a rule hasn't been needed in a month, delete it. If the user corrects the same mistake twice, add it here.
