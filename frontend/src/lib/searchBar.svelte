<script>
  import {
      Input,
      Form,
      Button,
      Col,
  } from "sveltestrap"

  import { goto } from '$app/navigation'
  import { search_tags } from "$lib/stores.js"

  let temp_tags = ""

  const updateTags = (e) => {
    temp_tags = e.target.value
  }

  const search_images = async (e) => {
    e.preventDefault()
    if(temp_tags){
      const tags_arr = temp_tags.toString().split(/[\s,]/).filter(Boolean)
      search_tags.set(tags_arr)
    }
    return await goto('/search')
  }

</script>

<div class="col-9 mx-auto my-2 text-center">
    <Form on:submit={search_images} class="row" >
      <Col xs="11">
        <Input on:input={updateTags} placeholder="Search ex: tag1, tag2  tag3"/>
      </Col>
      <Col xs="1">
        <Button>Search</Button>
      </Col>
  </Form>
</div>
