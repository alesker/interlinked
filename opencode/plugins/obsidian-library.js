import { execFile } from "node:child_process"
import { readdir } from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"

const execute = promisify(execFile)

function kebabCase(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1-$2")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
}

export default {
  id: "interlinked.obsidian-library",
  async setup(ctx) {
    const scan = async () => {
      const { stdout } = await execute("obsidian", ["vaults", "verbose"], {
        timeout: 10_000,
        maxBuffer: 4 * 1024 * 1024
      })
      const directories = new Map(
        stdout
          .trim()
          .split(/\r?\n/)
          .filter((line) => line.length > 0)
          .map((line) => line.split("\t"))
      )
      const libraries = await Promise.all(
        [...directories].map(async ([vault, directory]) => {
          if (!directory || !path.isAbsolute(directory)) {
            throw new Error(`Cannot resolve Obsidian vault ${vault}: ${directory}`)
          }
          const files = await readdir(directory, { recursive: true, withFileTypes: true })
          return files
            .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
            .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)))
            .filter((filename) => !filename.split(path.sep).some((part) => part.startsWith(".")))
            .sort()
            .map((filename) => ({
              name: kebabCase(`${vault}-${filename.replace(/\.md$/i, "")}`),
              path: path.join(directory, filename)
            }))
        })
      )
      return libraries.flat()
    }

    let notes = await scan()
    const registration = await ctx.reference.transform((editor) => {
      for (const note of notes) {
        if (editor.get(note.name)) {
          throw new Error(`Obsidian reference collision: ${note.name} (${note.path})`)
        }
        editor.add(note.name, { type: "local", path: note.path })
      }
    })

    let stopped = false
    let refreshing = false
    let pending = Promise.resolve()
    const timer = setInterval(() => {
      if (refreshing) return
      refreshing = true
      pending = (async () => {
        const next = await scan()
        if (stopped || JSON.stringify(next) === JSON.stringify(notes)) return
        const previous = notes
        notes = next
        try {
          await ctx.reference.reload()
        } catch (error) {
          notes = previous
          throw error
        }
      })()
        .catch((error) => console.warn(`[obsidian-library] ${error.message}`))
        .finally(() => {
          refreshing = false
        })
    }, 30_000)
    timer.unref()

    return async () => {
      stopped = true
      clearInterval(timer)
      await pending
      await registration.dispose()
    }
  }
}
