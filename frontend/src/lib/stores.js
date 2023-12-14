import { writable } from "svelte/store"

const darkmode = writable(false)
const logged_in = writable(false)
const user = writable(null)
const search_tags = writable(null)

export { darkmode, logged_in, search_tags, user }
