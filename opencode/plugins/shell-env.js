export default {
  id: "interlinked.shell-env",
  async setup(ctx) {
    await ctx.shell.hook("create.before", (event) => {
      event.env.PATH = `${process.env.HOME}/.local/share/nvim/mason/bin:${process.env.PATH}`
    })
  },
}
