export const ShellEnvPlugin = async () => {
  return {
    "shell.env": async (_input, output) => {
      output.env.PATH = `${process.env.HOME}/.local/share/nvim/mason/bin:${process.env.PATH}`
    },
  }
}
