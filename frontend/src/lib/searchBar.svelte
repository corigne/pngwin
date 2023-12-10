<script>
  import {
      Input,
      Form,
      Button,
      Col,
  } from "sveltestrap"

  import { goto } from '$app/navigation'
  import { page } from "$app/stores"
  import { search_tags } from "$lib/stores.js"

  let temp_tags = ($search_tags)? $search_tags : ""

  const search_images = async (e) => {
    e.preventDefault()

    if(temp_tags){
      const tags_arr = temp_tags.split(/[\s,]/).filter(Boolean)
      search_tags.set(tags_arr.join(', '))
    } else {
      console.log("Empty search tags.")
      search_tags.set("")
    }

    console.log("Search tags in (search_bar):", $search_tags)

    if( $page.url.pathname === '/') {
      return await goto('/search')
    }
  }
</script>

<Form on:submit={search_images} >
  <div class="searchbar-container">
    <Input placeholder="Search ex: tag1, tag2  tag3" bind:value={temp_tags}/>
    <Button>Search</Button>
  </div>
</Form>
