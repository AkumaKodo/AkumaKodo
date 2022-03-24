# Todo list for framework

- [ ] Split internal events so users can have a more custom handler
- [ ] Add more permission checks to our command handler (cooldowns, ownerOnly, etc)

# Current big problems

- Slash Commands are updated on every application connection. We need to change this and somehow make it so their only deployed when changed or updated.
- 